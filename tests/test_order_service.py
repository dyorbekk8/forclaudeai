import pytest

from bot.models import OrderStatus, Product
from bot.services import order_service, subscriber_service

pytestmark = pytest.mark.asyncio


async def test_create_order_computes_total(session):
    subscriber, _ = await subscriber_service.get_or_create(session, telegram_id=1)
    p1 = Product(name="A", price=10.00)
    p2 = Product(name="B", price=5.50)
    session.add_all([p1, p2])
    await session.commit()

    order = await order_service.create_order(
        session,
        subscriber,
        items=[(p1, 2), (p2, 1)],
        full_name="John Doe",
        phone="+998901234567",
        address="Tashkent, street 1",
    )

    assert float(order.total_amount) == 25.50
    assert order.status == OrderStatus.NEW
    assert len(order.items) == 2


async def test_list_for_subscriber_returns_orders_newest_first(session):
    subscriber, _ = await subscriber_service.get_or_create(session, telegram_id=2)
    product = Product(name="A", price=1.0)
    session.add(product)
    await session.commit()

    first = await order_service.create_order(session, subscriber, [(product, 1)], "A", "1", "addr")
    second = await order_service.create_order(session, subscriber, [(product, 1)], "A", "1", "addr")

    orders = await order_service.list_for_subscriber(session, subscriber)
    assert [o.id for o in orders] == [second.id, first.id]


async def test_update_status(session):
    subscriber, _ = await subscriber_service.get_or_create(session, telegram_id=3)
    product = Product(name="A", price=1.0)
    session.add(product)
    await session.commit()

    order = await order_service.create_order(session, subscriber, [(product, 1)], "A", "1", "addr")
    updated = await order_service.update_status(session, order, OrderStatus.COMPLETED)

    assert updated.status == OrderStatus.COMPLETED
