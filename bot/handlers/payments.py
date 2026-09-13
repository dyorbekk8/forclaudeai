import logging

from aiogram import Bot, F, Router
from aiogram.types import CallbackQuery, Message, PreCheckoutQuery

from bot.i18n import t
from bot.models import OrderStatus
from bot.payments.stars import StarsProvider
from bot.payments.stripe_provider import stripe_provider
from bot.services import order_service, subscriber_service
from bot.services.db import get_session

logger = logging.getLogger(__name__)
router = Router(name="payments")

stars_provider = StarsProvider()


@router.callback_query(F.data.startswith("pay_stars:"))
async def handle_pay_with_stars(callback: CallbackQuery, bot: Bot) -> None:
    order_id = int(callback.data.split(":", 1)[1])
    async with get_session() as session:
        order = await order_service.get(session, order_id)

    if order is not None:
        await stars_provider.send_invoice(bot, callback.from_user.id, order)
    await callback.answer()


@router.callback_query(F.data.startswith("pay_stripe:"))
async def handle_pay_with_stripe(callback: CallbackQuery) -> None:
    order_id = int(callback.data.split(":", 1)[1])
    async with get_session() as session:
        order = await order_service.get(session, order_id)
        subscriber, _ = await subscriber_service.get_or_create(
            session, telegram_id=callback.from_user.id
        )
        lang = subscriber.language_code

    if order is None:
        await callback.answer()
        return

    try:
        link = await stripe_provider.build_payment_link(order)
    except Exception as exc:  # noqa: BLE001 - surfaced to the user, never crashes the bot
        logger.warning("Stripe checkout session creation failed: %s", exc)
        await callback.answer()
        return

    await callback.message.answer(f"{t('payment_link_ready', lang)}\n{link.url}")
    await callback.answer()


@router.pre_checkout_query()
async def handle_pre_checkout(query: PreCheckoutQuery) -> None:
    await query.answer(ok=True)


@router.message(F.successful_payment)
async def handle_successful_payment(message: Message) -> None:
    payload = message.successful_payment.invoice_payload
    if not payload.startswith("order:"):
        return

    order_id = int(payload.split(":", 1)[1])
    async with get_session() as session:
        subscriber, _ = await subscriber_service.get_or_create(
            session, telegram_id=message.from_user.id
        )
        lang = subscriber.language_code
        order = await order_service.get(session, order_id)
        if order is not None:
            await order_service.update_status(session, order, OrderStatus.COMPLETED)

    await message.answer(t("order_created", lang, order_id=order_id))
