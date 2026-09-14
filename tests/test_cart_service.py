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


async def test_record_view_deduplicates_repeated_views(session):
    """Viewing the same product multiple times (e.g. paging back and forth
    in the catalog) must refresh the existing row, not insert a new one —
    otherwise each view later fires its own abandonment reminder."""
    subscriber, _ = await subscriber_service.get_or_create(session, telegram_id=1)
    product = Product(name="A", price=1.0)
    session.add(product)
    await session.commit()

    for _ in range(5):
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
        viewed_at=datetime.utcnow() - timedelta(hours=7),
    )
    recent_event = CartEvent(
        subscriber_id=subscriber.id,
        product_id=product.id,
        viewed_at=datetime.utcnow(),
    )
    session.add_all([old_event, recent_event])
    await session.commit()

    abandoned = await cart_service.find_abandoned(session)
    assert [e.id for e in abandoned] == [old_event.id]


async def test_abandoned_excludes_ordered(session):
    subscriber, _ = await subscriber_service.get_or_create(session, telegram_id=1)
    product = Product(name="A", price=1.0)
    session.add(product)
    await session.commit()

    ordered_event = CartEvent(
        subscriber_id=subscriber.id,
        product_id=product.id,
        viewed_at=datetime.utcnow() - timedelta(hours=7),
        ordered=True,
    )
    session.add(ordered_event)
    await session.commit()

    abandoned = await cart_service.find_abandoned(session)
    assert abandoned == []


async def test_abandoned_deduplicates_multiple_pending_rows(session):
    """Simulates leftover duplicate rows from before record_view
    deduplicated — find_abandoned must still return only one per
    (subscriber, product) pair."""
    subscriber, _ = await subscriber_service.get_or_create(session, telegram_id=1)
    product = Product(name="A", price=1.0)
    session.add(product)
    await session.commit()

    session.add_all(
        [
            CartEvent(
                subscriber_id=subscriber.id,
                product_id=product.id,
                viewed_at=datetime.utcnow() - timedelta(hours=7),
            ),
            CartEvent(
                subscriber_id=subscriber.id,
                product_id=product.id,
                viewed_at=datetime.utcnow() - timedelta(hours=8),
            ),
            CartEvent(
                subscriber_id=subscriber.id,
                product_id=product.id,
                viewed_at=datetime.utcnow() - timedelta(hours=9),
            ),
        ]
    )
    await session.commit()

    abandoned = await cart_service.find_abandoned(session)
    assert len(abandoned) == 1


async def test_mark_reminder_sent_clears_all_duplicate_rows(session):
    subscriber, _ = await subscriber_service.get_or_create(session, telegram_id=1)
    product = Product(name="A", price=1.0)
    session.add(product)
    await session.commit()

    session.add_all(
        [
            CartEvent(
                subscriber_id=subscriber.id,
                product_id=product.id,
                viewed_at=datetime.utcnow() - timedelta(hours=7),
            ),
            CartEvent(
                subscriber_id=subscriber.id,
                product_id=product.id,
                viewed_at=datetime.utcnow() - timedelta(hours=8),
            ),
        ]
    )
    await session.commit()

    [event] = await cart_service.find_abandoned(session)
    await cart_service.mark_reminder_sent(session, event)

    assert await cart_service.find_abandoned(session) == []


async def test_mark_ordered_flags_matching_events(session):
    subscriber, _ = await subscriber_service.get_or_create(session, telegram_id=1)
    product = Product(name="A", price=1.0)
    session.add(product)
    await session.commit()

    await cart_service.record_view(session, subscriber, product.id)
    await cart_service.mark_ordered(session, subscriber, product.id)

    abandoned = await cart_service.find_abandoned(
        session, now=datetime.utcnow() + timedelta(hours=7)
    )
    assert abandoned == []
