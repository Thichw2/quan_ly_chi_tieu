# app/models/family.py
from pydantic import BaseModel, Field
from typing import List

class Family(BaseModel):
    id: str = Field(alias="_id")
    name: str
    members: List[str]

    class Config:
        from_attributes = True
        populate_by_name = True  # Đã thay thế từ 'allow_population_by_field_name'
