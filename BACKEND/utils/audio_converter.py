"""
Audio format conversion utilities
"""

import numpy as np
import io
from pydub import AudioSegment
from config.settings import settings

def pcm_to_wav(pcm_data, sample_rate=settings.SAMPLE_RATE):
    """
    Convert PCM data to WAV format
    Args:
        pcm_data (bytes): Raw PCM audio data
        sample_rate (int): Sample rate in Hz
    Returns:
        bytes: WAV formatted audio data
    """
    try:
        # Convert bytes to numpy array
        audio_np = np.frombuffer(pcm_data, dtype=np.int16)
        
        # Create WAV file in memory
        wav_io = io.BytesIO()
        audio_segment = AudioSegment(
            audio_np.tobytes(),
            frame_rate=sample_rate,
            sample_width=2,  # 16-bit
            channels=1
        )
        audio_segment.export(wav_io, format="wav")
        
        wav_data = wav_io.getvalue()
        wav_io.close()
        
        return wav_data
    except Exception as e:
        raise Exception(f"Error converting PCM to WAV: {e}")

def resample_audio(audio_data, original_rate, target_rate=settings.SAMPLE_RATE):
    """
    Resample audio to target sample rate
    Args:
        audio_data (bytes): Audio data
        original_rate (int): Original sample rate
        target_rate (int): Target sample rate
    Returns:
        bytes: Resampled audio data
    """
    try:
        audio_segment = AudioSegment(
            audio_data,
            frame_rate=original_rate,
            sample_width=2,  # 16-bit
            channels=1
        )
        
        resampled = audio_segment.set_frame_rate(target_rate)
        return resampled.raw_data
    except Exception as e:
        raise Exception(f"Error resampling audio: {e}")