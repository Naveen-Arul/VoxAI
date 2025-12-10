import numpy as np
import webrtcvad
import collections
from config.settings import settings

class VADProcessor:
    def __init__(self):
        self.vad = webrtcvad.Vad(settings.VAD_MODE)
        self.frame_duration = settings.FRAME_DURATION
        self.sample_rate = settings.SAMPLE_RATE
        self.chunk_size = settings.CHUNK_SIZE
        self.silence_threshold = settings.SILENCE_THRESHOLD
        
        # Buffer to hold audio frames
        self.frame_buffer = collections.deque(maxlen=int(self.silence_threshold * 1000 / self.frame_duration))
        self.speech_frames = []
        self.is_speaking = False
        self.silence_counter = 0
        
    def is_speech(self, frame):
        """Check if audio frame contains speech"""
        try:
            # Ensure frame is the correct size
            if len(frame) != self.chunk_size * 2:  # 16-bit samples
                return False
            return self.vad.is_speech(frame, self.sample_rate)
        except Exception:
            # If VAD fails, assume it's not speech
            return False
            
    def process_frame(self, frame):
        """
        Process an audio frame and detect speech/silence
        Returns: 
        - None: Still collecting frames
        - bytes: Complete speech segment when silence is detected
        """
        is_speech = self.is_speech(frame)
        
        # Add frame to buffer
        self.frame_buffer.append((frame, is_speech))
        
        if is_speech:
            self.is_speaking = True
            self.silence_counter = 0
            self.speech_frames.append(frame)
            return None
        else:
            # Detected silence
            if self.is_speaking:
                self.silence_counter += 1
                
                # Calculate silence duration
                silence_duration = self.silence_counter * self.frame_duration / 1000
                
                if silence_duration >= self.silence_threshold:
                    # Silence detected, return the complete speech segment
                    speech_data = b''.join(self.speech_frames)
                    self.speech_frames = []
                    self.is_speaking = False
                    self.silence_counter = 0
                    return speech_data
                    
            return None
            
    def reset(self):
        """Reset the VAD processor state"""
        self.frame_buffer.clear()
        self.speech_frames = []
        self.is_speaking = False
        self.silence_counter = 0