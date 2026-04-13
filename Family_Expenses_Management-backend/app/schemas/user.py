from pydantic import BaseModel, Field, EmailStr
from typing import Optional, Dict
from datetime import datetime

# --- Base Schemas ---
class UserBase(BaseModel):
    fullname: str
    username: str
    email: EmailStr
    role: str  # 'admin', 'parent', 'child'
    specific_role: Optional[str] = None
    family_id: Optional[str] = None

# --- Auth & Token Schemas ---
class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

# --- Create Schemas ---
class UserCreate(UserBase):
    password: str

class UserCreateAdmin(UserCreate):
    # If admins need extra fields during creation, add them here
    is_superuser: bool = True

# --- Response Schemas ---
class UserOut(UserBase):
    id: str = Field(alias="_id")
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True
        populate_by_name = True

# --- Database Model (Internal) ---
class User(UserBase):
    id: str = Field(alias="_id")
    password: str
    is_active: bool = False 
    otp_code: Optional[str] = None 
    created_at: datetime = Field(default_factory=datetime.utcnow) 
    notification_settings: Optional[Dict[str, bool]] = {
        "email": True,
        "system": True  
    }

    class Config:
        from_attributes = True
        populate_by_name = True