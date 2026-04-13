import logging
from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings
import pymongo

# Thiết lập logging để theo dõi việc tạo Index
logger = logging.getLogger(__name__)

client = AsyncIOMotorClient(settings.MONGODB_URI)
db = client[settings.MONGODB_DB_NAME]

# Định nghĩa các collections
users_collection = db.get_collection("users")
families_collection = db.get_collection("families")
expense_categories_collection = db.get_collection("expense_categories")
expenses_collection = db.get_collection("expenses")
budgets_collection = db.get_collection("budgets")
notifications_collection = db.get_collection("notifications")
budget_requests_collection = db.get_collection("budget_requests")
token_blacklist_collection = db.get_collection("token_blacklist")

# app/db/client.py

async def init_db_indexes():
    try:
        # 1. Index cho collection 'users'
        await users_collection.create_index([("created_at", pymongo.ASCENDING)],
            expireAfterSeconds=86400,
            partialFilterExpression={"is_active": False},
            name="delete_unverified_users_ttl")
        await users_collection.create_index("username", unique=True)
        await users_collection.create_index("email", unique=True) # Nên có cho email

        # 2. Index cho 'families'
        # Giúp tìm kiếm gia đình theo tên hoặc mã mời nhanh hơn
        await families_collection.create_index("name")
        
        # 3. Index cho 'expense_categories'
        # Đảm bảo tên danh mục trong một gia đình là duy nhất (nếu cần)
        await expense_categories_collection.create_index([("family_id", pymongo.ASCENDING), ("name", pymongo.ASCENDING)])

        # 4. Index cho 'expenses'
        # Thường xuyên truy vấn theo family_id và ngày tháng
        await expenses_collection.create_index([("family_id", pymongo.ASCENDING), ("date", pymongo.DESCENDING)])

        # 5. Index cho 'budgets'
        await budgets_collection.create_index([("family_id", pymongo.ASCENDING), ("month", pymongo.ASCENDING)])

        # 6. Index cho 'token_blacklist' (Cần thiết để tự động xóa token hết hạn)
        await token_blacklist_collection.create_index("expires_at", expireAfterSeconds=0)

        logger.info("Tất cả Indexes đã được khởi tạo thành công.")
        
    except Exception as e:
        logger.error(f"Lỗi khi khởi tạo Indexes: {e}")