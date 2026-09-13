import logging

from aiogram import Bot, F, Router
from aiogram.fsm.context import FSMContext
from aiogram.types import CallbackQuery, Message

from bot.config import settings
from bot.i18n import t
from bot.keyboards import order_confirm_keyboard
from bot.services import cart_service, order_service, product_service, subscriber_service
from bot.services.db import get_session
from bot.states import OrderStates

logger = logging.getLogger(__name__)
router = Router(name="order")


@router.callback_query(F.data.startswith("qty:"), OrderStates.choosing_quantity)
async def handle_quantity_choice(callback: CallbackQuery, state: FSMContext) -> None:
    quantity = int(callback.data.split(":", 1)[1])
    await state.update_data(quantity=quantity)
    await state.set_state(OrderStates.waiting_name)

    async with get_session() as session:
        subscriber, _ = await subscriber_service.get_or_create(
            session, telegram_id=callback.from_user.id
        )
        lang = subscriber.language_code

    await callback.message.answer(t("ask_name", lang))
    await callback.answer()


@router.message(OrderStates.waiting_name)
async def handle_name_input(message: Message, state: FSMContext) -> None:
    await state.update_data(full_name=message.text.strip())
    await state.set_state(OrderStates.waiting_phone)

    async with get_session() as session:
        subscriber, _ = await subscriber_service.get_or_create(
            session, telegram_id=message.from_user.id
        )
        lang = subscriber.language_code
    await message.answer(t("ask_phone", lang))


@router.message(OrderStates.waiting_phone)
async def handle_phone_input(message: Message, state: FSMContext) -> None:
    await state.update_data(phone=message.text.strip())
    await state.set_state(OrderStates.waiting_address)

    async with get_session() as session:
        subscriber, _ = await subscriber_service.get_or_create(
            session, telegram_id=message.from_user.id
        )
        lang = subscriber.language_code
    await message.answer(t("ask_address", lang))


@router.message(OrderStates.waiting_address)
async def handle_address_input(message: Message, state: FSMContext) -> None:
    await state.update_data(address=message.text.strip())
    data = await state.get_data()
    await state.set_state(OrderStates.confirming)

    async with get_session() as session:
        subscriber, _ = await subscriber_service.get_or_create(
            session, telegram_id=message.from_user.id
        )
        lang = subscriber.language_code
        product = await product_service.get(session, data["product_id"])

    quantity = data["quantity"]
    total = product.price * quantity
    item_line = f"{product.name} × {quantity} = ${total:.2f}"

    summary = t(
        "order_summary",
        lang,
        item=item_line,
        total=f"{total:.2f}",
        full_name=data["full_name"],
        phone=data["phone"],
        address=data["address"],
    )
    await message.answer(summary, reply_markup=order_confirm_keyboard(lang))


@router.callback_query(F.data == "order_confirm", OrderStates.confirming)
async def handle_order_confirm(callback: CallbackQuery, state: FSMContext, bot: Bot) -> None:
    data = await state.get_data()
    await state.clear()

    async with get_session() as session:
        subscriber, _ = await subscriber_service.get_or_create(
            session, telegram_id=callback.from_user.id
        )
        lang = subscriber.language_code
        product = await product_service.get(session, data["product_id"])
        quantity = data["quantity"]

        order = await order_service.create_order(
            session,
            subscriber,
            items=[(product, quantity)],
            full_name=data["full_name"],
            phone=data["phone"],
            address=data["address"],
        )
        await cart_service.mark_ordered(session, subscriber, product.id)

    await callback.message.edit_reply_markup(reply_markup=None)
    await callback.message.answer(t("order_created", lang, order_id=order.id))

    if settings.owner_telegram_id:
        try:
            await bot.send_message(
                settings.owner_telegram_id,
                f"🆕 New order #{order.id}\n"
                f"{product.name} × {quantity} = ${order.total_amount:.2f}\n"
                f"Customer: {data['full_name']} ({data['phone']})\n"
                f"Address: {data['address']}\n"
                f"Telegram: @{callback.from_user.username or callback.from_user.id}",
            )
        except Exception as exc:  # noqa: BLE001 - never break the order flow
            logger.warning("Could not notify owner about order #%s: %s", order.id, exc)

    await callback.answer()


@router.callback_query(F.data == "order_cancel", OrderStates.confirming)
async def handle_order_cancel(callback: CallbackQuery, state: FSMContext) -> None:
    await state.clear()
    async with get_session() as session:
        subscriber, _ = await subscriber_service.get_or_create(
            session, telegram_id=callback.from_user.id
        )
        lang = subscriber.language_code

    await callback.message.edit_reply_markup(reply_markup=None)
    await callback.message.answer(t("order_cancelled", lang))
    await callback.answer()


@router.message(F.text.in_({t("menu_orders", "en"), t("menu_orders", "ru")}))
async def handle_my_orders(message: Message, state: FSMContext) -> None:
    await state.clear()
    async with get_session() as session:
        subscriber, _ = await subscriber_service.get_or_create(
            session, telegram_id=message.from_user.id
        )
        lang = subscriber.language_code
        orders = await order_service.list_for_subscriber(session, subscriber)

        if not orders:
            await message.answer(t("no_orders", lang))
            return

        lines = [
            t(
                "order_list_item",
                lang,
                id=order.id,
                status=order.status.value,
                total=f"{order.total_amount:.2f}",
                date=order.created_at.strftime("%Y-%m-%d %H:%M"),
            )
            for order in orders
        ]

    await message.answer("\n".join(lines))
