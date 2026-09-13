from aiogram.types import (
    InlineKeyboardButton,
    InlineKeyboardMarkup,
    KeyboardButton,
    ReplyKeyboardMarkup,
)

from bot.i18n import t


def language_keyboard() -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(text="English 🇬🇧", callback_data="lang:en"),
                InlineKeyboardButton(text="Русский 🇷🇺", callback_data="lang:ru"),
            ]
        ]
    )


def main_menu_keyboard(lang: str) -> ReplyKeyboardMarkup:
    return ReplyKeyboardMarkup(
        keyboard=[
            [KeyboardButton(text=t("menu_products", lang)), KeyboardButton(text=t("menu_faq", lang))],
            [KeyboardButton(text=t("menu_orders", lang)), KeyboardButton(text=t("menu_contact", lang))],
        ],
        resize_keyboard=True,
    )


def back_to_menu_keyboard(lang: str) -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        inline_keyboard=[[InlineKeyboardButton(text=t("back_to_menu", lang), callback_data="back_to_menu")]]
    )


def product_card_keyboard(lang: str, index: int, total: int, product_id: int) -> InlineKeyboardMarkup:
    nav_row = []
    if index > 0:
        nav_row.append(InlineKeyboardButton(text=t("prev_button", lang), callback_data=f"product:{index - 1}"))
    if index < total - 1:
        nav_row.append(InlineKeyboardButton(text=t("next_button", lang), callback_data=f"product:{index + 1}"))

    rows = []
    if nav_row:
        rows.append(nav_row)
    rows.append([InlineKeyboardButton(text=t("order_button", lang), callback_data=f"order_start:{product_id}")])
    rows.append([InlineKeyboardButton(text=t("back_to_menu", lang), callback_data="back_to_menu")])
    return InlineKeyboardMarkup(inline_keyboard=rows)


def quantity_keyboard() -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        inline_keyboard=[[InlineKeyboardButton(text=str(n), callback_data=f"qty:{n}") for n in range(1, 6)]]
    )


def order_confirm_keyboard(lang: str) -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(text=t("confirm_button", lang), callback_data="order_confirm"),
                InlineKeyboardButton(text=t("cancel_button", lang), callback_data="order_cancel"),
            ]
        ]
    )
