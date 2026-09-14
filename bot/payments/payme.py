import base64
import time

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from bot.config import settings
from bot.models import Order, OrderStatus, PaymeTransaction
from bot.payments.base import PaymentLink

PAYME_CHECKOUT_BASE_URL = "https://checkout.paycom.uz"

ERROR_INVALID_AMOUNT = -31001
ERROR_ORDER_NOT_FOUND = -31050
ERROR_TRANSACTION_NOT_FOUND = -31003
ERROR_UNABLE_TO_PERFORM = -31008
ERROR_UNABLE_TO_CANCEL = -31007


class PaymeError(Exception):
    def __init__(self, code: int, message: str):
        super().__init__(message)
        self.code = code
        self.message = message


class PaymeProvider:
    """Payme — the other dominant local payment gateway in Uzbekistan.

    `build_payment_link` needs only PAYME_MERCHANT_ID and produces Payme's
    documented checkout link (no pre-registration of the order required).

    The `check_perform_transaction`/`create_transaction`/`perform_transaction`/
    `cancel_transaction`/`check_transaction` methods implement Payme's
    JSON-RPC merchant protocol — see PAYMENTS_GUIDE.md for how Payme calls
    these against your webhook endpoint, and PAYME_SECRET_KEY setup.
    """

    key = "payme"

    @property
    def enabled(self) -> bool:
        return bool(settings.payme_merchant_id)

    def build_payment_link(self, order: Order) -> PaymentLink:
        amount_tiyin = round(float(order.total_amount) * 100)
        raw = f"m={settings.payme_merchant_id};ac.order_id={order.id};a={amount_tiyin}"
        encoded = base64.b64encode(raw.encode()).decode()
        return PaymentLink(provider=self.key, url=f"{PAYME_CHECKOUT_BASE_URL}/{encoded}")

    async def _get_order(self, session: AsyncSession, params: dict) -> Order:
        try:
            order_id = int(params["account"]["order_id"])
        except (KeyError, TypeError, ValueError) as exc:
            raise PaymeError(ERROR_ORDER_NOT_FOUND, "order_id is required") from exc

        order = await session.get(Order, order_id)
        if order is None:
            raise PaymeError(ERROR_ORDER_NOT_FOUND, "Order not found")
        return order

    async def check_perform_transaction(self, session: AsyncSession, params: dict) -> dict:
        order = await self._get_order(session, params)
        expected_amount = round(float(order.total_amount) * 100)
        if int(params.get("amount", -1)) != expected_amount:
            raise PaymeError(ERROR_INVALID_AMOUNT, "Incorrect amount")
        return {"allow": True}

    async def create_transaction(self, session: AsyncSession, params: dict) -> dict:
        transaction_id = params["id"]
        existing = await session.get(PaymeTransaction, transaction_id)
        if existing:
            return {
                "create_time": existing.create_time,
                "transaction": existing.id,
                "state": existing.state,
            }

        order = await self._get_order(session, params)
        expected_amount = round(float(order.total_amount) * 100)
        if int(params.get("amount", -1)) != expected_amount:
            raise PaymeError(ERROR_INVALID_AMOUNT, "Incorrect amount")

        now_ms = int(time.time() * 1000)
        transaction = PaymeTransaction(
            id=transaction_id,
            order_id=order.id,
            amount=params["amount"],
            state=1,
            create_time=now_ms,
        )
        session.add(transaction)
        await session.commit()
        return {"create_time": now_ms, "transaction": transaction_id, "state": 1}

    async def perform_transaction(self, session: AsyncSession, params: dict) -> dict:
        transaction = await session.get(PaymeTransaction, params["id"])
        if transaction is None:
            raise PaymeError(ERROR_TRANSACTION_NOT_FOUND, "Transaction not found")

        if transaction.state == 2:
            return {
                "transaction": transaction.id,
                "perform_time": transaction.perform_time,
                "state": transaction.state,
            }
        if transaction.state != 1:
            raise PaymeError(ERROR_UNABLE_TO_PERFORM, "Transaction is not in a performable state")

        now_ms = int(time.time() * 1000)
        transaction.state = 2
        transaction.perform_time = now_ms

        order = await session.get(Order, transaction.order_id)
        if order is not None:
            order.status = OrderStatus.COMPLETED

        await session.commit()
        return {"transaction": transaction.id, "perform_time": now_ms, "state": 2}

    async def cancel_transaction(self, session: AsyncSession, params: dict) -> dict:
        transaction = await session.get(PaymeTransaction, params["id"])
        if transaction is None:
            raise PaymeError(ERROR_TRANSACTION_NOT_FOUND, "Transaction not found")

        if transaction.state in (-1, -2):
            return {
                "transaction": transaction.id,
                "cancel_time": transaction.cancel_time,
                "state": transaction.state,
            }

        now_ms = int(time.time() * 1000)
        transaction.state = -2 if transaction.state == 2 else -1
        transaction.cancel_time = now_ms
        transaction.reason = params.get("reason")

        order = await session.get(Order, transaction.order_id)
        if order is not None:
            order.status = OrderStatus.CANCELLED

        await session.commit()
        return {"transaction": transaction.id, "cancel_time": now_ms, "state": transaction.state}

    async def check_transaction(self, session: AsyncSession, params: dict) -> dict:
        transaction = await session.get(PaymeTransaction, params["id"])
        if transaction is None:
            raise PaymeError(ERROR_TRANSACTION_NOT_FOUND, "Transaction not found")

        return {
            "create_time": transaction.create_time,
            "perform_time": transaction.perform_time,
            "cancel_time": transaction.cancel_time,
            "transaction": transaction.id,
            "state": transaction.state,
            "reason": transaction.reason,
        }

    async def get_statement(self, session: AsyncSession, params: dict) -> dict:
        """Lists transactions in a time window, for Payme's reconciliation
        reports in the merchant dashboard. `from`/`to` are ms-epoch bounds
        on create_time, per Payme's protocol."""
        period_from = params.get("from", 0)
        period_to = params.get("to", int(time.time() * 1000))

        result = await session.execute(
            select(PaymeTransaction)
            .where(PaymeTransaction.create_time >= period_from)
            .where(PaymeTransaction.create_time <= period_to)
            .order_by(PaymeTransaction.create_time)
        )
        transactions = [
            {
                "id": txn.id,
                "time": txn.create_time,
                "amount": txn.amount,
                "account": {"order_id": str(txn.order_id)},
                "create_time": txn.create_time,
                "perform_time": txn.perform_time,
                "cancel_time": txn.cancel_time,
                "transaction": txn.id,
                "state": txn.state,
                "reason": txn.reason,
            }
            for txn in result.scalars().all()
        ]
        return {"transactions": transactions}

    async def dispatch(self, session: AsyncSession, method: str, params: dict) -> dict:
        handlers = {
            "CheckPerformTransaction": self.check_perform_transaction,
            "CreateTransaction": self.create_transaction,
            "PerformTransaction": self.perform_transaction,
            "CancelTransaction": self.cancel_transaction,
            "CheckTransaction": self.check_transaction,
            "GetStatement": self.get_statement,
        }
        handler = handlers.get(method)
        if handler is None:
            raise PaymeError(-32601, f"Method {method} not found")
        return await handler(session, params)


payme_provider = PaymeProvider()
