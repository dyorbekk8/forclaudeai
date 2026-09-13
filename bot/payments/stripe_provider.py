import httpx

from bot.config import settings
from bot.models import Order
from bot.payments.base import PaymentLink

STRIPE_API_URL = "https://api.stripe.com/v1/checkout/sessions"


class StripeProvider:
    """International card payments via Stripe Checkout. Needs only
    STRIPE_KEY — no pre-created Stripe Product/Price required, since we
    build the line item inline with `price_data` on each call."""

    key = "stripe"

    @property
    def enabled(self) -> bool:
        return bool(settings.stripe_key)

    async def build_payment_link(
        self, order: Order, success_url: str = "https://t.me/", cancel_url: str = "https://t.me/"
    ) -> PaymentLink:
        data = {
            "mode": "payment",
            "success_url": success_url,
            "cancel_url": cancel_url,
            "line_items[0][quantity]": "1",
            "line_items[0][price_data][currency]": "usd",
            "line_items[0][price_data][unit_amount]": str(round(float(order.total_amount) * 100)),
            "line_items[0][price_data][product_data][name]": f"Order #{order.id} — {settings.store_name}",
        }
        async with httpx.AsyncClient(timeout=15) as client:
            response = await client.post(
                STRIPE_API_URL,
                data=data,
                headers={"Authorization": f"Bearer {settings.stripe_key}"},
            )
            response.raise_for_status()
            session = response.json()

        return PaymentLink(provider=self.key, url=session["url"])


stripe_provider = StripeProvider()
