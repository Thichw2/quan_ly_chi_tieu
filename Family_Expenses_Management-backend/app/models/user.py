from pydantic import BaseModel, Field, EmailStr
from typing import Optional, Dict
from datetime import datetime

class User(BaseModel):
    id: str = Field(alias="_id")
    fullname: str
    username: str
    password: str
    email: EmailStr
    role: str  # 'admin', 'parent', 'child'
    specific_role: Optional[str] = None
    family_id: Optional[str] = None
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