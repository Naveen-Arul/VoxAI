import requests
import logging
from config.settings import settings

logger = logging.getLogger(__name__)

class WebSearchService:
    def __init__(self):
        self.api_key = settings.TAVILY_API_KEY
        self.base_url = "https://api.tavily.com"
        
    def search(self, query):
        """
        Perform web search using Tavily API
        Args:
            query (str): Search query
        Returns:
            dict: Search results
        """
        try:
            url = f"{self.base_url}/search"
            
            payload = {
                "api_key": self.api_key,
                "query": query,
                "search_depth": "advanced",
                "include_answer": True,
                "include_images": False,
                "include_raw_content": False,
                "max_results": 5
            }
            
            response = requests.post(url, json=payload)
            
            if response.status_code == 200:
                result = response.json()
                logger.info(f"Web search completed for query: {query}")
                return result
            else:
                logger.error(f"Web search API error: {response.status_code} - {response.text}")
                raise Exception(f"Web search API error: {response.status_code}")
                
        except Exception as e:
            logger.error(f"Error in web search: {e}")
            raise

# Global instance
web_search_service = WebSearchService()