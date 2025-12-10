from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from typing import List
from datetime import datetime

from models.chat import ChatCreate, ChatResponse, MessageResponse, ChatMessageRequest
from services.chat_service import ChatService
from services.llm_service import LLMService
from services.web_search_service import WebSearchService
from services.pdf_service import PDFService
from utils.auth import get_current_user
from config.database import db

router = APIRouter(prefix="/chat", tags=["chat"])

def get_chat_service() -> ChatService:
    """Dependency to get chat service instance"""
    database = db.get_db()
    return ChatService(database)

def get_llm_service() -> LLMService:
    """Dependency to get LLM service instance"""
    return LLMService()

def get_web_search_service() -> WebSearchService:
    """Dependency to get web search service instance"""
    return WebSearchService()

def get_pdf_service() -> PDFService:
    """Dependency to get PDF service instance"""
    return PDFService()

@router.post("/start", response_model=dict)
async def start_chat(
    chat_data: ChatCreate,
    current_user: dict = Depends(get_current_user),
    chat_service: ChatService = Depends(get_chat_service),
    llm_service: LLMService = Depends(get_llm_service),
    web_service: WebSearchService = Depends(get_web_search_service),
    pdf_service: PDFService = Depends(get_pdf_service)
):
    """
    Start a new chat:
    1. Generate title from first message
    2. Create chat in DB
    3. Save user message
    4. Generate assistant response
    5. Save assistant response
    6. Return chat_id and response
    """
    # Ensure user_id matches current user
    current_user_id = current_user.get("user_id")
    if chat_data.user_id != current_user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User ID mismatch")
    
    # Create chat with auto-generated title
    chat = await chat_service.create_chat(
        user_id=current_user_id,
        mode=chat_data.mode,
        first_message=chat_data.first_message
    )
    
    chat_id = chat["_id"]
    
    # Save user message
    user_message = await chat_service.save_message(
        chat_id=chat_id,
        role="user",
        content=chat_data.first_message
    )
    
    # Generate assistant response based on mode
    try:
        if chat_data.mode == "web":
            # Web search mode
            search_results = web_service.search(chat_data.first_message)
            assistant_response = search_results.get("answer", "Here are the search results.")
        elif chat_data.mode == "pdf":
            # PDF mode - would need document_id, for now return info message
            assistant_response = "Please upload a PDF document to start asking questions about it."
        else:
            # Smart chat or voice mode
            assistant_response = llm_service.generate_response(
                prompt=chat_data.first_message,
                context="You are a helpful AI assistant."
            )
        
        # Save assistant message
        assistant_message = await chat_service.save_message(
            chat_id=chat_id,
            role="assistant",
            content=assistant_response
        )
        
        return {
            "chat_id": chat_id,
            "title": chat["title"],
            "user_message": {
                "id": user_message["_id"],
                "role": user_message["role"],
                "content": user_message["content"],
                "timestamp": user_message["timestamp"].isoformat()
            },
            "assistant_message": {
                "id": assistant_message["_id"],
                "role": assistant_message["role"],
                "content": assistant_message["content"],
                "timestamp": assistant_message["timestamp"].isoformat()
            }
        }
    except Exception as e:
        # If response generation fails, save error message
        error_message = await chat_service.save_message(
            chat_id=chat_id,
            role="assistant",
            content=f"Sorry, I encountered an error: {str(e)}"
        )
        
        return {
            "chat_id": chat_id,
            "title": chat["title"],
            "user_message": {
                "id": user_message["_id"],
                "role": user_message["role"],
                "content": user_message["content"],
                "timestamp": user_message["timestamp"].isoformat()
            },
            "assistant_message": {
                "id": error_message["_id"],
                "role": error_message["role"],
                "content": error_message["content"],
                "timestamp": error_message["timestamp"].isoformat()
            }
        }

@router.post("/{chat_id}/message", response_model=dict)
async def send_message(
    chat_id: str,
    message_data: ChatMessageRequest,
    current_user: dict = Depends(get_current_user),
    chat_service: ChatService = Depends(get_chat_service),
    llm_service: LLMService = Depends(get_llm_service),
    web_service: WebSearchService = Depends(get_web_search_service),
    pdf_service: PDFService = Depends(get_pdf_service)
):
    """
    Send a message in existing chat:
    1. Verify chat belongs to user
    2. Save user message
    3. Generate assistant response
    4. Save assistant response
    5. Return both messages
    """
    # Verify chat exists and belongs to user
    chat = await chat_service.get_chat(chat_id)
    if not chat:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chat not found")
    
    current_user_id = current_user.get("user_id")
    if chat["user_id"] != current_user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    
    # Save user message
    user_message = await chat_service.save_message(
        chat_id=chat_id,
        role="user",
        content=message_data.content
    )
    
    # Generate assistant response based on mode
    mode = message_data.mode or chat["mode"]
    
    try:
        if mode == "web":
            # Web search mode
            search_results = web_service.search(message_data.content)
            assistant_response = search_results.get("answer", "Here are the search results.")
        elif mode == "pdf":
            # PDF mode - would need document_id from chat metadata
            assistant_response = "PDF chat functionality requires a document to be uploaded."
        else:
            # Smart chat or voice mode
            assistant_response = llm_service.generate_response(
                prompt=message_data.content,
                context="You are a helpful AI assistant."
            )
        
        # Save assistant message
        assistant_message = await chat_service.save_message(
            chat_id=chat_id,
            role="assistant",
            content=assistant_response
        )
        
        return {
            "user_message": {
                "id": user_message["_id"],
                "role": user_message["role"],
                "content": user_message["content"],
                "timestamp": user_message["timestamp"].isoformat()
            },
            "assistant_message": {
                "id": assistant_message["_id"],
                "role": assistant_message["role"],
                "content": assistant_message["content"],
                "timestamp": assistant_message["timestamp"].isoformat()
            }
        }
    except Exception as e:
        # If response generation fails, save error message
        error_message = await chat_service.save_message(
            chat_id=chat_id,
            role="assistant",
            content=f"Sorry, I encountered an error: {str(e)}"
        )
        
        return {
            "user_message": {
                "id": user_message["_id"],
                "role": user_message["role"],
                "content": user_message["content"],
                "timestamp": user_message["timestamp"].isoformat()
            },
            "assistant_message": {
                "id": error_message["_id"],
                "role": error_message["role"],
                "content": error_message["content"],
                "timestamp": error_message["timestamp"].isoformat()
            }
        }

