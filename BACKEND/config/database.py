from motor.motor_asyncio import AsyncIOMotorClient
from config.settings import settings
import logging

logger = logging.getLogger(__name__)

class Database:
    client: AsyncIOMotorClient = None
    db = None

    @classmethod
    async def init_db(cls):
        """Initialize database connection"""
        try:
            cls.client = AsyncIOMotorClient(
                settings.MONGODB_URI,
                serverSelectionTimeoutMS=5000,  # 5 second timeout
                connectTimeoutMS=5000
            )
            cls.db = cls.client[settings.DATABASE_NAME]
            # Test the connection
            await cls.client.admin.command('ping')
            logger.info("Database connection initialized and tested successfully")
        except Exception as e:
            logger.error(f"Error initializing database: {e}")
            # Don't raise - allow app to start even if DB connection fails initially
            logger.warning("App will start without database connection")

    @classmethod
    async def close_db(cls):
        """Close database connection"""
        if cls.client:
            cls.client.close()
            logger.info("Database connection closed")

    @classmethod
    def get_db(cls):
        """Get database instance"""
        return cls.db

# Initialize database
db = Database()