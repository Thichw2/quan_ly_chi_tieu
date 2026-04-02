# app/schemas/family_data.py

from pydantic import BaseModel
from typing import List

class CategoryData(BaseModel):
    name: str
    value: float

class MemberSpentData(BaseModel):
    name: str
    amount: float

class RecentExpense(BaseModel):
    id: str
    name: str
    amount: float
    category: str
    member: str

class FamilyData(BaseModel):
    totalBudget: float
    totalSpent: float
    categoryData: List[CategoryData]
    memberData: List[MemberSpentData]
    recentExpenses: List[RecentExpense]  # Thêm trường này

    class Config:
        orm_mode = True
        populate_by_name = True
