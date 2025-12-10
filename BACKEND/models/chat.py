from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from bson import ObjectId

class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid objectid")
        return ObjectId(v)

    @classmethod
    def __modify_schema__(cls, field_schema):
        field_schema.update(type="string")

class ChatBase(BaseModel):
    user_id: str
    title: str = "New Chat"
    mode: str  # "smart", "voice", "pdf", "web"

class ChatCreate(BaseModel):
    user_id: str
    mode: str
    first_message: str

class ChatResponse(BaseModel):
    id: str = Field(alias="_id")
    user_id: str
    title: str
    mode: str
    created_at: datetime
    updated_at: datetime

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}

class MessageBase(BaseModel):
    chat_id: str
    role: str  # "user" or "assistant"
    content: str

class MessageCreate(MessageBase):
    pass

class MessageResponse(BaseModel):
    id: str = Field(alias="_id")
    chat_id: str
    role: str
    content: str
    timestamp: datetime

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}

class ChatMessageRequest(BaseModel):
    content: str
    mode: str = "smart"