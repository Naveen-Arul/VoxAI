from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from datetime import datetime
from typing import List, Optional
from groq import Groq
import os

class ChatService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.chats_collection = db.chats
        self.messages_collection = db.messages
        self.groq_client = Groq(api_key=os.getenv("GROQ_API_KEY", ""))
    
    async def generate_chat_title(self, first_message: str) -> str:
        """Generate a short chat title using LLM based on first user message"""
        try:
            response = self.groq_client.chat.completions.create(
                model="llama-3.1-8b-instant",
                messages=[
                    {
                        "role": "system",
                        "content": "Generate a short, concise chat title (3-5 words max) based on the user's first message. Only return the title, nothing else."
                    },
                    {
                        "role": "user",
                        "content": first_message
                    }
                ],
                temperature=0.7,
                max_tokens=20
            )
            title = response.choices[0].message.content.strip()
            # Remove quotes if present
            title = title.strip('"').strip("'")
            return title[:50]  # Limit to 50 chars
        except Exception as e:
            print(f"Error generating title: {e}")
            # Fallback: use first few words of message
            words = first_message.split()[:4]
            return " ".join(words) + "..." if len(words) == 4 else " ".join(words)
    
    async def create_chat(self, user_id: str, mode: str, first_message: str) -> dict:
        """Create a new chat with auto-generated title"""
        # Generate title from first message
        title = await self.generate_chat_title(first_message)
        
        now = datetime.utcnow()
        chat = {
            "user_id": user_id,
            "title": title,
            "mode": mode,
            "created_at": now,
            "updated_at": now
        }
        
        result = await self.chats_collection.insert_one(chat)
        chat["_id"] = str(result.inserted_id)
        
        return chat
    
    async def save_message(self, chat_id: str, role: str, content: str) -> dict:
        """Save a message to the messages collection"""
        message = {
            "chat_id": chat_id,
            "role": role,
            "content": content,
            "timestamp": datetime.utcnow()
        }
        
        result = await self.messages_collection.insert_one(message)
        message["_id"] = str(result.inserted_id)
        
        # Update chat's updated_at timestamp
        await self.chats_collection.update_one(
            {"_id": ObjectId(chat_id)},
            {"$set": {"updated_at": datetime.utcnow()}}
        )
        
        return message
    
    async def get_user_chats(self, user_id: str) -> List[dict]:
        """Get all chats for a user, ordered by most recent"""
        cursor = self.chats_collection.find({"user_id": user_id}).sort("updated_at", -1)
        chats = []
        
        async for chat in cursor:
            chat["_id"] = str(chat["_id"])
            chats.append(chat)
        
        return chats
    
    async def get_chat_messages(self, chat_id: str) -> List[dict]:
        """Get all messages for a specific chat"""
        cursor = self.messages_collection.find({"chat_id": chat_id}).sort("timestamp", 1)
        messages = []
        
        async for message in cursor:
            message["_id"] = str(message["_id"])
            messages.append(message)
        
        return messages
    
    async def get_chat(self, chat_id: str) -> Optional[dict]:
        """Get a specific chat by ID"""
        chat = await self.chats_collection.find_one({"_id": ObjectId(chat_id)})
        if chat:
            chat["_id"] = str(chat["_id"])
        return chat
    
    async def delete_chat(self, chat_id: str) -> bool:
        """Delete a chat and all its messages"""
        # Delete all messages
        await self.messages_collection.delete_many({"chat_id": chat_id})
        
        # Delete chat
        result = await self.chats_collection.delete_one({"_id": ObjectId(chat_id)})
        
        return result.deleted_count > 0
