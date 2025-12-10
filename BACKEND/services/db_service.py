from config.database import db
from models.user import UserCreate, UserInDB
from models.document import DocumentCreate, DocumentInDB
from datetime import datetime
import hashlib
import logging
from bson import ObjectId

logger = logging.getLogger(__name__)

class DBService:
    @property
    def db(self):
        """Get database instance dynamically"""
        return db.get_db()
        
    async def create_user(self, user_data: UserCreate):
        """Create a new user"""
        try:
            # Hash password
            password_hash = hashlib.sha256(user_data.password.encode()).hexdigest()
            
            user_doc = {
                "email": user_data.email,
                "password_hash": password_hash,
                "created_at": datetime.utcnow()
            }
            
            result = await self.db.users.insert_one(user_doc)
            user_doc["_id"] = str(result.inserted_id)
            logger.info(f"User created: {user_doc['_id']}")
            return user_doc
        except Exception as e:
            logger.error(f"Error creating user: {e}")
            raise
    
    async def create_user_with_hash(self, user_doc: dict):
        """Create a new user with pre-hashed password"""
        try:
            user_doc["created_at"] = datetime.utcnow()
            
            result = await self.db.users.insert_one(user_doc)
            user_doc["id"] = str(result.inserted_id)
            del user_doc["_id"]
            logger.info(f"User created: {user_doc['id']}")
            return user_doc
        except Exception as e:
            logger.error(f"Error creating user: {e}")
            raise
            
    async def get_user_by_email(self, email: str):
        """Get user by email"""
        try:
            user = await self.db.users.find_one({"email": email})
            if user:
                user["id"] = str(user["_id"])
                del user["_id"]
            return user
        except Exception as e:
            logger.error(f"Error getting user by email: {e}")
            raise
    
    async def update_user_profile(self, email: str, update_data: dict):
        """Update user profile fields"""
        try:
            result = await self.db.users.update_one(
                {"email": email},
                {"$set": update_data}
            )
            
            if result.modified_count == 0:
                logger.warning(f"No user updated for email: {email}")
                return None
            
            # Return updated user
            updated_user = await self.get_user_by_email(email)
            logger.info(f"User profile updated: {email}")
            return updated_user
        except Exception as e:
            logger.error(f"Error updating user profile: {e}")
            raise
            
    async def verify_user_password(self, email: str, password: str):
        """Verify user password"""
        try:
            user = await self.get_user_by_email(email)
            if user:
                password_hash = hashlib.sha256(password.encode()).hexdigest()
                return user["password_hash"] == password_hash
            return False
        except Exception as e:
            logger.error(f"Error verifying user password: {e}")
            return False
            
    async def create_document(self, document_data: DocumentCreate):
        """Create a new document record"""
        try:
            doc_doc = {
                "user_id": document_data.user_id,
                "file_name": document_data.file_name,
                "chunks": [],
                "created_at": datetime.utcnow()
            }
            
            result = await self.db.documents.insert_one(doc_doc)
            doc_doc["_id"] = str(result.inserted_id)
            logger.info(f"Document record created: {doc_doc['_id']}")
            return doc_doc
        except Exception as e:
            logger.error(f"Error creating document record: {e}")
            raise
            
    async def update_document_chunks(self, document_id: str, chunks: list):
        """Update document with processed chunks"""
        try:
            result = await self.db.documents.update_one(
                {"_id": ObjectId(document_id)},
                {"$set": {"chunks": chunks}}
            )
            logger.info(f"Document chunks updated: {document_id}")
            return result.modified_count > 0
        except Exception as e:
            logger.error(f"Error updating document chunks: {e}")
            raise
            
    async def get_document_by_id(self, document_id: str):
        """Get document by ID"""
        try:
            doc = await self.db.documents.find_one({"_id": ObjectId(document_id)})
            if doc:
                doc["id"] = str(doc["_id"])
                del doc["_id"]
            return doc
        except Exception as e:
            logger.error(f"Error getting document by ID: {e}")
            raise
            
    async def get_user_documents(self, user_id: str):
        """Get all documents for a user"""
        try:
            docs = []
            cursor = self.db.documents.find({"user_id": user_id})
            async for doc in cursor:
                doc["id"] = str(doc["_id"])
                del doc["_id"]
                docs.append(doc)
            logger.info(f"Retrieved {len(docs)} documents for user: {user_id}")
            return docs
        except Exception as e:
            logger.error(f"Error getting user documents: {e}")
            raise
    
    async def create_voice_transcript(self, user_id: str, chat_id: str, transcript: str, audio_url: str = None):
        """Create a voice transcript record"""
        try:
            transcript_doc = {
                "user_id": user_id,
                "chat_id": chat_id,
                "transcript": transcript,
                "audio_url": audio_url,
                "created_at": datetime.utcnow()
            }
            
            result = await self.db.voice_transcripts.insert_one(transcript_doc)
            transcript_doc["id"] = str(result.inserted_id)
            del transcript_doc["_id"]
            logger.info(f"Voice transcript created: {transcript_doc['id']}")
            return transcript_doc
        except Exception as e:
            logger.error(f"Error creating voice transcript: {e}")
            raise
    
    async def get_voice_transcripts(self, user_id: str, limit: int = 50):
        """Get voice transcripts for a user"""
        try:
            transcripts = []
            cursor = self.db.voice_transcripts.find({"user_id": user_id}).sort("created_at", -1).limit(limit)
            async for transcript in cursor:
                transcript["id"] = str(transcript["_id"])
                del transcript["_id"]
                transcripts.append(transcript)
            logger.info(f"Retrieved {len(transcripts)} voice transcripts for user: {user_id}")
            return transcripts
        except Exception as e:
            logger.error(f"Error getting voice transcripts: {e}")
            raise

# Global instance
db_service = DBService()