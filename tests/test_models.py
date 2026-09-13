import pytest
from sqlalchemy import select

from bot.models import FAQItem, Product, Subscriber

pytestmark = pytest.mark.asyncio


async def test_create_subscriber(session):
    subscriber = Subscriber(telegram_id=111, first_name="Jamshid", referral_code="ABCD1234")
    session.add(subscriber)
    await session.commit()

    result = await session.execute(select(Subscriber).where(Subscriber.telegram_id == 111))
    fetched = result.scalar_one()
    assert fetched.first_name == "Jamshid"
    assert fetched.is_active is True
    assert fetched.language_code == "en"


async def test_subscriber_referral_relationship(session):
    referrer = Subscriber(telegram_id=1, first_name="Referrer", referral_code="REF00001")
    session.add(referrer)
    await session.commit()

    referee = Subscriber(
        telegram_id=2,
        first_name="Referee",
        referral_code="REF00002",
        referred_by_id=referrer.id,
    )
    session.add(referee)
    await session.commit()

    referrals = await referrer.awaitable_attrs.referrals
    assert len(referrals) == 1
    assert referrals[0].telegram_id == 2


async def test_product_defaults(session):
    product = Product(name="Test Product", price=9.99)
    session.add(product)
    await session.commit()

    assert product.is_available is True
    assert float(product.price) == 9.99


async def test_faq_keyword_list(session):
    item = FAQItem(question="Q", keywords="shipping, delivery , Track", answer="A")
    session.add(item)
    await session.commit()

    assert item.keyword_list() == ["shipping", "delivery", "track"]
