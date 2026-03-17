# app/schemas/expense_category.py
from pydantic import BaseModel, Field
from typing import Optional

class ExpenseCategoryCreate(BaseModel):
    name: str

class ExpenseCategoryOut(BaseModel):
    id: str = Field(alias="_id")
    name: str
    family_id: str

    class Config:
        orm_mode = True
        populate_by_name = True  # Đã thay thế từ 'allow_population_by_field_name'
