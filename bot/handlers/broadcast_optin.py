from aiogram import Router
from aiogram.filters import Command
from aiogram.fsm.context import FSMContext
from aiogram.types import Message

from bot.i18n import t
from bot.services import subscriber_service
from bot.services.db import get_session

router = Router(name="broadcast_optin")


@router.message(Command("stop"))
async def handle_stop_command(message: Message, state: FSMContext) -> None:
    await state.clear()
    async with get_session() as session:
        subscriber, _ = await subscriber_service.get_or_create(
            session, telegram_id=message.from_user.id
        )
        lang = subscriber.language_code
        await subscriber_service.deactivate(session, subscriber)

    await message.answer(t("unsubscribed", lang))
