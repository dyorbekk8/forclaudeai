from sqlalchemy import BigInteger, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from bot.models.base import Base


class PaymeTransaction(Base):
    """Tracks Payme's own transaction lifecycle, kept separate from Order
    because Payme's protocol (CheckPerformTransaction -> CreateTransaction ->
    PerformTransaction/CancelTransaction) requires the merchant to persist
    and echo back these exact records, independent of our own order state."""

    __tablename__ = "payme_transactions"

    id: Mapped[str] = mapped_column(String(50), primary_key=True)
    order_id: Mapped[int] = mapped_column(ForeignKey("orders.id"))
    amount: Mapped[int] = mapped_column(
        BigInteger, doc="Amount in tiyin (1/100 UZS), per Payme's protocol"
    )
    state: Mapped[int] = mapped_column(
        Integer, default=1, doc="1=created, 2=completed, -1/-2=cancelled"
    )
    create_time: Mapped[int] = mapped_column(BigInteger, default=0)
    perform_time: Mapped[int] = mapped_column(BigInteger, default=0)
    cancel_time: Mapped[int] = mapped_column(BigInteger, default=0)
    reason: Mapped[int | None] = mapped_column(Integer, nullable=True)

    def __str__(self) -> str:
        return f"PaymeTransaction {self.id}"
