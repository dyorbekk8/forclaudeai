import logging

from aiogram import Bot, F, Router
from aiogram.fsm.context import FSMContext
from aiogram.types import Message

from bot.config import settings
from bot.i18n import t
from bot.keyboards import back_to_menu_keyboard
from bot.services import subscriber_service
from bot.services.db import get_session
from bot.states import ContactStates

logger = logging.getLogger(__name__)
router = Router(name="contact")


@router.message(F.text.in_({t("menu_contact", "en"), t("menu_contact", "ru")}))
async def handle_contact_button(message: Message, state: FSMContext) -> None:
    await state.set_state(ContactStates.waiting_message)
    async with get_session() as session:
        subscriber, _ = await subscriber_service.get_or_create(
            session, telegram_id=message.from_user.id
        )
        lang = subscriber.language_code

    await message.answer(t("ask_contact_message", lang), reply_markup=back_to_menu_keyboard(lang))


@router.message(ContactStates.waiting_message)
async def handle_contact_message(message: Message, state: FSMContext, bot: Bot) -> None:
    await state.clear()
    async with get_session() as session:
        subscriber, _ = await subscriber_service.get_or_create(
            session, telegram_id=message.from_user.id
        )
        lang = subscriber.language_code

    await message.answer(t("contact_message_sent", lang))

    if settings.owner_telegram_id:
        try:
            await bot.send_message(
                settings.owner_telegram_id,
                f"✉️ Message from @{message.from_user.username or message.from_user.id}:\n\n"
                f"{message.text}",
            )
        except Exception as exc:  # noqa: BLE001 - never break the customer flow
            logger.warning("Could not forward contact message to owner: %s", exc)
