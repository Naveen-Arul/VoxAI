from groq import Groq
import logging
from config.settings import settings

logger = logging.getLogger(__name__)

class LLMService:
    def __init__(self):
        self.client = Groq(api_key=settings.GROQ_API_KEY)
        self.model = settings.GROQ_MODEL
        
    def generate_response(self, prompt, context=""):
        """
        Generate response using Groq LLM (non-streaming)
        Args:
            prompt (str): User's prompt
            context (str): Additional context for the LLM
        Returns:
            str: Generated response
        """
        try:
            system_prompt = f"""You are a joyful AI assistant 😄✨.
Always answer with:
- Friendly and helpful tone
- Meaningful emojis to make responses engaging
- Proper Markdown formatting (headings, lists, code blocks, highlights, examples, etc.)
- Clear structure and organization

Do NOT escape markdown.
Do NOT remove emojis.
Do NOT wrap responses in quotes or JSON.
Reply exactly how a normal message should appear in a chat UI.

{context}"""
            
            messages = [
                {
                    "role": "system",
                    "content": system_prompt
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ]
            
            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=0.7,
                max_tokens=4096,  # Increased from 1024 to 4096
                top_p=1,
                stream=False
            )
            
            result = response.choices[0].message.content
            logger.info("LLM response generated successfully")
            return result.strip()
            
        except Exception as e:
            logger.error(f"Error in LLM generation: {e}")
            raise
    
    def generate_response_stream(self, prompt, context=""):
        """
        Generate streaming response using Groq LLM
        Args:
            prompt (str): User's prompt
            context (str): Additional context for the LLM
        Yields:
            str: Chunks of generated response
        """
        try:
            system_prompt = f"""You are a joyful AI assistant 😄✨.
Always answer with:
- Friendly and helpful tone
- Meaningful emojis to make responses engaging
- Proper Markdown formatting (headings, lists, code blocks, highlights, examples, etc.)
- Clear structure and organization

Do NOT escape markdown.
Do NOT remove emojis.
Do NOT wrap responses in quotes or JSON.
Reply exactly how a normal message should appear in a chat UI.

{context}"""
            
            messages = [
                {
                    "role": "system",
                    "content": system_prompt
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ]
            
            stream = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=0.7,
                max_tokens=4096,  # Full length responses
                top_p=1,
                stream=True  # Enable streaming
            )
            
            for chunk in stream:
                if chunk.choices[0].delta.content:
                    yield chunk.choices[0].delta.content
            
            logger.info("LLM streaming response completed successfully")
            
        except Exception as e:
            logger.error(f"Error in LLM streaming: {e}")
            raise

# Global instance
llm_service = LLMService()