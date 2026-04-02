# app/models/budget.py
from pydantic import BaseModel, Field
from typing import Optional

class Budget(BaseModel):
    id: str = Field(alias="_id")
    family_id: str
    user_id: Optional[str]
    category_id: Optional[str]
    amount: float
    month: int  # 1-12
    year: int

    class Config:
        from_attributes = True
        populate_by_name = True  # Đã thay thế từ 'allow_population_by_field_name'
