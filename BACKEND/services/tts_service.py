import requests
import base64
import logging
from config.settings import settings

logger = logging.getLogger(__name__)

class TTSService:
    def __init__(self):
        self.api_key = settings.ELEVENLABS_API_KEY
        self.voice_id = settings.ELEVENLABS_VOICE_ID
        self.base_url = "https://api.elevenlabs.io/v1"
        
    def text_to_speech(self, text):
        """
        Convert text to speech using ElevenLabs API
        Args:
            text (str): Text to convert to speech
        Returns:
            bytes: Audio data
        """
        try:
            url = f"{self.base_url}/text-to-speech/{self.voice_id}"
            
            headers = {
                "Accept": "audio/mpeg",
                "Content-Type": "application/json",
                "xi-api-key": self.api_key
            }
            
            data = {
                "text": text,
                "model_id": "eleven_multilingual_v2",
                "voice_settings": {
                    "stability": 0.5,
                    "similarity_boost": 0.5
                }
            }
            
            response = requests.post(url, json=data, headers=headers)
            
            if response.status_code == 200:
                logger.info("TTS conversion completed successfully")
                return response.content
            else:
                logger.error(f"TTS API error: {response.status_code} - {response.text}")
                raise Exception(f"TTS API error: {response.status_code}")
                
        except Exception as e:
            logger.error(f"Error in TTS conversion: {e}")
            raise
            
    def text_to_speech_stream(self, text):
        """
        Convert text to speech stream using ElevenLabs API
        Args:
            text (str): Text to convert to speech
        Returns:
            Generator: Audio chunks
        """
        try:
            url = f"{self.base_url}/text-to-speech/{self.voice_id}/stream"
            
            headers = {
                "Accept": "audio/mpeg",
                "Content-Type": "application/json",
                "xi-api-key": self.api_key
            }
            
            data = {
                "text": text,
                "model_id": "eleven_multilingual_v2",
                "voice_settings": {
                    "stability": 0.5,
                    "similarity_boost": 0.5
                }
            }
            
            response = requests.post(url, json=data, headers=headers, stream=True)
            
            if response.status_code == 200:
                for chunk in response.iter_content(chunk_size=1024):
                    if chunk:
                        yield chunk
            else:
                logger.error(f"TTS Stream API error: {response.status_code} - {response.text}")
                raise Exception(f"TTS Stream API error: {response.status_code}")
                
        except Exception as e:
            logger.error(f"Error in TTS streaming: {e}")
            raise

# Global instance
tts_service = TTSService()