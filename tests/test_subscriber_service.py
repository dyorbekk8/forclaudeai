import pytest

from bot.services import subscriber_service

pytestmark = pytest.mark.asyncio


async def test_get_or_create_creates_new_subscriber(session):
    subscriber, created = await subscriber_service.get_or_create(
        session, telegram_id=42, first_name="Dinara", username="dinara_shop"
    )
    assert created is True
    assert subscriber.telegram_id == 42
    assert subscriber.referral_code
    assert subscriber.is_active is True


async def test_get_or_create_reactivates_existing(session):
    subscriber, _ = await subscriber_service.get_or_create(session, telegram_id=42)
    await subscriber_service.deactivate(session, subscriber)

    same, created = await subscriber_service.get_or_create(session, telegram_id=42)
    assert created is False
    assert same.id == subscriber.id
    assert same.is_active is True


async def test_referral_registration(session):
    referrer, _ = await subscriber_service.get_or_create(session, telegram_id=1)
    referee, _ = await subscriber_service.get_or_create(
        session, telegram_id=2, referred_by_code=referrer.referral_code
    )
    assert referee.referred_by_id == referrer.id
    assert await subscriber_service.count_referrals(session, referrer) == 1


async def test_list_active_excludes_deactivated(session):
    a, _ = await subscriber_service.get_or_create(session, telegram_id=1)
    b, _ = await subscriber_service.get_or_create(session, telegram_id=2)
    await subscriber_service.deactivate(session, b)

    active = await subscriber_service.list_active(session)
    assert [s.telegram_id for s in active] == [a.telegram_id]
