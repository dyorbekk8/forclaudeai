import hashlib

from bot.config import settings
from bot.models import Order
from bot.payments.base import PaymentLink

CLICK_PAY_BASE_URL = "https://my.click.uz/services/pay"

# Click merchant API error codes (subset used by our handler).
ERROR_SUCCESS = 0
ERROR_SIGN_CHECK_FAILED = -1
ERROR_ALREADY_PAID = -4
ERROR_TRANSACTION_NOT_FOUND = -6
ERROR_ORDER_NOT_FOUND = -5


class ClickProvider:
    """Click.uz — one of the two dominant local payment gateways in Uzbekistan.

    `build_payment_link` needs only CLICK_MERCHANT_ID/CLICK_SERVICE_ID and
    produces Click's documented "pay by link" URL — no prior registration of
    the order with Click is required for this flow.

    `verify_signature`/`handle_prepare`/`handle_complete` implement Click's
    merchant callback protocol (see PAYMENTS_GUIDE.md) for when Click posts
    back to confirm a payment. They need CLICK_SECRET_KEY, issued together
    with your merchant account in the Click merchant panel.
    """

    key = "click"

    @property
    def enabled(self) -> bool:
        return bool(settings.click_merchant_id and settings.click_service_id)

    def build_payment_link(self, order: Order, return_url: str = "") -> PaymentLink:
        amount = f"{float(order.total_amount):.2f}"
        url = (
            f"{CLICK_PAY_BASE_URL}?service_id={settings.click_service_id}"
            f"&merchant_id={settings.click_merchant_id}"
            f"&amount={amount}"
            f"&transaction_param={order.id}"
        )
        if return_url:
            url += f"&return_url={return_url}"
        return PaymentLink(provider=self.key, url=url)

    def _sign_prepare(self, click_trans_id: str, merchant_trans_id: str, amount: str, action: str, sign_time: str) -> str:
        raw = f"{click_trans_id}{settings.click_service_id}{settings.click_secret_key}{merchant_trans_id}{amount}{action}{sign_time}"
        return hashlib.md5(raw.encode()).hexdigest()

    def _sign_complete(
        self,
        click_trans_id: str,
        merchant_trans_id: str,
        merchant_prepare_id: str,
        amount: str,
        action: str,
        sign_time: str,
    ) -> str:
        raw = (
            f"{click_trans_id}{settings.click_service_id}{settings.click_secret_key}"
            f"{merchant_trans_id}{merchant_prepare_id}{amount}{action}{sign_time}"
        )
        return hashlib.md5(raw.encode()).hexdigest()

    def verify_prepare_signature(self, data: dict) -> bool:
        expected = self._sign_prepare(
            data["click_trans_id"], data["merchant_trans_id"], data["amount"], data["action"], data["sign_time"]
        )
        return expected == data.get("sign_string")

    def verify_complete_signature(self, data: dict) -> bool:
        expected = self._sign_complete(
            data["click_trans_id"],
            data["merchant_trans_id"],
            data.get("merchant_prepare_id", ""),
            data["amount"],
            data["action"],
            data["sign_time"],
        )
        return expected == data.get("sign_string")


click_provider = ClickProvider()
