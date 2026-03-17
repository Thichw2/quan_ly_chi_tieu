# app/models/expense_category.py
from pydantic import BaseModel, Field
from typing import Optional

class ExpenseCategory(BaseModel):
    id: str = Field(alias="_id")
    name: str
    family_id: str  # Liên kết với gia đình

    class Config:
        from_attributes = True
        populate_by_name = True  # Đã thay thế từ 'allow_population_by_field_name'
