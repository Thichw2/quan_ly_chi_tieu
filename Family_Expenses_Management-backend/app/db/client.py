# app/db/client.py
from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings

client = AsyncIOMotorClient(settings.MONGODB_URI)
db = client[settings.MONGODB_DB_NAME]

users_collection = db.get_collection("users")
families_collection = db.get_collection("families")
expense_categories_collection = db.get_collection("expense_categories")
expenses_collection = db.get_collection("expenses")
budgets_collection = db.get_collection("budgets")
notifications_collection = db.get_collection("notifications")
budget_requests_collection = db.get_collection("budget_requests")
token_blacklist_collection = db.get_collection("token_blacklist")