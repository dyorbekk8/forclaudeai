import pytest

from bot.models import Product
from bot.services import order_service, product_service, subscriber_service


@pytest.mark.asyncio
async def test_bestseller_ids_ranks_by_units_ordered(session):
    subscriber, _ = await subscriber_service.get_or_create(session, telegram_id=1)
    popular = Product(name="Popular", price=10.0)
    unpopular = Product(name="Unpopular", price=10.0)
    never_ordered = Product(name="Never ordered", price=10.0)
    session.add_all([popular, unpopular, never_ordered])
    await session.commit()

    await order_service.create_order(session, subscriber, [(popular, 5)], "A", "1", "addr")
    await order_service.create_order(session, subscriber, [(unpopular, 1)], "A", "1", "addr")

    bestsellers = await product_service.bestseller_ids(session)

    assert popular.id in bestsellers
    assert unpopular.id not in bestsellers  # below BESTSELLER_MIN_ORDERS
    assert never_ordered.id not in bestsellers


@pytest.mark.asyncio
async def test_bestseller_ids_empty_when_no_orders(session):
    product = Product(name="A", price=1.0)
    session.add(product)
    await session.commit()

    assert await product_service.bestseller_ids(session) == set()
