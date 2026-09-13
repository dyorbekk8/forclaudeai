import logging
from datetime import datetime, timedelta

from aiogram import Bot
from sqlalchemy import func, select

from bot.config import settings
from bot.models import Order, Subscriber
from bot.services.db import get_session

logger = logging.getLogger(__name__)


async def send_daily_report(bot: Bot) -> None:
    if not settings.owner_telegram_id:
        return

    since = datetime.utcnow() - timedelta(days=1)
    async with get_session() as session:
        new_subscribers = (
            await session.execute(
                select(func.count()).select_from(Subscriber).where(Subscriber.created_at >= since)
            )
        ).scalar_one()
        new_orders = (
            await session.execute(
                select(func.count()).select_from(Order).where(Order.created_at >= since)
            )
        ).scalar_one()
        revenue = (
            await session.execute(
                select(func.coalesce(func.sum(Order.total_amount), 0)).where(Order.created_at >= since)
            )
        ).scalar_one()

    text = (
        "📊 Daily report (last 24h)\n"
        f"New subscribers: {new_subscribers}\n"
        f"New orders: {new_orders}\n"
        f"Total order value: ${float(revenue):.2f}"
    )
    try:
        await bot.send_message(settings.owner_telegram_id, text)
    except Exception as exc:  # noqa: BLE001 - a report failure must never crash the scheduler
        logger.warning("Failed to send daily report: %s", exc)
