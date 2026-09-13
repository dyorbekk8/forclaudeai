from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from bot.models.base import Base


class CartEvent(Base):
    """Records that a subscriber viewed a product, for cart-abandonment reminders."""

    __tablename__ = "cart_events"

    id: Mapped[int] = mapped_column(primary_key=True)
    subscriber_id: Mapped[int] = mapped_column(ForeignKey("subscribers.id"))
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"))
    viewed_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    ordered: Mapped[bool] = mapped_column(Boolean, default=False)
    reminder_sent: Mapped[bool] = mapped_column(Boolean, default=False)

    subscriber: Mapped["Subscriber"] = relationship()  # noqa: F821
    product: Mapped["Product"] = relationship()  # noqa: F821

    def __str__(self) -> str:
        return f"CartEvent #{self.id}"
