import logging
from config.settings import settings

logger = logging.getLogger(__name__)

# Lazy import to avoid early PyTorch loading
_whisper_model = None

def get_whisper_model():
    global _whisper_model
    if _whisper_model is None:
        try:
            from faster_whisper import WhisperModel
            # Using medium model for better accuracy
            _whisper_model = WhisperModel("medium", device="cpu", compute_type="int8")
            logger.info("Whisper model initialized successfully")
        except Exception as e:
            logger.error(f"Error initializing Whisper model: {e}")
            # Fallback to tiny model
            try:
                from faster_whisper import WhisperModel
                _whisper_model = WhisperModel("tiny", device="cpu", compute_type="int8")
                logger.info("Fallback to tiny Whisper model initialized successfully")
            except Exception as e2:
                logger.error(f"Error initializing fallback Whisper model: {e2}")
                raise
    return _whisper_model

class STTService:
    def __init__(self):
        self.model = None  # Lazy load when needed
                
    def transcribe_audio(self, audio_data):
        """
        Transcribe audio data to text
        Args:
            audio_data: bytes of audio data (16kHz PCM)
        Returns:
            str: Transcribed text
        """
        try:
            if self.model is None:
                self.model = get_whisper_model()
                
            # Convert bytes to float32 numpy array
            import numpy as np
            audio_array = np.frombuffer(audio_data, dtype=np.int16).astype(np.float32) / 32768.0
            
            # Transcribe
            segments, info = self.model.transcribe(audio_array, beam_size=5)
            transcription = " ".join([segment.text for segment in segments])
            
            logger.info(f"Transcription completed: {transcription}")
            return transcription.strip()
            
        except Exception as e:
            logger.error(f"Error in transcription: {e}")
            raise

# Global instance
stt_service = STTService()