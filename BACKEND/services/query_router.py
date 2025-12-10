import re
import requests
import logging
from services.llm_service import llm_service
from services.web_search_service import web_search_service
from config.settings import settings

logger = logging.getLogger(__name__)

class QueryRouter:
    def __init__(self):
        self.college_info = settings.COLLEGE_INFO
        
    def get_public_ip(self):
        """Get user's public IP address"""
        try:
            response = requests.get("https://api.ipify.org?format=json")
            if response.status_code == 200:
                ip_data = response.json()
                logger.info(f"Public IP retrieved: {ip_data['ip']}")
                return ip_data['ip']
            else:
                raise Exception(f"Failed to get IP: {response.status_code}")
        except Exception as e:
            logger.error(f"Error getting public IP: {e}")
            raise
            
    def classify_query(self, query, mode="smart"):
        """
        Classify the query to determine the appropriate response handler
        Args:
            query (str): User's query
            mode (str): Chat mode ("smart", "voice", "pdf", "web")
        Returns:
            str: Handler type ("ip", "pdf", "web", "college", "general")
        """
        try:
            query_lower = query.lower()
            
            # Check for IP-related queries
            if any(keyword in query_lower for keyword in ["my ip", "public ip", "ip address"]):
                return "ip"
                
            # Check for PDF-related queries (when in PDF mode)
            if mode == "pdf" and any(keyword in query_lower for keyword in ["pdf", "document", "file"]):
                return "pdf"
                
            # Check for web search queries
            if mode == "web":
                return "web"
                
            # Check for college-related queries
            college_keywords = ["college", "university", "course", "program", "faculty", "student"]
            if any(keyword in query_lower for keyword in college_keywords):
                return "college"
                
            # Default to general chat for smart/voice modes
            if mode in ["smart", "voice"]:
                return "general"
                
            # Default fallback
            return "general"
            
        except Exception as e:
            logger.error(f"Error classifying query: {e}")
            return "general"
            
    def handle_query(self, query, mode="smart", pdf_context=None):
        """
        Handle query based on classification
        Args:
            query (str): User's query
            mode (str): Chat mode
            pdf_context (dict): PDF context for RAG queries
        Returns:
            str: Generated response
        """
        try:
            handler_type = self.classify_query(query, mode)
            
            if handler_type == "ip":
                ip_address = self.get_public_ip()
                response = f"Your public IP address is: {ip_address}"
                
            elif handler_type == "pdf" and pdf_context:
                # For PDF queries, we would normally do RAG here
                # This is a simplified version
                response = llm_service.generate_response(
                    query, 
                    f"Answer based on this document context: {pdf_context.get('extracted_text', '')[:1000]}..."
                )
                
            elif handler_type == "web":
                # Perform web search
                search_results = web_search_service.search(query)
                answer = search_results.get('answer', '')
                if answer:
                    response = answer
                else:
                    # Fallback to LLM with search results
                    context = "Web search results:\n"
                    for result in search_results.get('results', [])[:3]:
                        context += f"- {result.get('title', '')}: {result.get('content', '')}\n"
                    response = llm_service.generate_response(query, context)
                    
            elif handler_type == "college":
                # Answer college-related questions
                response = llm_service.generate_response(
                    query, 
                    f"College information: {self.college_info}"
                )
                
            else:  # general
                response = llm_service.generate_response(query)
                
            logger.info(f"Query handled with handler type: {handler_type}")
            return response
            
        except Exception as e:
            logger.error(f"Error handling query: {e}")
            # Fallback response
            return "I apologize, but I encountered an error processing your request. Could you please try again?"

# Global instance
query_router = QueryRouter()