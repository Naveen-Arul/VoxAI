from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
import uvicorn
from routes import text_routes, voice_routes, auth_routes, chat_routes
from config.database import db
from config.logging_config import setup_logging
import asyncio
import logging

# Set up logging
setup_logging()
logger = logging.getLogger(__name__)

app = FastAPI(title="VoxAI Backend", description="Backend API for VoxAI voice assistant", version="1.0.0")

# Custom validation error handler
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle validation errors with user-friendly messages"""
    errors = exc.errors()
    logger.error(f"Validation error: {errors}")
    
    # Extract field names and create user-friendly message
    missing_fields = []
    invalid_fields = []
    
    for error in errors:
        field = error.get('loc', ['unknown'])[-1]
        error_type = error.get('type', '')
        
        if 'missing' in error_type:
            missing_fields.append(field)
        else:
            invalid_fields.append(f"{field} ({error.get('msg', 'invalid')})")
    
    message = ""
    if missing_fields:
        message += f"Missing required fields: {', '.join(missing_fields)}. "
    if invalid_fields:
        message += f"Invalid fields: {', '.join(invalid_fields)}."
    
    if not message:
        message = "Please check your input and try again."
    
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": message.strip()}
    )

# Initialize database
@app.on_event("startup")
async def startup_event():
    await db.init_db()

# Close database connection
@app.on_event("shutdown")
async def shutdown_event():
    await db.close_db()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_routes.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(chat_routes.router, prefix="/api/v1", tags=["chat"])
app.include_router(text_routes.router, prefix="/api/v1")
app.include_router(voice_routes.router, prefix="/api/v1")

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)