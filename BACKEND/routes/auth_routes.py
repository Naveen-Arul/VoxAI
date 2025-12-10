from fastapi import APIRouter, HTTPException, Depends, status, UploadFile, File, Form
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import timedelta, date
from services.db_service import db_service
from utils.auth import (
    get_password_hash,
    verify_password,
    create_access_token,
    get_current_user
)
import logging
import base64
import uuid

logger = logging.getLogger(__name__)

router = APIRouter()


class SignupRequest(BaseModel):
    email: EmailStr
    password: str
    confirm_password: str
    name: str
    mobile: str
    date_of_birth: str
    gender: str
    country: str
    profile_photo: Optional[str] = None  # base64 encoded image


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: dict


class UserResponse(BaseModel):
    id: str
    email: str
    created_at: str


@router.post("/signup", response_model=TokenResponse)
async def signup(request: SignupRequest):
    """Create a new user account"""
    try:
        # Validate password length
        if len(request.password) < 6:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password must be at least 6 characters long"
            )
        
        # Validate passwords match
        if request.password != request.confirm_password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Passwords do not match"
            )
        
        # Check if user already exists
        existing_user = await db_service.get_user_by_email(request.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Hash password
        password_hash = get_password_hash(request.password)
        
        # Create user document with all fields
        user_doc = {
            "email": request.email,
            "password_hash": password_hash,
            "name": request.name,
            "mobile": request.mobile,
            "date_of_birth": request.date_of_birth,
            "gender": request.gender,
            "country": request.country,
            "profile_photo": request.profile_photo
        }
        
        user = await db_service.create_user_with_hash(user_doc)
        
        # Create access token
        access_token = create_access_token(
            data={"sub": user["id"], "email": user["email"]}
        )
        
        logger.info(f"User signed up: {user['email']}")
        
        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
            user={
                "id": user["id"],
                "email": user["email"],
                "created_at": str(user["created_at"])
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in signup: {e}", exc_info=True)
        
        # Provide user-friendly error messages
        error_msg = str(e).lower()
        if "duplicate key" in error_msg or "email" in error_msg:
            detail = "This email is already registered. Please use a different email or try logging in."
        elif "password" in error_msg:
            detail = "Password validation failed. Please use a password between 8-72 characters."
        elif "network" in error_msg or "connection" in error_msg:
            detail = "Database connection error. Please try again in a moment."
        else:
            detail = "Unable to create account. Please check your information and try again."
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=detail
        )


@router.post("/login", response_model=TokenResponse)
async def login(request: LoginRequest):
    """Login with email and password"""
    try:
        # Get user
        user = await db_service.get_user_by_email(request.email)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password"
            )
        
        # Verify password
        if not verify_password(request.password, user["password_hash"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password"
            )
        
        # Create access token
        access_token = create_access_token(
            data={"sub": user["id"], "email": user["email"]}
        )
        
        logger.info(f"User logged in: {user['email']}")
        
        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
            user={
                "id": user["id"],
                "email": user["email"],
                "created_at": str(user["created_at"])
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in login: {e}", exc_info=True)
        
        # Provide user-friendly error messages
        error_msg = str(e).lower()
        if "network" in error_msg or "connection" in error_msg:
            detail = "Database connection error. Please try again in a moment."
        elif "password" in error_msg:
            detail = "Authentication failed. Please check your credentials."
        else:
            detail = "Unable to log in. Please check your email and password and try again."
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=detail
        )


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    """Get current user information"""
    try:
        user = await db_service.get_user_by_email(current_user["email"])
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        return UserResponse(
            id=user["id"],
            email=user["email"],
            created_at=str(user["created_at"])
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in get_me: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


class ProfileResponse(BaseModel):
    id: str
    email: str
    name: str
    mobile: str
    date_of_birth: str
    gender: str
    country: str
    profile_photo: Optional[str] = None
    created_at: str


class UpdateProfileRequest(BaseModel):
    name: Optional[str] = None
    mobile: Optional[str] = None
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
    country: Optional[str] = None


@router.get("/profile", response_model=ProfileResponse)
async def get_profile(current_user: dict = Depends(get_current_user)):
    """Get current user's complete profile"""
    try:
        user = await db_service.get_user_by_email(current_user["email"])
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        return ProfileResponse(
            id=user["id"],
            email=user["email"],
            name=user.get("name", ""),
            mobile=user.get("mobile", ""),
            date_of_birth=user.get("date_of_birth", ""),
            gender=user.get("gender", ""),
            country=user.get("country", ""),
            profile_photo=user.get("profile_photo"),
            created_at=str(user["created_at"])
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting profile: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.put("/profile", response_model=ProfileResponse)
async def update_profile(
    request: UpdateProfileRequest,
    current_user: dict = Depends(get_current_user)
):
    """Update user profile"""
    try:
        # Build update document
        update_data = {}
        if request.name is not None:
            update_data["name"] = request.name
        if request.mobile is not None:
            update_data["mobile"] = request.mobile
        if request.date_of_birth is not None:
            update_data["date_of_birth"] = request.date_of_birth
        if request.gender is not None:
            update_data["gender"] = request.gender
        if request.country is not None:
            update_data["country"] = request.country
        
        if not update_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No fields to update"
            )
        
        # Update user
        updated_user = await db_service.update_user_profile(
            current_user["email"],
            update_data
        )
        
        if not updated_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        logger.info(f"Profile updated for user: {current_user['email']}")
        
        return ProfileResponse(
            id=updated_user["id"],
            email=updated_user["email"],
            name=updated_user.get("name", ""),
            mobile=updated_user.get("mobile", ""),
            date_of_birth=updated_user.get("date_of_birth"),
            gender=updated_user.get("gender", ""),
            country=updated_user.get("country", ""),
            profile_photo=updated_user.get("profile_photo"),
            created_at=str(updated_user["created_at"])
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating profile: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


class PhotoUploadRequest(BaseModel):
    photo: str  # base64 encoded image


@router.post("/profile/photo", response_model=ProfileResponse)
async def upload_profile_photo(
    request: PhotoUploadRequest,
    current_user: dict = Depends(get_current_user)
):
    """Upload or update profile photo"""
    try:
        # Update profile photo
        updated_user = await db_service.update_user_profile(
            current_user["email"],
            {"profile_photo": request.photo}
        )
        
        if not updated_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        logger.info(f"Profile photo updated for user: {current_user['email']}")
        
        return ProfileResponse(
            id=updated_user["id"],
            email=updated_user["email"],
            name=updated_user.get("name", ""),
            mobile=updated_user.get("mobile", ""),
            date_of_birth=updated_user.get("date_of_birth"),
            gender=updated_user.get("gender", ""),
            country=updated_user.get("country", ""),
            profile_photo=updated_user.get("profile_photo"),
            created_at=str(updated_user["created_at"])
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error uploading profile photo: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )



@router.post("/forgot-password")
async def forgot_password(email: EmailStr):
    """Request password reset (placeholder for future implementation)"""
    try:
        user = await db_service.get_user_by_email(email)
        if not user:
            # Don't reveal if user exists or not
            return {"message": "If the email exists, a password reset link will be sent"}
        
        # TODO: Implement password reset email logic
        logger.info(f"Password reset requested for: {email}")
        
        return {"message": "If the email exists, a password reset link will be sent"}
        
    except Exception as e:
        logger.error(f"Error in forgot_password: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
