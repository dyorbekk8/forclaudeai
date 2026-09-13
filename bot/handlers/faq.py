from aiogram import F, Router
from aiogram.fsm.context import FSMContext
from aiogram.types import Message

from bot.i18n import t
from bot.keyboards import back_to_menu_keyboard
from bot.services import subscriber_service
from bot.services.db import get_session
from bot.services.faq_engine import get_faq_engine
from bot.states import FAQStates

router = Router(name="faq")


@router.message(F.text.in_({t("menu_faq", "en"), t("menu_faq", "ru")}))
async def handle_faq_button(message: Message, state: FSMContext) -> None:
    await state.set_state(FAQStates.asking)
    async with get_session() as session:
        subscriber, _ = await subscriber_service.get_or_create(
            session, telegram_id=message.from_user.id
        )
        lang = subscriber.language_code

    await message.answer(t("ask_faq_question", lang), reply_markup=back_to_menu_keyboard(lang))


@router.message(FAQStates.asking)
async def handle_faq_question(message: Message) -> None:
    engine = get_faq_engine()
    async with get_session() as session:
        subscriber, _ = await subscriber_service.get_or_create(
            session, telegram_id=message.from_user.id
        )
        lang = subscriber.language_code
        answer = await engine.match(session, message.text or "")

    if answer:
        await message.answer(answer, reply_markup=back_to_menu_keyboard(lang))
    else:
        await message.answer(t("faq_no_match", lang), reply_markup=back_to_menu_keyboard(lang))
