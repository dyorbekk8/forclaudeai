import asyncio
import logging
from datetime import datetime

from aiogram import Bot
from aiogram.exceptions import TelegramForbiddenError, TelegramRetryAfter
from sqlalchemy.ext.asyncio import AsyncSession

from bot.models import BroadcastMessage, Subscriber
from bot.services.subscriber_service import deactivate, list_active

logger = logging.getLogger(__name__)

MESSAGES_PER_SECOND = 20


async def send_broadcast(
    bot: Bot,
    session: AsyncSession,
    text: str,
    audience: str = "all",
) -> BroadcastMessage:
    subscribers: list[Subscriber] = await list_active(session)

    broadcast = BroadcastMessage(text=text, audience=audience, recipients_count=len(subscribers))
    session.add(broadcast)
    await session.commit()

    delivered = 0
    failed = 0
    for index, subscriber in enumerate(subscribers, start=1):
        try:
            await bot.send_message(subscriber.telegram_id, text)
            delivered += 1
        except TelegramForbiddenError:
            await deactivate(session, subscriber)
            failed += 1
        except TelegramRetryAfter as exc:
            await asyncio.sleep(exc.retry_after)
            try:
                await bot.send_message(subscriber.telegram_id, text)
                delivered += 1
            except Exception:  # noqa: BLE001 - broadcast must continue regardless
                failed += 1
        except Exception as exc:  # noqa: BLE001
            logger.warning("Broadcast to %s failed: %s", subscriber.telegram_id, exc)
            failed += 1

        if index % MESSAGES_PER_SECOND == 0:
            await asyncio.sleep(1)

    broadcast.delivered_count = delivered
    broadcast.failed_count = failed
    broadcast.sent_at = datetime.utcnow()
    await session.commit()
    return broadcast
