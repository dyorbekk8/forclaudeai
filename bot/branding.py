"""Sets the bot's Telegram identity (name, description, short description) —
the "About" text a stranger sees on the empty chat screen *before* they ever
tap Start, plus the profile line shown when the bot is shared or found in
search. These are the only parts of a bot's public identity settable via
the Bot API; the profile *photo* is BotFather-only (see NEW_CLIENT_SETUP.md).

Every string here defaults to something built from STORE_NAME so a new
client deployment looks branded on day one without extra config, but any
of it can be overridden per-client via BOT_DISPLAY_NAME/BOT_DESCRIPTION/
BOT_SHORT_DESCRIPTION in .env.
"""

from aiogram import Bot

from bot.config import settings

# Telegram's own limits — exceeding these raises TelegramBadRequest.
MAX_NAME_LENGTH = 64
MAX_DESCRIPTION_LENGTH = 512
MAX_SHORT_DESCRIPTION_LENGTH = 120


def default_name() -> str:
    return f"{settings.store_name} 🛍️"[:MAX_NAME_LENGTH]


def default_description() -> str:
    text = (
        f"🛍️ Welcome to {settings.store_name}!\n\n"
        "Browse our products, get instant answers to your questions, and "
        "place an order — all right here in Telegram. No app to install, "
        "no waiting on hold.\n\n"
        "Tap Start to begin. 👇"
    )
    return text[:MAX_DESCRIPTION_LENGTH]


def default_short_description() -> str:
    text = f"Shop {settings.store_name} directly in Telegram — browse, ask, and order in seconds."
    return text[:MAX_SHORT_DESCRIPTION_LENGTH]


async def apply_bot_identity(bot: Bot) -> None:
    name = (settings.bot_display_name or default_name())[:MAX_NAME_LENGTH]
    description = (settings.bot_description or default_description())[:MAX_DESCRIPTION_LENGTH]
    short_description = (settings.bot_short_description or default_short_description())[
        :MAX_SHORT_DESCRIPTION_LENGTH
    ]

    await bot.set_my_name(name=name)
    await bot.set_my_description(description=description)
    await bot.set_my_short_description(short_description=short_description)
