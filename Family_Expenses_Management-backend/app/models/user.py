# app/models/user.py
from pydantic import BaseModel, Field, EmailStr
from typing import Optional, Dict

class User(BaseModel):
    id: str = Field(alias="_id")
    fullname: str
    username: str
    password: str
    email: EmailStr
    role: str  # 'admin', 'parent', 'child'
    specific_role: Optional[str]
    family_id: Optional[str]
    notification_settings: Optional[Dict[str, bool]] = {
        "email": True,
        "system": True  # Nếu bạn không sử dụng "system" nữa, hãy xóa hoặc cập nhật
    }

    class Config:
        from_attributes = True
        populate_by_name = True
