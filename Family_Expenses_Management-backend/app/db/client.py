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

# Hàm khởi tạo Indexes (Chạy khi start app)
async def init_db_indexes():
    try:
        # Tạo TTL Index cho việc tự động xóa User chưa kích hoạt sau 24h
        # Trong Python (motor), dùng danh sách các tuple [(field, direction)]
        await users_collection.create_index(
            [("created_at", pymongo.ASCENDING)],
            expireAfterSeconds=86400,
            partialFilterExpression={"is_active": False},
            name="delete_unverified_users_ttl"
        )
        logger.info("TTL Index cho users đã được khởi tạo thành công.")
        
        # Tiện tay tạo luôn index cho username để đăng nhập nhanh hơn
        await users_collection.create_index("username", unique=True)
        
    except Exception as e:
        logger.error(f"Lỗi khi khởi tạo Indexes: {e}")