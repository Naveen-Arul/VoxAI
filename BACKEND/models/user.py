from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime, date

class UserBase(BaseModel):
    email: EmailStr
    name: str
    mobile: str
    date_of_birth: date
    gender: str  # "male", "female", "other"
    country: str
    profile_photo: Optional[str] = None  # URL or base64 string

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    mobile: Optional[str] = None
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None
    country: Optional[str] = None

class User(UserBase):
    id: str
    created_at: datetime

class UserInDB(User):
    password_hash: str