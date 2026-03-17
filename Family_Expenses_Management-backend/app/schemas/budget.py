# app/schemas/budget.py
from pydantic import BaseModel, Field
from typing import Optional

class BudgetCreate(BaseModel):
    user_id: Optional[str] = None
    category_id: Optional[str] = None
    amount: float
    month: int
    year: int

class BudgetOut(BaseModel):
    id: str = Field(alias="_id")
    family_id: str
    user_id: Optional[str] = None
    fullname: Optional[str]
    category_id: Optional[str] = None
    category_name: Optional[str]
    amount: float
    month: int
    year: int

    class Config:
        orm_mode = True
        populate_by_name = True  # Đã thay thế từ 'allow_population_by_field_name'
