"""
Slice API Endpoints

CRUD endpoints for managing slices within pies.
"""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user_id
from app.core.database import get_db
from app.schemas.pie_slice import (
    SliceCreate,
    SliceUpdate,
    SliceResponse,
    ReorderRequest,
)
from app.services.slice_service import SliceService

router = APIRouter(prefix="/pies/{pie_id}/slices", tags=["slices"])


def _slice_to_response(slice_obj) -> SliceResponse:
    """Convert a Slice model to response schema."""
    return SliceResponse(
        id=slice_obj.id,
        pie_id=slice_obj.pie_id,
        symbol=slice_obj.symbol,
        name=slice_obj.name,
        target_weight=slice_obj.target_weight,
        display_order=slice_obj.display_order,
        notes=slice_obj.notes,
        is_active=slice_obj.is_active,
        created_at=slice_obj.created_at,
        updated_at=slice_obj.updated_at,
    )


@router.get("", response_model=list[SliceResponse])
async def get_slices(
    pie_id: UUID,
    include_inactive: bool = False,
    db: AsyncSession = Depends(get_db),
    user_id: UUID = Depends(get_current_user_id),
):
    """Get all slices for a pie."""
    service = SliceService(db)
    slices = await service.get_all_by_pie(pie_id, user_id, include_inactive=include_inactive)
    return [_slice_to_response(s) for s in slices]


@router.get("/{slice_id}", response_model=SliceResponse)
async def get_slice(
    pie_id: UUID,
    slice_id: UUID,
    db: AsyncSession = Depends(get_db),
    user_id: UUID = Depends(get_current_user_id),
):
    """Get a specific slice by ID."""
    service = SliceService(db)
    slice_obj = await service.get_by_id(slice_id, user_id)
    
    if not slice_obj or slice_obj.pie_id != pie_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Slice not found",
        )
    
    return _slice_to_response(slice_obj)


@router.post("", response_model=SliceResponse, status_code=status.HTTP_201_CREATED)
async def create_slice(
    pie_id: UUID,
    data: SliceCreate,
    db: AsyncSession = Depends(get_db),
    user_id: UUID = Depends(get_current_user_id),
):
    """Create a new slice in a pie."""
    service = SliceService(db)
    
    try:
        slice_obj = await service.create(
            pie_id=pie_id,
            user_id=user_id,
            symbol=data.symbol,
            target_weight=data.target_weight,
            name=data.name,
            notes=data.notes,
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    
    if not slice_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pie not found",
        )
    
    return _slice_to_response(slice_obj)


@router.patch("/{slice_id}", response_model=SliceResponse)
async def update_slice(
    pie_id: UUID,
    slice_id: UUID,
    data: SliceUpdate,
    db: AsyncSession = Depends(get_db),
    user_id: UUID = Depends(get_current_user_id),
):
    """Update a slice."""
    service = SliceService(db)
    
    # Verify the slice belongs to this pie
    existing = await service.get_by_id(slice_id, user_id)
    if not existing or existing.pie_id != pie_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Slice not found",
        )
    
    try:
        slice_obj = await service.update(
            slice_id=slice_id,
            user_id=user_id,
            symbol=data.symbol,
            name=data.name,
            target_weight=data.target_weight,
            notes=data.notes,
            is_active=data.is_active,
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    
    if not slice_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Slice not found",
        )
    
    return _slice_to_response(slice_obj)


@router.delete("/{slice_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_slice(
    pie_id: UUID,
    slice_id: UUID,
    db: AsyncSession = Depends(get_db),
    user_id: UUID = Depends(get_current_user_id),
):
    """Delete a slice from a pie."""
    service = SliceService(db)
    
    # Verify the slice belongs to this pie
    existing = await service.get_by_id(slice_id, user_id)
    if not existing or existing.pie_id != pie_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Slice not found",
        )
    
    deleted = await service.delete(slice_id, user_id)
    
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Slice not found",
        )


@router.post("/reorder", status_code=status.HTTP_204_NO_CONTENT)
async def reorder_slices(
    pie_id: UUID,
    data: ReorderRequest,
    db: AsyncSession = Depends(get_db),
    user_id: UUID = Depends(get_current_user_id),
):
    """Reorder slices by providing a list of slice IDs in the desired order."""
    service = SliceService(db)
    success = await service.reorder(pie_id, user_id, data.ids)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pie not found",
        )
