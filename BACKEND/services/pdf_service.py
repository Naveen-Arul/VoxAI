import fitz  # PyMuPDF
import numpy as np
import uuid
import logging
from config.settings import settings

logger = logging.getLogger(__name__)

# Lazy import to avoid early PyTorch loading
_sentence_transformer_model = None

def get_sentence_transformer():
    global _sentence_transformer_model
    if _sentence_transformer_model is None:
        try:
            from sentence_transformers import SentenceTransformer
            _sentence_transformer_model = SentenceTransformer('all-MiniLM-L6-v2')
        except Exception as e:
            logger.error(f"Failed to load sentence transformer: {e}")
            raise
    return _sentence_transformer_model

class PDFService:
    def __init__(self):
        self.model = None  # Lazy load when needed
        
    def extract_text(self, file_path):
        """
        Extract text from PDF file
        Args:
            file_path (str): Path to PDF file
        Returns:
            str: Extracted text
        """
        try:
            doc = fitz.open(file_path)
            text = ""
            for page in doc:
                text += page.get_text()
            doc.close()
            logger.info(f"Text extracted from PDF: {file_path}")
            return text
        except Exception as e:
            logger.error(f"Error extracting text from PDF: {e}")
            raise
            
    def chunk_text(self, text, chunk_size=400, overlap=50):
        """
        Split text into chunks
        Args:
            text (str): Text to chunk
            chunk_size (int): Size of each chunk
            overlap (int): Overlap between chunks
        Returns:
            list: List of text chunks
        """
        try:
            sentences = text.split('. ')
            chunks = []
            current_chunk = []
            current_length = 0
            
            for sentence in sentences:
                sentence_length = len(sentence)
                if current_length + sentence_length > chunk_size and current_chunk:
                    # Save current chunk
                    chunks.append('. '.join(current_chunk) + '.')
                    # Start new chunk with overlap
                    overlap_sentences = max(0, len(current_chunk) - overlap//50)
                    current_chunk = current_chunk[overlap_sentences:] if overlap_sentences < len(current_chunk) else []
                    current_length = sum(len(s) for s in current_chunk)
                
                current_chunk.append(sentence)
                current_length += sentence_length
                
            # Add the last chunk
            if current_chunk:
                chunks.append('. '.join(current_chunk) + '.')
                
            logger.info(f"Text chunked into {len(chunks)} chunks")
            return chunks
        except Exception as e:
            logger.error(f"Error chunking text: {e}")
            raise
            
    def generate_embeddings(self, chunks):
        """
        Generate embeddings for text chunks
        Args:
            chunks (list): List of text chunks
        Returns:
            list: List of embeddings
        """
        try:
            if self.model is None:
                self.model = get_sentence_transformer()
            embeddings = self.model.encode(chunks)
            logger.info(f"Generated embeddings for {len(chunks)} chunks")
            return embeddings.tolist()
        except Exception as e:
            logger.error(f"Error generating embeddings: {e}")
            raise
            
    def process_pdf(self, file_path):
        """
        Process PDF file: extract text, chunk, and generate embeddings
        Args:
            file_path (str): Path to PDF file
        Returns:
            dict: Processed document with chunks and embeddings
        """
        try:
            # Extract text
            text = self.extract_text(file_path)
            
            # Chunk text
            chunks = self.chunk_text(text)
            
            # Generate embeddings
            embeddings = self.generate_embeddings(chunks)
            
            # Create document structure
            document_chunks = []
            for i, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
                document_chunks.append({
                    "id": str(uuid.uuid4()),
                    "text": chunk,
                    "embedding": embedding
                })
                
            logger.info(f"PDF processing completed: {len(document_chunks)} chunks")
            return {
                "extracted_text": text,
                "chunks": document_chunks
            }
        except Exception as e:
            logger.error(f"Error processing PDF: {e}")
            raise

# Global instance
pdf_service = PDFService()