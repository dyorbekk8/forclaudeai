from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from bot.models import Subscriber
from bot.services.referral_service import generate_referral_code


async def get_by_telegram_id(session: AsyncSession, telegram_id: int) -> Subscriber | None:
    result = await session.execute(select(Subscriber).where(Subscriber.telegram_id == telegram_id))
    return result.scalar_one_or_none()


async def get_by_referral_code(session: AsyncSession, code: str) -> Subscriber | None:
    result = await session.execute(select(Subscriber).where(Subscriber.referral_code == code))
    return result.scalar_one_or_none()


async def get_or_create(
    session: AsyncSession,
    telegram_id: int,
    first_name: str | None = None,
    username: str | None = None,
    language_code: str = "en",
    referred_by_code: str | None = None,
) -> tuple[Subscriber, bool]:
    """Return (subscriber, created). Reactivates a previously unsubscribed user."""
    existing = await get_by_telegram_id(session, telegram_id)
    if existing:
        existing.is_active = True
        if first_name:
            existing.first_name = first_name
        if username:
            existing.username = username
        await session.commit()
        return existing, False

    referred_by = None
    if referred_by_code:
        referred_by = await get_by_referral_code(session, referred_by_code)

    code = generate_referral_code()
    while await get_by_referral_code(session, code) is not None:
        code = generate_referral_code()

    subscriber = Subscriber(
        telegram_id=telegram_id,
        first_name=first_name,
        username=username,
        language_code=language_code,
        referral_code=code,
        referred_by_id=referred_by.id if referred_by else None,
    )
    session.add(subscriber)
    await session.commit()
    return subscriber, True


async def set_language(session: AsyncSession, subscriber: Subscriber, language_code: str) -> None:
    subscriber.language_code = language_code
    await session.commit()


async def deactivate(session: AsyncSession, subscriber: Subscriber) -> None:
    subscriber.is_active = False
    await session.commit()


async def list_active(session: AsyncSession) -> list[Subscriber]:
    result = await session.execute(select(Subscriber).where(Subscriber.is_active.is_(True)))
    return list(result.scalars().all())


async def count_referrals(session: AsyncSession, subscriber: Subscriber) -> int:
    result = await session.execute(
        select(Subscriber).where(Subscriber.referred_by_id == subscriber.id)
    )
    return len(result.scalars().all())
