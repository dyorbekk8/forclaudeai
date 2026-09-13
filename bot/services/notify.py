import logging

from aiogram import Bot

from bot.config import settings

logger = logging.getLogger(__name__)


async def notify_owner(text: str) -> None:
    """Send a message to the store owner from a process that doesn't already
    hold a live Bot instance (e.g. the admin/webhook FastAPI process)."""
    if not settings.owner_telegram_id:
        return

    bot = Bot(token=settings.bot_token)
    try:
        await bot.send_message(settings.owner_telegram_id, text)
    except Exception as exc:  # noqa: BLE001 - a notification failure must never raise
        logger.warning("Failed to notify owner: %s", exc)
    finally:
        await bot.session.close()
