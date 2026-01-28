"""
Authentication Endpoints

API endpoints for user authentication and profile management.
"""

from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import CurrentUser, CurrentUserId
from app.core.database import get_db
from app.core.security import AuthError
from app.schemas.base import UserResponse, UserUpdate
from app.services.user_service import UserService

router = APIRouter()


@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(
    current_user: CurrentUser,
) -> UserResponse:
    """
    Get the current authenticated user's profile.

    Returns the user data for the authenticated user based on their JWT token.
    """
    return current_user


@router.patch("/me", response_model=UserResponse)
async def update_current_user_profile(
    user_id: CurrentUserId,
    data: UserUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> UserResponse:
    """
    Update the current authenticated user's profile.

    Allows updating:
    - display_name: The user's display name
    - ibkr_connected: IBKR connection status (typically set by the system)
    """
    service = UserService(db)
    user = await service.update(user_id, data)

    if not user:
        raise AuthError("User not found")

    return UserResponse.model_validate(user)


@router.get("/me/status")
async def get_auth_status(
    current_user: CurrentUser,
) -> dict:
    """
    Check if the user is authenticated and get basic status.

    This is a lightweight endpoint to verify authentication status.
    """
    return {
        "authenticated": True,
        "user_id": str(current_user.id),
        "email": current_user.email,
        "ibkr_connected": current_user.ibkr_connected,
    }
