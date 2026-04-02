# app/schemas/member_data.py

from pydantic import BaseModel
from typing import List

class MemberCategoryData(BaseModel):
    name: str
    value: float

class MemberData(BaseModel):
    totalBudget: float
    totalSpent: float
    categoryData: List[MemberCategoryData]

class MemberDataMap(BaseModel):
    members: dict[str, MemberData]

    class Config:
        orm_mode = True
        populate_by_name = True
