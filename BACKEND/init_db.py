"""
Database initialization script for VoxAI
Creates indexes for better query performance
"""

import asyncio
from config.database import db

async def init_indexes():
    """Initialize database indexes"""
    try:
        # Initialize database connection
        db.init_db()
        database = db.get_db()
        
        # Create indexes for users collection
        await database.users.create_index("email", unique=True)
        print("Created index for users.email")
        
        # Create indexes for chats collection
        await database.chats.create_index("user_id")
        await database.chats.create_index("created_at")
        print("Created indexes for chats collection")
        
        # Create indexes for documents collection
        await database.documents.create_index("user_id")
        await database.documents.create_index("created_at")
        print("Created indexes for documents collection")
        
        print("Database indexes initialized successfully!")
        
    except Exception as e:
        print(f"Error initializing database indexes: {e}")
    finally:
        await db.close_db()

if __name__ == "__main__":
    asyncio.run(init_indexes())