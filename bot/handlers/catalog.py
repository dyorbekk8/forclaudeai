from aiogram import F, Router
from aiogram.fsm.context import FSMContext
from aiogram.types import CallbackQuery, Message

from bot.i18n import t
from bot.keyboards import product_card_keyboard, quantity_keyboard
from bot.services import cart_service, product_service, subscriber_service
from bot.services.db import get_session
from bot.states import OrderStates

router = Router(name="catalog")


def _product_card_text(lang: str, product, index: int, total: int) -> str:
    return t(
        "product_card",
        lang,
        name=product.name,
        description=product.description or "",
        price=f"{product.price:.2f}",
        index=index + 1,
        total=total,
    )


@router.message(F.text.in_({t("menu_products", "en"), t("menu_products", "ru")}))
async def handle_products_button(message: Message, state: FSMContext) -> None:
    await state.clear()
    async with get_session() as session:
        subscriber, _ = await subscriber_service.get_or_create(
            session, telegram_id=message.from_user.id
        )
        lang = subscriber.language_code
        products = await product_service.list_available(session)

        if not products:
            await message.answer(t("no_products", lang))
            return

        product = products[0]
        await cart_service.record_view(session, subscriber, product.id)
        text = _product_card_text(lang, product, 0, len(products))
        keyboard = product_card_keyboard(lang, 0, len(products), product.id)

    await message.answer(text, reply_markup=keyboard)


@router.callback_query(F.data.startswith("product:"))
async def handle_product_navigation(callback: CallbackQuery) -> None:
    index = int(callback.data.split(":", 1)[1])
    async with get_session() as session:
        subscriber, _ = await subscriber_service.get_or_create(
            session, telegram_id=callback.from_user.id
        )
        lang = subscriber.language_code
        products = await product_service.list_available(session)
        if not products:
            await callback.answer()
            return

        index = max(0, min(index, len(products) - 1))
        product = products[index]
        await cart_service.record_view(session, subscriber, product.id)

        text = _product_card_text(lang, product, index, len(products))
        keyboard = product_card_keyboard(lang, index, len(products), product.id)

    await callback.message.edit_text(text, reply_markup=keyboard)
    await callback.answer()


@router.callback_query(F.data.startswith("order_start:"))
async def handle_order_start(callback: CallbackQuery, state: FSMContext) -> None:
    product_id = int(callback.data.split(":", 1)[1])
    async with get_session() as session:
        subscriber, _ = await subscriber_service.get_or_create(
            session, telegram_id=callback.from_user.id
        )
        lang = subscriber.language_code

    await state.set_state(OrderStates.choosing_quantity)
    await state.update_data(product_id=product_id)

    await callback.message.answer(t("choose_quantity", lang), reply_markup=quantity_keyboard())
    await callback.answer()
