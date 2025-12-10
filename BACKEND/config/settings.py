import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    # API Keys
    GROQ_API_KEY = os.getenv("GROQ_API_KEY")
    ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")
    TAVILY_API_KEY = os.getenv("TAVILY_API_KEY")
    ELEVENLABS_VOICE_ID = os.getenv("ELEVENLABS_VOICE_ID")
    
    # Database
    MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
    DATABASE_NAME = "voxAI"
    
    # Audio settings
    SAMPLE_RATE = 16000
    FRAME_DURATION = 30  # ms
    CHUNK_SIZE = 480  # For 16kHz audio with 30ms frames
    
    # VAD settings
    VAD_MODE = 3  # Aggressiveness mode (0-3)
    SILENCE_THRESHOLD = 1.5  # seconds
    
    # LLM settings
    GROQ_MODEL = "llama-3.1-8b-instant"
    
    # College information (placeholder - should be expanded)
    COLLEGE_INFO = """
    This is placeholder information about the college. In a real implementation, 
    this would contain detailed information about courses, faculty, facilities, 
    admission procedures, and other relevant college information.
    """

settings = Settings()