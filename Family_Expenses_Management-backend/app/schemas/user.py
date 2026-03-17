# app/schemas/user.py
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Dict

class UserCreate(BaseModel):
    fullname: str
    username: str
    password: str
    email: EmailStr
    role: str
    specific_role: Optional[str]

class UserCreateAdmin(BaseModel):
    fullname: str
    username: str
    password: str
    email: EmailStr
    role: str  # 'admin', 'parent', 'child'
    specific_role: Optional[str]

class UserLogin(BaseModel):
    username: str
    password: str

class UserOut(BaseModel):
    id: str = Field(alias="_id")
    fullname: str
    username: str
    email: EmailStr
    role: str
    specific_role: Optional[str]
    family_id: Optional[str]
    notification_settings: Optional[Dict[str, bool]] = {
        "email": True,
        "system": True
    }

    class Config:
        from_attributes = True
        populate_by_name = True  # Đã thay thế từ 'allow_population_by_field_name'

class Token(BaseModel):
    access_token: str
    token_type: str
