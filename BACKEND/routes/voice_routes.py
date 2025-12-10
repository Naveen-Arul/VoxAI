from fastapi import APIRouter, WebSocket, HTTPException
from fastapi.responses import StreamingResponse
import base64
import json
import logging
from utils.audio_utils import VADProcessor
from utils.audio_converter import pcm_to_wav
from services.stt_service import stt_service
from services.tts_service import tts_service
from services.query_router import query_router
from services.db_service import db_service

logger = logging.getLogger(__name__)

router = APIRouter()

@router.websocket("/voice-chat")
async def voice_chat(websocket: WebSocket):
    """WebSocket endpoint for continuous voice chat"""
    await websocket.accept()
    
    try:
        # Initialize VAD processor
        vad_processor = VADProcessor()
        
        # Get user info from first message
        data = await websocket.receive_text()
        user_data = json.loads(data)
        user_id = user_data.get("user_id")
        mode = user_data.get("mode", "voice")
        chat_id = None
        
        # Create chat session
        chat_data = await db_service.create_chat({
            "user_id": user_id,
            "mode": mode
        })
        chat_id = chat_data["_id"]
        
        logger.info(f"Voice chat started for user {user_id} with mode {mode}")
        
        while True:
            # Receive audio data
            audio_data = await websocket.receive_bytes()
            
            # Process audio frame with VAD
            speech_segment = vad_processor.process_frame(audio_data)
            
            if speech_segment:
                # Speech detected, process it
                try:
                    # Convert PCM to WAV for STT
                    wav_data = pcm_to_wav(speech_segment)
                    
                    # Step 1: Speech-to-Text
                    user_query = stt_service.transcribe_audio(wav_data)
                    logger.info(f"Transcribed text: {user_query}")
                    
                    # Save user message
                    user_message = Message(
                        role="user",
                        text=user_query
                    )
                    await db_service.add_message_to_chat(chat_id, user_message)
                    
                    # Save voice transcript
                    await db_service.create_voice_transcript(
                        user_id=user_id,
                        chat_id=chat_id,
                        transcript=user_query
                    )
                    
                    # Step 2: Route query and generate response
                    response_text = query_router.handle_query(user_query, mode)
                    logger.info(f"Generated response: {response_text}")
                    
                    # Save AI message
                    ai_message = Message(
                        role="assistant",
                        text=response_text
                    )
                    await db_service.add_message_to_chat(chat_id, ai_message)
                    
                    # Save AI voice transcript
                    await db_service.create_voice_transcript(
                        user_id=user_id,
                        chat_id=chat_id,
                        transcript=response_text
                    )
                    
                    # Step 3: Text-to-Speech
                    audio_bytes = tts_service.text_to_speech(response_text)
                    
                    # Step 4: Send response back to client
                    response_data = {
                        "text": response_text,
                        "audio_base64": base64.b64encode(audio_bytes).decode('utf-8')
                    }
                    
                    await websocket.send_text(json.dumps(response_data))
                    
                    # Reset VAD processor for next turn
                    vad_processor.reset()
                    
                except Exception as e:
                    logger.error(f"Error processing speech segment: {e}")
                    error_response = {
                        "error": "Error processing your request",
                        "text": "Sorry, I encountered an error processing your request."
                    }
                    await websocket.send_text(json.dumps(error_response))
                    
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
    finally:
        await websocket.close()
        logger.info("Voice chat ended")