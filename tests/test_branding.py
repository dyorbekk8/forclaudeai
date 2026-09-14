import pytest

from bot.branding import (
    MAX_DESCRIPTION_LENGTH,
    MAX_NAME_LENGTH,
    MAX_SHORT_DESCRIPTION_LENGTH,
    apply_bot_identity,
    default_description,
    default_name,
    default_short_description,
)
from bot.config import settings


def test_defaults_respect_telegram_length_limits(monkeypatch):
    monkeypatch.setattr(settings, "store_name", "A" * 100)
    assert len(default_name()) <= MAX_NAME_LENGTH
    assert len(default_description()) <= MAX_DESCRIPTION_LENGTH
    assert len(default_short_description()) <= MAX_SHORT_DESCRIPTION_LENGTH


def test_defaults_mention_store_name(monkeypatch):
    monkeypatch.setattr(settings, "store_name", "Luma Skincare")
    assert "Luma Skincare" in default_name()
    assert "Luma Skincare" in default_description()
    assert "Luma Skincare" in default_short_description()


@pytest.mark.asyncio
async def test_apply_bot_identity_survives_a_failing_call():
    # A flood-control error on one call must not stop the others from running.
    calls = []

    class FakeBot:
        async def set_my_name(self, name):
            raise RuntimeError("Flood control exceeded")

        async def set_my_description(self, description):
            calls.append("description")

        async def set_my_short_description(self, short_description):
            calls.append("short_description")

    await apply_bot_identity(FakeBot())

    assert calls == ["description", "short_description"]
