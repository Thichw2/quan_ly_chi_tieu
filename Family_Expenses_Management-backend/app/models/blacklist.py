# app/models/blacklist.py
from pydantic import BaseModel, Field
from datetime import datetime

class TokenBlacklist(BaseModel):
    id: str = Field(alias="_id")
    jti: str
    expires: datetime

    class Config:
        from_attributes = True
        populate_by_name = True  # Thay thế từ 'allow_population_by_field_name'
