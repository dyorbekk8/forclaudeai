from aiogram import F, Router
from aiogram.filters import Command, CommandObject, CommandStart
from aiogram.fsm.context import FSMContext
from aiogram.types import CallbackQuery, Message

from bot.config import settings
from bot.i18n import t
from bot.keyboards import language_keyboard, main_menu_keyboard
from bot.services.db import get_session
from bot.services.referral_service import parse_start_payload
from bot.services.subscriber_service import get_or_create, set_language

router = Router(name="start")


async def send_main_menu(message: Message, lang: str) -> None:
    await message.answer(
        t("welcome", lang, store_name=settings.store_name),
        reply_markup=main_menu_keyboard(lang),
    )


@router.message(CommandStart())
async def handle_start(message: Message, command: CommandObject) -> None:
    referred_by_code = parse_start_payload(command.args)
    tg_user = message.from_user

    async with get_session() as session:
        subscriber, created = await get_or_create(
            session,
            telegram_id=tg_user.id,
            first_name=tg_user.first_name,
            username=tg_user.username,
            language_code=(tg_user.language_code or "en")[:2],
            referred_by_code=referred_by_code,
        )
        lang = subscriber.language_code

    if created:
        await message.answer(t("choose_language", "en"), reply_markup=language_keyboard())
    else:
        await send_main_menu(message, lang)


@router.callback_query(F.data.startswith("lang:"))
async def handle_language_choice(callback: CallbackQuery) -> None:
    lang = callback.data.split(":", 1)[1]
    async with get_session() as session:
        subscriber, _ = await get_or_create(session, telegram_id=callback.from_user.id)
        await set_language(session, subscriber, lang)

    await callback.message.edit_reply_markup(reply_markup=None)
    await send_main_menu(callback.message, lang)
    await callback.answer()


@router.message(Command("menu"))
async def handle_menu_command(message: Message) -> None:
    async with get_session() as session:
        subscriber, _ = await get_or_create(session, telegram_id=message.from_user.id)
        lang = subscriber.language_code
    await send_main_menu(message, lang)


@router.callback_query(F.data == "back_to_menu")
async def handle_back_to_menu(callback: CallbackQuery, state: FSMContext) -> None:
    await state.clear()
    async with get_session() as session:
        subscriber, _ = await get_or_create(session, telegram_id=callback.from_user.id)
        lang = subscriber.language_code
    await callback.message.answer(
        t("welcome", lang, store_name=settings.store_name), reply_markup=main_menu_keyboard(lang)
    )
    await callback.answer()
