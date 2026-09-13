import hashlib
import hmac
import time

import httpx

from bot.config import settings
from bot.models import Order
from bot.payments.base import PaymentLink

STRIPE_API_URL = "https://api.stripe.com/v1/checkout/sessions"
WEBHOOK_TOLERANCE_SECONDS = 300


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
            "client_reference_id": str(order.id),
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

    def verify_webhook_signature(self, payload: bytes, signature_header: str) -> bool:
        """Verify Stripe's `Stripe-Signature` header per Stripe's documented
        scheme, without needing the Stripe SDK: the header carries a
        timestamp (`t=`) and one or more signatures (`v1=`), each computed
        as HMAC-SHA256(webhook_secret, f"{timestamp}.{payload}")."""
        if not settings.stripe_webhook_secret:
            return False

        parts = dict(item.split("=", 1) for item in signature_header.split(",") if "=" in item)
        timestamp = parts.get("t")
        signature = parts.get("v1")
        if not timestamp or not signature:
            return False

        if abs(time.time() - int(timestamp)) > WEBHOOK_TOLERANCE_SECONDS:
            return False

        signed_payload = f"{timestamp}.{payload.decode()}".encode()
        expected = hmac.new(
            settings.stripe_webhook_secret.encode(), signed_payload, hashlib.sha256
        ).hexdigest()
        return hmac.compare_digest(expected, signature)


stripe_provider = StripeProvider()
