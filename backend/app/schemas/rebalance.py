"""
Rebalance Schemas

Pydantic schemas for portfolio rebalancing operations.
"""

from decimal import Decimal

from pydantic import BaseModel, Field


class SliceRebalanceItem(BaseModel):
    """Schema for a single slice rebalance item."""

    slice_id: str = Field(..., description="Slice ID")
    symbol: str = Field(..., description="Stock/ETF symbol")
    name: str | None = Field(None, description="Company name")
    current_weight: Decimal = Field(..., description="Current weight percentage")
    target_weight: Decimal = Field(..., description="Target weight percentage")
    drift: Decimal = Field(..., description="Difference between current and target")
    suggested_action: str = Field(..., description="'buy', 'sell', or 'hold'")


class PieRebalanceItem(BaseModel):
    """Schema for a single pie rebalance item."""

    pie_id: str = Field(..., description="Pie ID")
    name: str = Field(..., description="Pie name")
    color: str = Field(..., description="Pie color")
    current_allocation: Decimal = Field(..., description="Current allocation percentage")
    target_allocation: Decimal = Field(..., description="Target allocation percentage")
    drift: Decimal = Field(..., description="Difference between current and target")
    slices: list[SliceRebalanceItem] = Field(default_factory=list, description="Slice rebalance items")


class RebalanceAnalysis(BaseModel):
    """Schema for rebalance analysis response."""

    portfolio_id: str = Field(..., description="Portfolio ID")
    total_drift: Decimal = Field(..., description="Total absolute drift across all pies")
    pies: list[PieRebalanceItem] = Field(default_factory=list, description="Pie rebalance items")
    needs_rebalancing: bool = Field(..., description="Whether portfolio needs rebalancing")


class RebalanceAction(BaseModel):
    """Schema for a single rebalance action."""

    pie_id: str = Field(..., description="Pie ID")
    new_allocation: Decimal = Field(..., description="New target allocation percentage")


class RebalanceRequest(BaseModel):
    """Schema for rebalance request."""

    actions: list[RebalanceAction] = Field(..., description="List of rebalance actions")


class RebalanceResult(BaseModel):
    """Schema for rebalance result."""

    success: bool = Field(..., description="Whether rebalance was successful")
    message: str = Field(..., description="Result message")
    updated_pies: list[str] = Field(default_factory=list, description="List of updated pie IDs")
