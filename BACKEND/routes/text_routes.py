from fastapi import APIRouter, HTTPException, UploadFile, File
from pydantic import BaseModel
from typing import List, Optional
from services.query_router import query_router
from services.db_service import db_service
from services.pdf_service import pdf_service
from services.web_search_service import web_search_service
import uuid
import os
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

class AskRequest(BaseModel):
    query: str
    user_id: str
    mode: str = "smart"

class AskResponse(BaseModel):
    response: str
    audio_base64: Optional[str] = None

class SearchRequest(BaseModel):
    query: str

class SearchResponse(BaseModel):
    results: dict

class UploadPDFResponse(BaseModel):
    document_id: str
    file_name: str
    message: str

class IPResponse(BaseModel):
    ip: str

class ChatHistoryRequest(BaseModel):
    user_id: str
    limit: int = 10

@router.post("/ask", response_model=AskResponse)
async def ask_question(request: AskRequest):
    """Handle text-based questions"""
    try:
        # Route the query
        response_text = query_router.handle_query(request.query, request.mode)
        
        logger.info(f"Question answered for user {request.user_id}")
        return AskResponse(response=response_text)
        
    except Exception as e:
        logger.error(f"Error in ask_question: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/search", response_model=SearchResponse)
async def web_search(request: SearchRequest):
    """Perform web search"""
    try:
        results = web_search_service.search(request.query)
        logger.info(f"Web search completed for query: {request.query}")
        return SearchResponse(results=results)
        
    except Exception as e:
        logger.error(f"Error in web_search: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/upload-pdf", response_model=UploadPDFResponse)
async def upload_pdf(user_id: str, file: UploadFile = File(...)):
    """Upload and process PDF file"""
    try:
        # Generate unique filename
        file_extension = os.path.splitext(file.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = f"/tmp/{unique_filename}"  # In production, use a proper temp directory
        
        # Save file temporarily
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        # Process PDF
        processed_data = pdf_service.process_pdf(file_path)
        
        # Save to database
        doc_record = await db_service.create_document({
            "user_id": user_id,
            "file_name": file.filename
        })
        
        await db_service.update_document_chunks(doc_record["_id"], processed_data["chunks"])
        
        # Clean up temp file
        os.remove(file_path)
        
        logger.info(f"PDF uploaded and processed: {file.filename}")
        return UploadPDFResponse(
            document_id=doc_record["_id"],
            file_name=file.filename,
            message="PDF uploaded and processed successfully"
        )
        
    except Exception as e:
        logger.error(f"Error in upload_pdf: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/ip", response_model=IPResponse)
async def get_public_ip():
    """Get user's public IP address"""
    try:
        ip_address = query_router.get_public_ip()
        logger.info(f"Public IP retrieved: {ip_address}")
        return IPResponse(ip=ip_address)
        
    except Exception as e:
        logger.error(f"Error in get_public_ip: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/ip", response_model=IPResponse)
async def get_public_ip_get():
    """Get user's public IP address (GET method)"""
    try:
        ip_address = query_router.get_public_ip()
        logger.info(f"Public IP retrieved: {ip_address}")
        return IPResponse(ip=ip_address)
        
    except Exception as e:
        logger.error(f"Error in get_public_ip: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/history")
async def get_chat_history(request: ChatHistoryRequest):
    """Get chat history for a user"""
    try:
        history = await db_service.get_chat_history(request.user_id, request.limit)
        logger.info(f"Chat history retrieved for user: {request.user_id}")
        return {"history": history}
        
    except Exception as e:
        logger.error(f"Error in get_chat_history: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/pdf/load")
async def load_pdf(document_id: str, query: str):
    """Query an already uploaded PDF document"""
    try:
        # Get document
        document = await db_service.get_document_by_id(document_id)
        if not document:
            raise HTTPException(status_code=404, detail="Document not found")
        
        # Extract chunks
        chunks = document.get("chunks", [])
        if not chunks:
            raise HTTPException(status_code=400, detail="Document has no processed chunks")
        
        # Perform semantic search on chunks
        # Simple implementation - in production use proper embedding similarity
        relevant_chunks = chunks[:3]  # Get first 3 chunks as context
        
        context = "\n\n".join([chunk.get("text", "") for chunk in relevant_chunks])
        
        # Generate response using LLM with context
        response_text = query_router.handle_query(query, mode="pdf", pdf_context={"extracted_text": context})
        
        logger.info(f"PDF query processed for document: {document_id}")
        return {
            "response": response_text,
            "document_name": document.get("file_name"),
            "chunks_used": len(relevant_chunks)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in load_pdf: {e}")
        raise HTTPException(status_code=500, detail=str(e))