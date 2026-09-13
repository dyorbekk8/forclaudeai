import logging
from datetime import datetime, timedelta

from aiogram import Bot
from aiogram.exceptions import TelegramForbiddenError
from sqlalchemy import select

from bot.i18n import t
from bot.models import Subscriber
from bot.services.db import get_session

logger = logging.getLogger(__name__)

STEPS = {
    1: (timedelta(days=1), "welcome_series_day1"),
    2: (timedelta(days=3), "welcome_series_day3"),
}


async def send_welcome_series(bot: Bot) -> None:
    now = datetime.utcnow()
    async with get_session() as session:
        result = await session.execute(
            select(Subscriber).where(Subscriber.is_active.is_(True), Subscriber.welcome_step_sent < 2)
        )
        subscribers = list(result.scalars().all())

        sent_count = 0
        for subscriber in subscribers:
            next_step = subscriber.welcome_step_sent + 1
            delay, text_key = STEPS[next_step]
            if now - subscriber.created_at < delay:
                continue

            try:
                await bot.send_message(subscriber.telegram_id, t(text_key, subscriber.language_code))
                sent_count += 1
            except TelegramForbiddenError:
                logger.info("Subscriber %s blocked the bot; skipping welcome step", subscriber.telegram_id)
            except Exception as exc:  # noqa: BLE001 - one failure must not stop the batch
                logger.warning("Failed to send welcome-series message: %s", exc)
            finally:
                subscriber.welcome_step_sent = next_step

        if subscribers:
            await session.commit()
        if sent_count:
            logger.info("Sent %d welcome-series messages", sent_count)