@router.get("/list", response_model=List[ChatResponse])
async def get_chats(
    current_user: dict = Depends(get_current_user),
    chat_service: ChatService = Depends(get_chat_service)
):
    """Get all chats for current user"""
    current_user_id = current_user.get("user_id")
    chats = await chat_service.get_user_chats(current_user_id)
    return chats

@router.get("/{chat_id}/messages", response_model=List[MessageResponse])
async def get_chat_messages(
    chat_id: str,
    current_user: dict = Depends(get_current_user),
    chat_service: ChatService = Depends(get_chat_service)
):
    """Get all messages for a specific chat"""
    # Verify chat belongs to user
    chat = await chat_service.get_chat(chat_id)
    if not chat:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chat not found")
    
    current_user_id = current_user.get("user_id")
    if chat["user_id"] != current_user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    
    messages = await chat_service.get_chat_messages(chat_id)
    return messages

@router.delete("/{chat_id}")
async def delete_chat(
    chat_id: str,
    current_user: dict = Depends(get_current_user),
    chat_service: ChatService = Depends(get_chat_service)
):
    """Delete a chat and all its messages"""
    # Verify chat belongs to user
    chat = await chat_service.get_chat(chat_id)
    if not chat:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chat not found")
    
    current_user_id = current_user.get("user_id")
    if chat["user_id"] != current_user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    
    success = await chat_service.delete_chat(chat_id)
    
    if success:
        return {"message": "Chat deleted successfully"}
    else:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to delete chat")

@router.post("/{chat_id}/stream")
async def stream_message(
    chat_id: str,
    message_data: ChatMessageRequest,
    current_user: dict = Depends(get_current_user),
    chat_service: ChatService = Depends(get_chat_service),
    llm_service: LLMService = Depends(get_llm_service),
    web_service: WebSearchService = Depends(get_web_search_service),
    pdf_service: PDFService = Depends(get_pdf_service)
):
    """
    Stream a message response in existing chat:
    1. Verify chat belongs to user
    2. Save user message
    3. Stream assistant response chunks
    4. Save complete assistant response
    5. Return streaming response
    """
    # Verify chat exists and belongs to user
    chat = await chat_service.get_chat(chat_id)
    if not chat:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chat not found")
    
    current_user_id = current_user.get("user_id")
    if chat["user_id"] != current_user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    
    # Save user message
    user_message = await chat_service.save_message(
        chat_id=chat_id,
        role="user",
        content=message_data.content
    )
    
    # Get chat mode
    mode = message_data.mode or chat["mode"]
    
    async def generate_stream():
        """Async generator function for streaming response"""
        full_response = ""
        
        try:
            if mode == "web":
                # Web search mode - not streamable, send as single chunk
                search_results = web_service.search(message_data.content)
                response = search_results.get("answer", "Here are the search results.")
                full_response = response
                yield f"data: {response}\n\n"
                yield "data: [DONE]\n\n"
                
            elif mode == "pdf":
                # PDF mode - not streamable
                response = "PDF chat functionality requires a document to be uploaded."
                full_response = response
                yield f"data: {response}\n\n"
                yield "data: [DONE]\n\n"
                
            else:
                # Smart chat or voice mode - stream LLM response
                for chunk in llm_service.generate_response_stream(
                    prompt=message_data.content,
                    context="You are a helpful AI assistant."
                ):
                    full_response += chunk
                    yield f"data: {chunk}\n\n"
                
                yield "data: [DONE]\n\n"
            
            # Save complete assistant message after streaming
            await chat_service.save_message(
                chat_id=chat_id,
                role="assistant",
                content=full_response
            )
            
        except Exception as e:
            # Send error and save error message
            error_msg = f"Sorry, I encountered an error: {str(e)}"
            yield f"data: {error_msg}\n\n"
            yield "data: [DONE]\n\n"
            
            await chat_service.save_message(
                chat_id=chat_id,
                role="assistant",
                content=error_msg
            )
    
    return StreamingResponse(
        generate_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        }
    )
