import httpx

from bot.config import settings
from bot.models import FAQItem
from bot.services.faq_engine import KeywordFAQEngine, LLMFAQEngine, get_faq_engine


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


class _FakeResponse:
    def __init__(self, payload):
        self._payload = payload

    def raise_for_status(self):
        pass

    def json(self):
        return self._payload


class _FakeAsyncClient:
    """Stands in for httpx.AsyncClient so tests never hit a real network."""

    answer = "Mocked LLM answer"
    raises: type[Exception] | None = None

    def __init__(self, *args, **kwargs):
        pass

    async def __aenter__(self):
        return self

    async def __aexit__(self, *exc):
        return False

    async def post(self, url, headers=None, json=None):
        if self.raises is not None:
            raise self.raises("simulated network failure")
        return _FakeResponse({"choices": [{"message": {"content": self.answer}}]})


async def test_llm_faq_engine_returns_llm_answer(session, monkeypatch):
    session.add(FAQItem(question="Shipping", keywords="shipping", answer="3-5 days"))
    await session.commit()

    _FakeAsyncClient.answer = "Mocked LLM answer"
    _FakeAsyncClient.raises = None
    monkeypatch.setattr("bot.services.faq_engine.httpx.AsyncClient", _FakeAsyncClient)

    engine = LLMFAQEngine()
    answer = await engine.match(session, "How long does shipping take?")
    assert answer == "Mocked LLM answer"


async def test_llm_faq_engine_no_match_returns_none(session, monkeypatch):
    session.add(FAQItem(question="Shipping", keywords="shipping", answer="3-5 days"))
    await session.commit()

    _FakeAsyncClient.answer = "NO_MATCH"
    _FakeAsyncClient.raises = None
    monkeypatch.setattr("bot.services.faq_engine.httpx.AsyncClient", _FakeAsyncClient)

    engine = LLMFAQEngine()
    answer = await engine.match(session, "What's the meaning of life?")
    assert answer is None


async def test_llm_faq_engine_falls_back_to_keyword_on_http_error(session, monkeypatch):
    session.add(FAQItem(question="Shipping", keywords="shipping", answer="3-5 days"))
    await session.commit()

    _FakeAsyncClient.raises = httpx.ConnectError
    monkeypatch.setattr("bot.services.faq_engine.httpx.AsyncClient", _FakeAsyncClient)

    engine = LLMFAQEngine()
    answer = await engine.match(session, "How long does shipping take?")
    assert answer == "3-5 days"  # fell back to the keyword-matched answer
