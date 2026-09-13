import logging

from aiogram import Bot
from aiogram.exceptions import TelegramForbiddenError

from bot.i18n import t
from bot.services import cart_service
from bot.services.db import get_session

logger = logging.getLogger(__name__)


async def send_abandonment_reminders(bot: Bot) -> None:
    async with get_session() as session:
        abandoned = await cart_service.find_abandoned(session)
        for event in abandoned:
            subscriber = event.subscriber
            product = event.product
            try:
                await bot.send_message(
                    subscriber.telegram_id,
                    t(
                        "cart_abandonment_reminder",
                        subscriber.language_code,
                        product_name=product.name,
                    ),
                )
            except TelegramForbiddenError:
                logger.info(
                    "Subscriber %s blocked the bot; skipping reminder", subscriber.telegram_id
                )
            except Exception as exc:  # noqa: BLE001 - one failure must not stop the batch
                logger.warning("Failed to send abandonment reminder: %s", exc)
            finally:
                await cart_service.mark_reminder_sent(session, event)

        if abandoned:
            logger.info("Sent %d cart-abandonment reminders", len(abandoned))
