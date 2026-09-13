import pytest

from bot.config import settings
from bot.models import FAQItem
from bot.services.faq_engine import KeywordFAQEngine, get_faq_engine


async def test_keyword_match_finds_best_item(session):
    session.add_all(
        [
            FAQItem(question="Shipping", keywords="shipping, delivery", answer="3-5 days"),
            FAQItem(question="Returns", keywords="return, refund", answer="30 day returns"),
        ]
    )
    await session.commit()

    engine = KeywordFAQEngine()
    answer = await engine.match(session, "How long does shipping take?")
    assert answer == "3-5 days"


async def test_keyword_no_match_returns_none(session):
    session.add(FAQItem(question="Shipping", keywords="shipping, delivery", answer="3-5 days"))
    await session.commit()

    engine = KeywordFAQEngine()
    answer = await engine.match(session, "What's the weather like today?")
    assert answer is None


def test_get_faq_engine_defaults_to_keyword(monkeypatch):
    monkeypatch.setattr(settings, "llm_api_key", "")
    engine = get_faq_engine()
    assert isinstance(engine, KeywordFAQEngine)
