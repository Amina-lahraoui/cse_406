from pydantic import BaseModel, EmailStr
from typing import Optional


class UserBase(BaseModel):
    email: EmailStr
    language: Optional[str] = "en"

class UserCreate(UserBase):
    name: str
    password: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    language: Optional[str] = None

class UserResponse(UserBase):
    id: int
    name: str
    language: str
    
    class Config:
        from_attributes = True

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: "UserResponse"
    
    class Config:
        from_attributes = True

class PhotoUploadRequest(BaseModel):
    image: str
    source: str

class PhotoResponse(BaseModel):
    id: int
    filename: str
    s3_url: str
    source: str
    uploaded_at: str
    
    class Config:
        from_attributes = True