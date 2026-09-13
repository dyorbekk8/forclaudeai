import pytest
from aiogram.exceptions import TelegramForbiddenError

from bot.services import broadcast_service, subscriber_service

pytestmark = pytest.mark.asyncio


class FakeBot:
    def __init__(self, blocked_ids: set[int] | None = None):
        self.blocked_ids = blocked_ids or set()
        self.sent: list[int] = []

    async def send_message(self, chat_id: int, text: str) -> None:
        if chat_id in self.blocked_ids:
            raise TelegramForbiddenError(method=None, message="bot was blocked by the user")
        self.sent.append(chat_id)


async def test_broadcast_sends_to_all_active_subscribers(session):
    await subscriber_service.get_or_create(session, telegram_id=1)
    await subscriber_service.get_or_create(session, telegram_id=2)

    bot = FakeBot()
    result = await broadcast_service.send_broadcast(bot, session, "Hello!")

    assert result.recipients_count == 2
    assert result.delivered_count == 2
    assert result.failed_count == 0
    assert set(bot.sent) == {1, 2}


async def test_broadcast_deactivates_blocked_subscribers(session):
    await subscriber_service.get_or_create(session, telegram_id=1)
    blocked, _ = await subscriber_service.get_or_create(session, telegram_id=2)

    bot = FakeBot(blocked_ids={2})
    result = await broadcast_service.send_broadcast(bot, session, "Hello!")

    assert result.delivered_count == 1
    assert result.failed_count == 1

    active = await subscriber_service.list_active(session)
    assert blocked.telegram_id not in [s.telegram_id for s in active]
