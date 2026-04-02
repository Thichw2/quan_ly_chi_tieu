from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Dict

class UserOut(BaseModel):
    id: str = Field(alias="_id")
    fullname: str
    username: str
    email: EmailStr
    role: str
    specific_role: Optional[str]
    family_id: Optional[str]
    is_active: bool
    notification_settings: Optional[Dict[str, bool]]

    class Config:
        from_attributes = True
        populate_by_name = True