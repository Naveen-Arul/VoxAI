from pydantic import BaseModel
from typing import List, Optional

class DocumentChunk(BaseModel):
    id: str
    text: str
    embedding: List[float]

class DocumentCreate(BaseModel):
    user_id: str
    file_name: str

class Document(DocumentCreate):
    id: str
    chunks: List[DocumentChunk] = []

class DocumentInDB(Document):
    pass