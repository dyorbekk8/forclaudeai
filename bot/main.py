import asyncio
import logging

from aiogram import Bot, Dispatcher
from aiogram.client.default import DefaultBotProperties
from aiogram.enums import ParseMode
from aiogram.fsm.storage.memory import MemoryStorage
from aiogram.types import BotCommand, ErrorEvent

from bot.config import settings
from bot.handlers import build_root_router
from bot.i18n import t
from bot.logging_config import setup_logging
from bot.scheduler.jobs import setup_scheduler
from bot.services.db import init_db

logger = logging.getLogger(__name__)


async def on_startup(bot: Bot) -> None:
    await init_db()
    logger.info("Database ready")
    await bot.set_my_commands(
        [
            BotCommand(command="start", description="Restart / show main menu"),
            BotCommand(command="menu", description="Show main menu"),
            BotCommand(command="myorders", description="See your past orders"),
            BotCommand(command="invite", description="Get your referral link"),
            BotCommand(command="stop", description="Unsubscribe from messages"),
        ]
    )


def create_dispatcher() -> Dispatcher:
    dp = Dispatcher(storage=MemoryStorage())
    dp.include_router(build_root_router())
    dp.startup.register(on_startup)

    @dp.errors()
    async def handle_error(event: ErrorEvent, bot: Bot) -> None:
        logger.exception("Unhandled error while processing update: %s", event.exception)
        update = event.update
        source = update.message or (
            update.callback_query.message if update.callback_query else None
        )
        if source is not None:
            try:
                await bot.send_message(source.chat.id, t("error_generic", "en"))
            except Exception:  # noqa: BLE001 - the error handler itself must never raise
                pass

    return dp


async def main() -> None:
    setup_logging()
    bot = Bot(
        token=settings.bot_token,
        default=DefaultBotProperties(parse_mode=ParseMode.HTML),
    )
    dp = create_dispatcher()

    scheduler = setup_scheduler(bot)
    scheduler.start()

    try:
        await bot.delete_webhook(drop_pending_updates=True)
        await dp.start_polling(bot)
    finally:
        scheduler.shutdown(wait=False)
        await bot.session.close()


if __name__ == "__main__":
    asyncio.run(main())
