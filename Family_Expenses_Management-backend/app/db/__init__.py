# app/db/__init__.py
from .client import (
    users_collection,
    families_collection,
    expense_categories_collection,
    expenses_collection,
    budgets_collection,
    notifications_collection,
    budget_requests_collection,
    token_blacklist_collection,
)

# app/db/__init__.py
from motor.motor_asyncio import AsyncIOMotorClient
import os

client = AsyncIOMotorClient(os.getenv("MONGODB_URL"))
db = client.family_expense_db  # <--- ĐÂY LÀ DÒNG BẠN ĐANG THIẾU

users_collection = db.users
families_collection = db.families
# Thêm các collection khác nếu cần