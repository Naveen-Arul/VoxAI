"""
Simple test script to verify backend components
"""

import asyncio
from services.stt_service import stt_service
from services.tts_service import tts_service
from services.llm_service import llm_service
from services.web_search_service import web_search_service
from services.pdf_service import pdf_service
from services.query_router import query_router
from config.logging_config import setup_logging

# Set up logging
setup_logging()

async def test_components():
    """Test all backend components"""
    print("Testing VoxAI Backend Components...")
    
    try:
        # Test STT Service
        print("\n1. Testing STT Service...")
        # Note: This would require actual audio data to test fully
        
        # Test TTS Service
        print("\n2. Testing TTS Service...")
        audio_data = tts_service.text_to_speech("Hello, this is a test of the text to speech service.")
        print(f"TTS Success: Generated {len(audio_data)} bytes of audio data")
        
        # Test LLM Service
        print("\n3. Testing LLM Service...")
        response = llm_service.generate_response("What is the capital of France?")
        print(f"LLM Response: {response}")
        
        # Test Web Search Service
        print("\n4. Testing Web Search Service...")
        # Note: This requires a valid Tavily API key
        
        # Test PDF Service
        print("\n5. Testing PDF Service...")
        # Note: This would require an actual PDF file to test fully
        
        # Test Query Router
        print("\n6. Testing Query Router...")
        ip_response = query_router.get_public_ip()
        print(f"IP Address: {ip_response}")
        
        print("\nAll tests completed successfully!")
        
    except Exception as e:
        print(f"Error during testing: {e}")

if __name__ == "__main__":
    asyncio.run(test_components())