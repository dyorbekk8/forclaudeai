import logging

from aiogram import Bot
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from apscheduler.triggers.interval import IntervalTrigger

from bot.config import settings
from bot.scheduler.cart_abandonment import send_abandonment_reminders
from bot.scheduler.daily_report import send_daily_report
from bot.scheduler.welcome_series import send_welcome_series

logger = logging.getLogger(__name__)

CART_CHECK_INTERVAL_MINUTES = 5
WELCOME_SERIES_INTERVAL_MINUTES = 60
DAILY_REPORT_HOUR = 9


def setup_scheduler(bot: Bot) -> AsyncIOScheduler:
    scheduler = AsyncIOScheduler(timezone=settings.timezone)

    scheduler.add_job(
        send_abandonment_reminders,
        trigger=IntervalTrigger(minutes=CART_CHECK_INTERVAL_MINUTES),
        args=[bot],
        id="cart_abandonment",
        replace_existing=True,
    )
    scheduler.add_job(
        send_welcome_series,
        trigger=IntervalTrigger(minutes=WELCOME_SERIES_INTERVAL_MINUTES),
        args=[bot],
        id="welcome_series",
        replace_existing=True,
    )
    scheduler.add_job(
        send_daily_report,
        trigger=CronTrigger(hour=DAILY_REPORT_HOUR, minute=0),
        args=[bot],
        id="daily_report",
        replace_existing=True,
    )

    logger.info("Scheduler configured: cart_abandonment=%dmin, welcome_series=%dmin, daily_report=%02d:00",
                CART_CHECK_INTERVAL_MINUTES, WELCOME_SERIES_INTERVAL_MINUTES, DAILY_REPORT_HOUR)
    return scheduler
