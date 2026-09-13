import logging

import httpx
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from bot.config import settings
from bot.models import FAQItem

logger = logging.getLogger(__name__)

MATCH_THRESHOLD = 1


class FAQEngine:
    """Interface: match(session, question) -> answer string, or None if no match."""

    async def match(self, session: AsyncSession, question: str) -> str | None:
        raise NotImplementedError


class KeywordFAQEngine(FAQEngine):
    """Free, offline default: scores each FAQItem by how many of its keywords
    appear in the customer's question, returns the best match above threshold."""

    async def match(self, session: AsyncSession, question: str) -> str | None:
        items = await self._all_items(session)
        text = question.lower()

        best_item: FAQItem | None = None
        best_score = 0
        for item in items:
            score = sum(1 for kw in item.keyword_list() if kw in text)
            if score > best_score:
                best_score = score
                best_item = item

        if best_item and best_score >= MATCH_THRESHOLD:
            return best_item.answer
        return None

    @staticmethod
    async def _all_items(session: AsyncSession) -> list[FAQItem]:
        result = await session.execute(select(FAQItem))
        return list(result.scalars().all())


class LLMFAQEngine(FAQEngine):
    """Enhanced mode: answers using an OpenAI-compatible chat-completions API,
    grounded in the store's own FAQ entries. Falls back to keyword matching
    if the LLM call fails, so a flaky network never breaks the FAQ feature."""

    def __init__(self) -> None:
        self._fallback = KeywordFAQEngine()

    async def match(self, session: AsyncSession, question: str) -> str | None:
        items = await self._fallback._all_items(session)
        if not items:
            return None

        knowledge = "\n".join(f"Q: {i.question}\nA: {i.answer}" for i in items)
        system_prompt = (
            f"You are a helpful customer support assistant for {settings.store_name}, "
            "a small online store, answering inside a Telegram bot. "
            "Answer the customer's question using ONLY the FAQ knowledge below. "
            "If the answer is not covered by the FAQ, reply with exactly: NO_MATCH. "
            "Keep answers short (1-3 sentences), friendly, and in the same language "
            "as the customer's question.\n\n"
            f"FAQ knowledge:\n{knowledge}"
        )

        try:
            async with httpx.AsyncClient(timeout=10) as client:
                response = await client.post(
                    f"{settings.llm_api_base}/chat/completions",
                    headers={"Authorization": f"Bearer {settings.llm_api_key}"},
                    json={
                        "model": settings.llm_model,
                        "messages": [
                            {"role": "system", "content": system_prompt},
                            {"role": "user", "content": question},
                        ],
                        "temperature": 0.2,
                        "max_tokens": 200,
                    },
                )
                response.raise_for_status()
                data = response.json()
                answer = data["choices"][0]["message"]["content"].strip()
        except (httpx.HTTPError, KeyError, IndexError) as exc:
            logger.warning("LLM FAQ call failed, falling back to keyword match: %s", exc)
            return await self._fallback.match(session, question)

        if answer == "NO_MATCH":
            return None
        return answer


def get_faq_engine() -> FAQEngine:
    if settings.llm_enabled:
        return LLMFAQEngine()
    return KeywordFAQEngine()
