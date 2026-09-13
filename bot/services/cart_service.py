from datetime import datetime, timedelta

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from bot.models import CartEvent, Subscriber

ABANDONMENT_DELAY = timedelta(hours=2)


async def record_view(session: AsyncSession, subscriber: Subscriber, product_id: int) -> None:
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
    )
    return list(result.scalars().all())


async def mark_reminder_sent(session: AsyncSession, event: CartEvent) -> None:
    event.reminder_sent = True
    await session.commit()
