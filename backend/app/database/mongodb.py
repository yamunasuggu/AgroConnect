"""
MongoDB Database Connection & Index Management using Motor (Async PyMongo).
Provides dependency injection for FastAPI routes.
"""
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from app.config import settings
import logging

logger = logging.getLogger(__name__)

class DatabaseManager:
    client: AsyncIOMotorClient = None
    db: AsyncIOMotorDatabase = None

db_manager = DatabaseManager()

async def connect_to_mongo():
    logger.info("Connecting to MongoDB Atlas / Local instance...")
    db_manager.client = AsyncIOMotorClient(settings.MONGODB_URI)
    db_manager.db = db_manager.client[settings.DATABASE_NAME]
    
    # Create necessary indexes
    try:
        await db_manager.db.users.create_index("email", unique=True)
        await db_manager.db.crops.create_index([("name", "text"), ("location", "text")])
        await db_manager.db.crops.create_index("farmer_id")
        await db_manager.db.orders.create_index("buyer_id")
        await db_manager.db.orders.create_index("farmer_id")
        await db_manager.db.approved_knowledge.create_index("crop")
        logger.info("MongoDB indexes verified successfully.")
    except Exception as e:
        logger.warning(f"Could not build indexes automatically: {e}")

async def close_mongo_connection():
    logger.info("Closing MongoDB connection...")
    if db_manager.client:
        db_manager.client.close()
        logger.info("MongoDB connection closed.")

def get_database() -> AsyncIOMotorDatabase:
    return db_manager.db
