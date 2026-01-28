"""
Pie API Endpoints

CRUD endpoints for managing pies.
"""

from decimal import Decimal
from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user_id
from app.core.database import get_db
from app.schemas.pie_slice import (
    PieCreate,
    PieUpdate,
    PieWithSlicesResponse,
    PieListResponse,
    ReorderRequest,
)
from app.services.pie_service import PieService

router = APIRouter(prefix="/pies", tags=["pies"])


def _pie_to_response(pie) -> PieWithSlicesResponse:
    """Convert a Pie model to response schema."""
    return PieWithSlicesResponse(
        id=pie.id,
        user_id=pie.user_id,
        name=pie.name,
        description=pie.description,
        color=pie.color,
        icon=pie.icon,
        target_allocation=pie.target_allocation,
        display_order=pie.display_order,
        is_active=pie.is_active,
        created_at=pie.created_at,
        updated_at=pie.updated_at,
        slices=[
            {
                "id": s.id,
                "pie_id": s.pie_id,
                "symbol": s.symbol,
                "name": s.name,
                "target_weight": s.target_weight,
                "display_order": s.display_order,
                "notes": s.notes,
                "is_active": s.is_active,
                "created_at": s.created_at,
                "updated_at": s.updated_at,
            }
            for s in (pie.slices or [])
            if s.is_active
        ],
        total_slice_weight=pie.total_slice_weight,
        slice_count=pie.slice_count,
    )


@router.get("", response_model=PieListResponse)
async def get_pies(
    include_inactive: bool = False,
    db: AsyncSession = Depends(get_db),
    user_id: UUID = Depends(get_current_user_id),
):
    """Get all pies for the current user."""
    service = PieService(db)
    pies = await service.get_all_by_user(user_id, include_inactive=include_inactive)
    total_allocation = await service.get_total_allocation(user_id)
    
    return PieListResponse(
        pies=[_pie_to_response(p) for p in pies],
        total_allocation=total_allocation,
    )


@router.get("/{pie_id}", response_model=PieWithSlicesResponse)
async def get_pie(
    pie_id: UUID,
    db: AsyncSession = Depends(get_db),
    user_id: UUID = Depends(get_current_user_id),
):
    """Get a specific pie by ID."""
    service = PieService(db)
    pie = await service.get_by_id(pie_id, user_id)
    
    if not pie:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pie not found",
        )
    
    return _pie_to_response(pie)


@router.post("", response_model=PieWithSlicesResponse, status_code=status.HTTP_201_CREATED)
async def create_pie(
    data: PieCreate,
    db: AsyncSession = Depends(get_db),
    user_id: UUID = Depends(get_current_user_id),
):
    """Create a new pie."""
    service = PieService(db)
    
    # Check total allocation won't exceed 100%
    current_total = await service.get_total_allocation(user_id)
    if current_total + data.target_allocation > Decimal("100"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Total allocation would exceed 100%. Current: {current_total}%, "
                   f"Requested: {data.target_allocation}%",
        )
    
    pie = await service.create(
        user_id=user_id,
        name=data.name,
        description=data.description,
        color=data.color,
        icon=data.icon,
        target_allocation=data.target_allocation,
    )
    
    return _pie_to_response(pie)


@router.patch("/{pie_id}", response_model=PieWithSlicesResponse)
async def update_pie(
    pie_id: UUID,
    data: PieUpdate,
    db: AsyncSession = Depends(get_db),
    user_id: UUID = Depends(get_current_user_id),
):
    """Update a pie."""
    service = PieService(db)
    
    # If updating allocation, check it won't exceed 100%
    if data.target_allocation is not None:
        existing_pie = await service.get_by_id(pie_id, user_id)
        if not existing_pie:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Pie not found",
            )
        
        current_total = await service.get_total_allocation(user_id)
        new_total = current_total - existing_pie.target_allocation + data.target_allocation
        if new_total > Decimal("100"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Total allocation would exceed 100%. New total would be: {new_total}%",
            )
    
    pie = await service.update(
        pie_id=pie_id,
        user_id=user_id,
        name=data.name,
        description=data.description,
        color=data.color,
        icon=data.icon,
        target_allocation=data.target_allocation,
        is_active=data.is_active,
    )
    
    if not pie:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pie not found",
        )
    
    return _pie_to_response(pie)


@router.delete("/{pie_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_pie(
    pie_id: UUID,
    db: AsyncSession = Depends(get_db),
    user_id: UUID = Depends(get_current_user_id),
):
    """Delete a pie and all its slices."""
    service = PieService(db)
    deleted = await service.delete(pie_id, user_id)
    
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pie not found",
        )


@router.post("/reorder", status_code=status.HTTP_204_NO_CONTENT)
async def reorder_pies(
    data: ReorderRequest,
    db: AsyncSession = Depends(get_db),
    user_id: UUID = Depends(get_current_user_id),
):
    """Reorder pies by providing a list of pie IDs in the desired order."""
    service = PieService(db)
    await service.reorder(user_id, data.ids)
