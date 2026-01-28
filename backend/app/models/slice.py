"""
Slice Model

Represents an individual holding within a pie.
"""

from datetime import datetime
from decimal import Decimal
from typing import TYPE_CHECKING, Optional
from uuid import UUID

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, Numeric, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.pie import Pie


class Slice(Base):
    """Slice model - represents an individual holding within a pie."""

    __tablename__ = "slices"
    __table_args__ = (
        UniqueConstraint("pie_id", "symbol", name="uq_slice_pie_symbol"),
    )

    id: Mapped[UUID] = mapped_column(primary_key=True, server_default="gen_random_uuid()")
    pie_id: Mapped[UUID] = mapped_column(ForeignKey("pies.id", ondelete="CASCADE"), nullable=False)
    symbol: Mapped[str] = mapped_column(String(20), nullable=False)
    name: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    target_weight: Mapped[Decimal] = mapped_column(Numeric(5, 2), nullable=False)
    display_order: Mapped[int] = mapped_column(Integer, default=0)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default="now()")
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default="now()")

    # Relationships
    pie: Mapped["Pie"] = relationship("Pie", back_populates="slices")

    def __repr__(self) -> str:
        return f"<Slice(id={self.id}, symbol='{self.symbol}', weight={self.target_weight}%)>"
