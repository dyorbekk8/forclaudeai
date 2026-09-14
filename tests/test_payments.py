import time

import pytest
from starlette.testclient import TestClient

from bot.config import settings
from bot.models import Order, OrderStatus
from bot.payments.click import ClickProvider
from bot.payments.payme import PaymeError, PaymeProvider
from bot.payments.stripe_provider import StripeProvider
from bot.services import order_service, subscriber_service


@pytest.fixture
def click(monkeypatch):
    monkeypatch.setattr(settings, "click_merchant_id", "12345")
    monkeypatch.setattr(settings, "click_service_id", "6789")
    monkeypatch.setattr(settings, "click_secret_key", "test-secret")
    return ClickProvider()


@pytest.fixture
def payme(monkeypatch):
    monkeypatch.setattr(settings, "payme_merchant_id", "abc123merchant")
    monkeypatch.setattr(settings, "payme_secret_key", "test-secret")
    return PaymeProvider()


async def _make_order(session) -> Order:
    subscriber, _ = await subscriber_service.get_or_create(session, telegram_id=1)
    from bot.models import Product

    product = Product(name="Widget", price=10.00)
    session.add(product)
    await session.commit()
    return await order_service.create_order(
        session, subscriber, [(product, 1)], "Jane", "+998900000000", "addr"
    )


def test_click_enabled_requires_merchant_and_service_id(click):
    assert click.enabled is True


def test_click_disabled_without_config():
    assert ClickProvider().enabled is False


@pytest.mark.asyncio
async def test_click_build_payment_link(session, click):
    order = await _make_order(session)
    link = click.build_payment_link(order)
    assert "my.click.uz" in link.url
    assert f"transaction_param={order.id}" in link.url
    assert "service_id=6789" in link.url


def test_click_prepare_signature_roundtrip(click):
    data = {
        "click_trans_id": "111",
        "merchant_trans_id": "42",
        "amount": "10.00",
        "action": "0",
        "sign_time": "2026-01-01 00:00:00",
    }
    data["sign_string"] = click._sign_prepare(
        data["click_trans_id"],
        data["merchant_trans_id"],
        data["amount"],
        data["action"],
        data["sign_time"],
    )
    assert click.verify_prepare_signature(data) is True

    data["sign_string"] = "tampered"
    assert click.verify_prepare_signature(data) is False


def test_payme_build_payment_link_is_base64(payme):
    import base64

    order = Order(id=99, subscriber_id=1, full_name="A", phone="1", address="a", total_amount=15.5)
    link = payme.build_payment_link(order)
    encoded = link.url.split("/")[-1]
    decoded = base64.b64decode(encoded).decode()
    assert "m=abc123merchant" in decoded
    assert "ac.order_id=99" in decoded
    assert "a=1550" in decoded


@pytest.mark.asyncio
async def test_payme_create_and_perform_transaction(session, payme):
    order = await _make_order(session)
    amount = round(float(order.total_amount) * 100)

    check = await payme.check_perform_transaction(
        session, {"amount": amount, "account": {"order_id": order.id}}
    )
    assert check == {"allow": True}

    created = await payme.create_transaction(
        session,
        {
            "id": "txn1",
            "time": int(time.time() * 1000),
            "amount": amount,
            "account": {"order_id": order.id},
        },
    )
    assert created["state"] == 1

    performed = await payme.perform_transaction(session, {"id": "txn1"})
    assert performed["state"] == 2

    await session.refresh(order)
    assert order.status == OrderStatus.COMPLETED


@pytest.mark.asyncio
async def test_payme_get_statement_lists_transactions_in_window(session, payme):
    order = await _make_order(session)
    amount = round(float(order.total_amount) * 100)
    now_ms = int(time.time() * 1000)

    await payme.create_transaction(
        session,
        {"id": "txn-in-range", "time": now_ms, "amount": amount, "account": {"order_id": order.id}},
    )

    statement = await payme.get_statement(session, {"from": now_ms - 1000, "to": now_ms + 1000})
    assert len(statement["transactions"]) == 1
    assert statement["transactions"][0]["id"] == "txn-in-range"

    empty_statement = await payme.get_statement(
        session, {"from": now_ms + 10_000, "to": now_ms + 20_000}
    )
    assert empty_statement["transactions"] == []


@pytest.mark.asyncio
async def test_payme_wrong_amount_raises(session, payme):
    order = await _make_order(session)
    with pytest.raises(PaymeError):
        await payme.check_perform_transaction(
            session, {"amount": 1, "account": {"order_id": order.id}}
        )


@pytest.mark.asyncio
async def test_payme_cancel_transaction(session, payme):
    order = await _make_order(session)
    amount = round(float(order.total_amount) * 100)
    await payme.create_transaction(
        session, {"id": "txn2", "time": 0, "amount": amount, "account": {"order_id": order.id}}
    )

    cancelled = await payme.cancel_transaction(session, {"id": "txn2", "reason": 3})
    assert cancelled["state"] == -1

    await session.refresh(order)
    assert order.status == OrderStatus.CANCELLED


def test_stripe_webhook_signature_roundtrip(monkeypatch):
    import hashlib
    import hmac as hmac_lib
    import time

    monkeypatch.setattr(settings, "stripe_webhook_secret", "whsec_test")
    provider = StripeProvider()

    payload = b'{"type": "checkout.session.completed"}'
    timestamp = str(int(time.time()))
    signed_payload = f"{timestamp}.{payload.decode()}".encode()
    signature = hmac_lib.new(b"whsec_test", signed_payload, hashlib.sha256).hexdigest()
    header = f"t={timestamp},v1={signature}"

    assert provider.verify_webhook_signature(payload, header) is True
    assert provider.verify_webhook_signature(payload, f"t={timestamp},v1=deadbeef") is False


def test_stripe_webhook_rejects_without_secret_configured():
    provider = StripeProvider()
    assert provider.verify_webhook_signature(b"{}", "t=1,v1=abc") is False


def test_payme_webhook_rejects_bad_auth():
    from admin.main import app

    with TestClient(app) as client:
        response = client.post(
            "/payments/payme", json={"method": "CheckTransaction", "params": {}, "id": 1}
        )
        body = response.json()
        assert body["error"]["code"] == -32504
