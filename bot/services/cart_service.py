from datetime import datetime, timedelta

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from bot.models import CartEvent, Subscriber

ABANDONMENT_DELAY = timedelta(hours=6)


async def record_view(session: AsyncSession, subscriber: Subscriber, product_id: int) -> None:
    """Refresh the existing pending view for this subscriber+product instead
    of inserting a new row every time — otherwise repeatedly viewing the
    same product (e.g. paging back and forth in the catalog) creates one
    CartEvent per view, and every one of them fires its own reminder once
    it ages past ABANDONMENT_DELAY."""
    result = await session.execute(
        select(CartEvent).where(
            CartEvent.subscriber_id == subscriber.id,
            CartEvent.product_id == product_id,
            CartEvent.ordered.is_(False),
            CartEvent.reminder_sent.is_(False),
        )
    )
    existing = result.scalars().first()
    if existing is not None:
        existing.viewed_at = datetime.utcnow()
    else:
        session.add(CartEvent(subscriber_id=subscriber.id, product_id=product_id))
    await session.commit()


async def mark_ordered(session: AsyncSession, subscriber: Subscriber, product_id: int) -> None:
    result = await session.execute(
        select(CartEvent).where(
            CartEvent.subscriber_id == subscriber.id,
            CartEvent.product_id == product_id,
            CartEvent.ordered.is_(False),
        )
    )
    for event in result.scalars().all():
        event.ordered = True
    await session.commit()


async def find_abandoned(session: AsyncSession, now: datetime | None = None) -> list[CartEvent]:
    now = now or datetime.utcnow()
    cutoff = now - ABANDONMENT_DELAY
    result = await session.execute(
        select(CartEvent)
        .where(
            CartEvent.ordered.is_(False),
            CartEvent.reminder_sent.is_(False),
            CartEvent.viewed_at <= cutoff,
        )
        .options(selectinload(CartEvent.subscriber), selectinload(CartEvent.product))
        .order_by(CartEvent.viewed_at.desc())
    )
    events = list(result.scalars().all())

    # Defense in depth: collapse to one event per (subscriber, product) pair
    # so any duplicate rows already sitting in the database (from before
    # record_view deduplicated) still only ever trigger a single reminder.
    deduped: dict[tuple[int, int], CartEvent] = {}
    for event in events:
        key = (event.subscriber_id, event.product_id)
        if key not in deduped:
            deduped[key] = event
    return list(deduped.values())


async def mark_reminder_sent(session: AsyncSession, event: CartEvent) -> None:
    """Marks every pending row for this subscriber+product, not just the one
    passed in — clears out any leftover duplicate rows in the same pass
    instead of leaving them to fire on their own later."""
    result = await session.execute(
        select(CartEvent).where(
            CartEvent.subscriber_id == event.subscriber_id,
            CartEvent.product_id == event.product_id,
            CartEvent.ordered.is_(False),
            CartEvent.reminder_sent.is_(False),
        )
    )
    for row in result.scalars().all():
        row.reminder_sent = True
    await session.commit()
