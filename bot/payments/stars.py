from aiogram import Bot
from aiogram.types import LabeledPrice

from bot.config import settings
from bot.models import Order

STARS_CURRENCY = "XTR"


class StarsProvider:
    """Telegram Stars: a native in-chat invoice, no external merchant account
    needed. Always available — Stars are built into Telegram itself."""

    key = "stars"

    @property
    def enabled(self) -> bool:
        return True

    def amount_in_stars(self, order: Order) -> int:
        return max(1, round(float(order.total_amount) * settings.stars_per_usd))

    async def send_invoice(self, bot: Bot, chat_id: int, order: Order) -> None:
        amount = self.amount_in_stars(order)
        await bot.send_invoice(
            chat_id=chat_id,
            title=f"Order #{order.id}",
            description=f"Payment for order #{order.id} at {settings.store_name}",
            payload=f"order:{order.id}",
            provider_token="",
            currency=STARS_CURRENCY,
            prices=[LabeledPrice(label=f"Order #{order.id}", amount=amount)],
        )
