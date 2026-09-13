from aiogram import Bot, Router
from aiogram.filters import Command
from aiogram.types import Message

from bot.i18n import t
from bot.services import subscriber_service
from bot.services.db import get_session
from bot.services.referral_service import build_referral_link

router = Router(name="referral")


@router.message(Command("invite"))
async def handle_invite_command(message: Message, bot: Bot) -> None:
    async with get_session() as session:
        subscriber, _ = await subscriber_service.get_or_create(
            session, telegram_id=message.from_user.id
        )
        lang = subscriber.language_code
        referral_code = subscriber.referral_code

    me = await bot.get_me()
    link = build_referral_link(me.username, referral_code)
    await message.answer(t("referral_intro", lang, link=link))
