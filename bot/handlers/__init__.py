from aiogram import Router

from bot.handlers.broadcast_optin import router as broadcast_optin_router
from bot.handlers.catalog import router as catalog_router
from bot.handlers.contact import router as contact_router
from bot.handlers.faq import router as faq_router
from bot.handlers.order import router as order_router
from bot.handlers.referral import router as referral_router
from bot.handlers.start import router as start_router


def build_root_router() -> Router:
    root = Router()
    root.include_router(start_router)
    root.include_router(broadcast_optin_router)
    root.include_router(referral_router)
    root.include_router(catalog_router)
    root.include_router(order_router)
    root.include_router(faq_router)
    root.include_router(contact_router)
    return root
