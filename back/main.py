from datetime import datetime, timedelta, timezone
from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException, status, Cookie, Response, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from fastapi.responses import JSONResponse
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from s3_service import s3_service
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session
import models
import schemas
from db import engine, get_db
import os

app = FastAPI(title="Smart Sorting API")

models.Base.metadata.create_all(bind=engine)

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def get_current_user_from_cookie(access_token: Optional[str] = Cookie(None), db: Session = Depends(get_db)):
    if not access_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    
    try:
        payload = jwt.decode(access_token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user = db.query(models.User).filter(models.User.id == int(user_id)).first()
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    
    return user

@app.exception_handler(RateLimitExceeded)
def rate_limit_handler(request: Request, exc: RateLimitExceeded):
    return JSONResponse(status_code=429)

@app.get("/")
async def root():
    return {"message": "Smart Sorting API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "database": "connected"}

@app.post("/users/", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = pwd_context.hash(user.password)
    
    db_user = models.User(
        name=user.name,
        email=user.email,
        hashed_password=hashed_password,
        language=user.language or "en"
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.get("/users/", response_model=List[schemas.UserResponse])
def get_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    users = db.query(models.User).offset(skip).limit(limit).all()
    return users

@app.get("/users/me", response_model=schemas.UserResponse)
def get_current_user_info(current_user: models.User = Depends(get_current_user_from_cookie)):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "name": current_user.name,
        "language": current_user.language
    }

@app.get("/users/{user_id}", response_model=schemas.UserResponse)
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@app.put("/users/{user_id}", response_model=schemas.UserResponse)
def update_user(user_id: int, user_update: schemas.UserUpdate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    update_data = user_update.model_dump(exclude_unset=True)

    if "password" in update_data:
        update_data["hashed_password"] = pwd_context.hash(update_data.pop("password"))
    
    for key, value in update_data.items():
        setattr(db_user, key, value)
    
    db.commit()
    db.refresh(db_user)
    return db_user

@app.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(user_id: int, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    db.delete(db_user)
    db.commit()
    return None

limiter = Limiter(key_func=get_remote_address)
@app.post("/auth/login", response_model=schemas.TokenResponse)
@limiter.limit("5/minute")
def login(request: Request, credentials: schemas.LoginRequest, response: Response, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == credentials.email).first()
    
    if not user or not pwd_context.verify(credentials.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password")
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id), "email": user.email},
        expires_delta=access_token_expires
    )

    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=True,
        samesite="lax",
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )
    
    return schemas.TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=schemas.UserResponse(
            id=user.id,
            email=user.email,
            name=user.name, 
            language=user.language
        )
    )

@app.post("/auth/logout")
def logout(response: Response):
    response.delete_cookie(key="access_token")
    return {"message": "Logout successful"}

@app.post("/photos/upload")
def upload_photo(request: schemas.PhotoUploadRequest, current_user: models.User = Depends(get_current_user_from_cookie), db: Session = Depends(get_db)):
    try:
        if not request.image:
            raise HTTPException(status_code=400, detail="Image manquante")
        if request.source not in ["capture", "import"]:
            raise HTTPException(status_code=400, detail="Source invalide")
        
        s3_result = s3_service.upload_image(
            image_base64=request.image,
            user_id=current_user.id,
            source=request.source
        )
        
        db_photo = models.Photo(
            user_id=current_user.id,
            filename=s3_result["filename"],
            s3_url=s3_result["s3_url"],
            source=request.source
        )
        db.add(db_photo)
        db.commit()
        db.refresh(db_photo)
        
        return {
            "id": db_photo.id,
            "filename": db_photo.filename,
            "s3_url": db_photo.s3_url,
            "message": "Photo uploadée avec succès"
        }
    
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erreur serveur: {str(e)}")

@app.get("/photos", response_model=list[schemas.PhotoResponse])
def get_user_photos(skip: int = 0, limit: int = 50, current_user: models.User = Depends(get_current_user_from_cookie), db: Session = Depends(get_db)):
    photos = db.query(models.Photo).filter(
        models.Photo.user_id == current_user.id
    ).order_by(
        models.Photo.uploaded_at.desc()
    ).offset(skip).limit(limit).all()
    
    return photos

@app.delete("/photos/{photo_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_photo( photo_id: int, current_user: models.User = Depends(get_current_user_from_cookie), db: Session = Depends(get_db)):
    try:
        photo = db.query(models.Photo).filter(
            models.Photo.id == photo_id,
            models.Photo.user_id == current_user.id
        ).first()
        
        if not photo:
            raise HTTPException(status_code=404, detail="Photo non trouvée")
        
        try:
            s3_service.s3_client.delete_object(
                Bucket=s3_service.bucket_name,
                Key=photo.filename
            )
        except Exception as e:
            print(f"Erreur suppression S3: {e}")
        
        db.delete(photo)
        db.commit()
        
        return None
    
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))