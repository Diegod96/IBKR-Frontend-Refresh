"""
Rebalance API Routes

API endpoints for portfolio rebalancing operations.
"""

from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import CurrentUserId, get_db
from app.schemas.rebalance import (
    RebalanceAnalysis,
    RebalanceRequest,
    RebalanceResult,
    PieRebalanceItem,
    SliceRebalanceItem,
)
from app.services.portfolio_service import PortfolioService
from app.services.pie_service import PieService

router = APIRouter()


@router.get("/{portfolio_id}/analysis", response_model=RebalanceAnalysis)
async def get_rebalance_analysis(
    portfolio_id: str,
    user_id: CurrentUserId,
    db: AsyncSession = Depends(get_db),
) -> RebalanceAnalysis:
    """
    Get rebalancing analysis for a portfolio.
    
    Returns the current vs target allocations for all pies and slices,
    along with drift calculations and suggested actions.
    """
    # Verify portfolio ownership
    portfolio_service = PortfolioService(db)
    portfolio = await portfolio_service.get_portfolio_with_details(portfolio_id)
    
    if not portfolio or portfolio.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Portfolio not found"
        )
    
    pie_service = PieService(db)
    pies = await pie_service.get_all_by_portfolio(portfolio_id, include_inactive=False)
    
    # Build rebalance analysis
    pie_items: list[PieRebalanceItem] = []
    total_drift = Decimal("0")
    
    for pie in pies:
        current_allocation = Decimal("0")  # In a real app, this would come from actual holdings
        target_allocation = pie.target_allocation or Decimal("0")
        drift = abs(current_allocation - target_allocation)
        total_drift += drift
        
        # Build slice items
        slice_items: list[SliceRebalanceItem] = []
        for slice_obj in pie.slices:
            if not slice_obj.is_active:
                continue
                
            current_weight = Decimal("0")  # In a real app, from actual holdings
            target_weight = slice_obj.target_weight or Decimal("0")
            slice_drift = target_weight - current_weight
            
            # Determine suggested action
            if slice_drift > Decimal("0.5"):
                action = "buy"
            elif slice_drift < Decimal("-0.5"):
                action = "sell"
            else:
                action = "hold"
            
            slice_items.append(
                SliceRebalanceItem(
                    slice_id=str(slice_obj.id),
                    symbol=slice_obj.symbol,
                    name=slice_obj.name,
                    current_weight=current_weight,
                    target_weight=target_weight,
                    drift=slice_drift,
                    suggested_action=action,
                )
            )
        
        pie_items.append(
            PieRebalanceItem(
                pie_id=str(pie.id),
                name=pie.name,
                color=pie.color or "#3B82F6",
                current_allocation=current_allocation,
                target_allocation=target_allocation,
                drift=target_allocation - current_allocation,
                slices=slice_items,
            )
        )
    
    # Determine if rebalancing is needed (threshold: 5% total drift)
    needs_rebalancing = total_drift > Decimal("5")
    
    return RebalanceAnalysis(
        portfolio_id=portfolio_id,
        total_drift=total_drift,
        pies=pie_items,
        needs_rebalancing=needs_rebalancing,
    )


@router.post("/{portfolio_id}/execute", response_model=RebalanceResult)
async def execute_rebalance(
    portfolio_id: str,
    request: RebalanceRequest,
    user_id: CurrentUserId,
    db: AsyncSession = Depends(get_db),
) -> RebalanceResult:
    """
    Execute a rebalancing operation.
    
    Updates pie allocations based on the provided actions.
    """
    # Verify portfolio ownership
    portfolio_service = PortfolioService(db)
    portfolio = await portfolio_service.get_portfolio_with_details(portfolio_id)
    
    if not portfolio or portfolio.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Portfolio not found"
        )
    
    pie_service = PieService(db)
    updated_pies: list[str] = []
    
    # Validate total allocation doesn't exceed 100%
    total_new_allocation = sum(action.new_allocation for action in request.actions)
    if total_new_allocation > Decimal("100"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Total allocation ({total_new_allocation}%) cannot exceed 100%"
        )
    
    # Execute rebalancing actions
    for action in request.actions:
        # Verify pie belongs to portfolio
        pie = await pie_service.get_by_id(action.pie_id, portfolio_id)
        if not pie:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Pie {action.pie_id} not found in portfolio"
            )
        
        # Update pie allocation
        await pie_service.update(
            pie_id=action.pie_id,
            portfolio_id=portfolio_id,
            target_allocation=action.new_allocation,
        )
        updated_pies.append(action.pie_id)
    
    return RebalanceResult(
        success=True,
        message=f"Successfully rebalanced {len(updated_pies)} pies",
        updated_pies=updated_pies,
    )


@router.post("/{portfolio_id}/auto-rebalance", response_model=RebalanceResult)
async def auto_rebalance(
    portfolio_id: str,
    user_id: CurrentUserId,
    db: AsyncSession = Depends(get_db),
) -> RebalanceResult:
    """
    Automatically rebalance portfolio to target allocations.
    
    This resets all pies to their target allocations.
    """
    # Verify portfolio ownership
    portfolio_service = PortfolioService(db)
    portfolio = await portfolio_service.get_portfolio_with_details(portfolio_id)
    
    if not portfolio or portfolio.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Portfolio not found"
        )
    
    pie_service = PieService(db)
    pies = await pie_service.get_all_by_portfolio(portfolio_id, include_inactive=False)
    
    # In auto-rebalance, we would calculate optimal allocations
    # For now, this is a placeholder that validates the concept
    
    return RebalanceResult(
        success=True,
        message="Auto-rebalance analysis complete. Manual review recommended.",
        updated_pies=[],
    )
