from datetime import datetime

from sqlalchemy import Boolean, DateTime, String, func
from sqlalchemy.orm import Mapped, mapped_column

from bot.models.base import Base


class Client(Base):
    """A store/tenant that ShopMate is deployed for.

    In the current single-tenant deployment model, exactly one active Client
    row describes the store this bot instance serves. The model exists so a
    future multi-tenant SaaS version (see FUTURE_IDEAS.md) can add more rows
    without a schema change.
    """

    __tablename__ = "clients"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(200))
    bot_token: Mapped[str | None] = mapped_column(String(200), nullable=True)
    owner_telegram_id: Mapped[int | None] = mapped_column(nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    def __str__(self) -> str:
        return self.name
