from datetime import datetime, timedelta

import pytest

from bot.models import CartEvent, Product
from bot.services import cart_service, subscriber_service

pytestmark = pytest.mark.asyncio


async def test_record_view_creates_event(session):
    subscriber, _ = await subscriber_service.get_or_create(session, telegram_id=1)
    product = Product(name="A", price=1.0)
    session.add(product)
    await session.commit()

    await cart_service.record_view(session, subscriber, product.id)

    events = (await session.execute(CartEvent.__table__.select())).fetchall()
    assert len(events) == 1


async def test_abandoned_excludes_recent_and_ordered(session):
    subscriber, _ = await subscriber_service.get_or_create(session, telegram_id=1)
    product = Product(name="A", price=1.0)
    session.add(product)
    await session.commit()

    old_event = CartEvent(
        subscriber_id=subscriber.id,
        product_id=product.id,
        viewed_at=datetime.utcnow() - timedelta(hours=3),
    )
    recent_event = CartEvent(
        subscriber_id=subscriber.id,
        product_id=product.id,
        viewed_at=datetime.utcnow(),
    )
    ordered_event = CartEvent(
        subscriber_id=subscriber.id,
        product_id=product.id,
        viewed_at=datetime.utcnow() - timedelta(hours=3),
        ordered=True,
    )
    session.add_all([old_event, recent_event, ordered_event])
    await session.commit()

    abandoned = await cart_service.find_abandoned(session)
    assert len(abandoned) == 1
    assert abandoned[0].id == old_event.id


async def test_mark_ordered_flags_matching_events(session):
    subscriber, _ = await subscriber_service.get_or_create(session, telegram_id=1)
    product = Product(name="A", price=1.0)
    session.add(product)
    await session.commit()

    await cart_service.record_view(session, subscriber, product.id)
    await cart_service.mark_ordered(session, subscriber, product.id)

    abandoned = await cart_service.find_abandoned(
        session, now=datetime.utcnow() + timedelta(hours=3)
    )
    assert abandoned == []
