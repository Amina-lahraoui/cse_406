from pydantic import BaseModel, EmailStr
from typing import Optional

class UserBase(BaseModel):
    email: EmailStr
    language: Optional[str] = "en"

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    language: Optional[str] = None

class UserAuth(BaseModel):
    email: EmailStr
    password: str
    
    class Config:
        json_schema_extra = {
            "example": {
                "email": "user@example.com",
                "password": "motdepasse123"
            }
        }

class UserResponse(UserBase):
    id: int
    
    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: "UserResponse"
    
    class Config:
        from_attributes = True