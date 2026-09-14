"""Populate the database with demo data so a new ShopMate deployment has
something to show immediately: sample products (with images), FAQ entries,
and a couple of demo subscribers. Safe to re-run — it skips inserting new
rows if products already exist, but backfills `image_url` on existing
products that don't have one yet (so re-running after an image update
still helps, instead of being a pure no-op forever).

Usage: python seed_data.py
"""

import asyncio

from sqlalchemy import select

from bot.models import FAQItem, Product, Subscriber
from bot.services.db import async_session, init_db
from bot.services.referral_service import generate_referral_code

IMAGE_BASE_URL = "https://raw.githubusercontent.com/dyorbekk8/forclaudeai/claude/new-session-61ocf3/assets/products"

PRODUCTS = [
    (
        "Classic Tote Bag",
        "Durable canvas tote, fits a laptop and groceries.",
        24.99,
        f"{IMAGE_BASE_URL}/tote.png",
    ),
    (
        "Minimalist Wallet",
        "Slim leather wallet with RFID-blocking lining.",
        34.50,
        f"{IMAGE_BASE_URL}/wallet.png",
    ),
    (
        "Wireless Earbuds",
        "Bluetooth 5.3 earbuds with 24h battery case.",
        49.00,
        f"{IMAGE_BASE_URL}/earbuds.png",
    ),
    (
        "Ceramic Coffee Mug",
        "12oz hand-glazed mug, microwave and dishwasher safe.",
        14.00,
        f"{IMAGE_BASE_URL}/mug.png",
    ),
    (
        "Linen Throw Blanket",
        "Soft 100% linen blanket, 130x180cm.",
        59.00,
        f"{IMAGE_BASE_URL}/blanket.png",
    ),
    (
        "Scented Soy Candle",
        "Hand-poured candle, 40h burn time, lavender scent.",
        18.50,
        f"{IMAGE_BASE_URL}/candle.png",
    ),
    (
        "Everyday Backpack",
        "Water-resistant 20L backpack with padded laptop sleeve.",
        64.00,
        f"{IMAGE_BASE_URL}/backpack.png",
    ),
    (
        "Stainless Water Bottle",
        "Insulated 750ml bottle, keeps drinks cold 24h.",
        22.00,
        f"{IMAGE_BASE_URL}/bottle.png",
    ),
    (
        "Bamboo Desk Organizer",
        "5-compartment organizer for pens, cards and cables.",
        27.00,
        f"{IMAGE_BASE_URL}/organizer.png",
    ),
    (
        "Cotton Baseball Cap",
        "Adjustable strap, embroidered logo, one size.",
        19.99,
        f"{IMAGE_BASE_URL}/cap.png",
    ),
]

FAQ_ITEMS = [
    (
        "How long does shipping take?",
        "shipping, delivery, deliver, how long, when will",
        "Standard shipping takes 3-5 business days domestically and "
        "7-14 days internationally. You'll get a tracking link by message "
        "once your order ships.",
    ),
    (
        "What is your return policy?",
        "return, refund, exchange, money back",
        "You can return any unused item within 30 days of delivery for a "
        "full refund. Just message us with your order number to start a return.",
    ),
    (
        "What payment methods do you accept?",
        "payment, pay, card, cash, pay with",
        "We accept Telegram Stars for in-app purchases, plus Click, Payme "
        "and international cards via Stripe, depending on what's enabled "
        "for this store.",
    ),
    (
        "How can I track my order?",
        "track, tracking, where is my order, status",
        'Use the "My Orders" button in the main menu to see the status of '
        "all your orders at any time.",
    ),
    (
        "Do you offer discounts for referrals?",
        "discount, referral, invite, coupon, promo",
        "Yes! Use /invite to get your personal referral link. Share it with "
        "friends and ask us about current referral rewards.",
    ),
    (
        "What sizes are available?",
        "size, sizes, sizing, fit, measurements",
        "Most items are one-size or listed with exact measurements in the "
        "product description. Message us the product name if you need help choosing.",
    ),
]

DEMO_SUBSCRIBERS = [
    (900000001, "Alex Demo", "alexdemo"),
    (900000002, "Mira Demo", "miradem"),
    (900000003, "Sam Demo", None),
]


async def _backfill_product_images(session) -> int:
    image_by_name = {name: image_url for name, _, _, image_url in PRODUCTS}
    result = await session.execute(select(Product).where(Product.image_url.is_(None)))
    updated = 0
    for product in result.scalars().all():
        if product.name in image_by_name:
            product.image_url = image_by_name[product.name]
            updated += 1
    if updated:
        await session.commit()
    return updated


async def seed() -> None:
    await init_db()
    async with async_session() as session:
        existing = await session.execute(Product.__table__.select())
        if existing.first() is not None:
            updated = await _backfill_product_images(session)
            if updated:
                print(f"Database already has data — backfilled image_url on {updated} product(s).")
            else:
                print("Database already has data — skipping seed.")
            return

        for name, description, price, image_url in PRODUCTS:
            session.add(
                Product(name=name, description=description, price=price, image_url=image_url)
            )

        for question, keywords, answer in FAQ_ITEMS:
            session.add(FAQItem(question=question, keywords=keywords, answer=answer))

        for telegram_id, first_name, username in DEMO_SUBSCRIBERS:
            session.add(
                Subscriber(
                    telegram_id=telegram_id,
                    first_name=first_name,
                    username=username,
                    language_code="en",
                    referral_code=generate_referral_code(),
                )
            )

        await session.commit()
        print(
            f"Seeded {len(PRODUCTS)} products, {len(FAQ_ITEMS)} FAQ items, "
            f"{len(DEMO_SUBSCRIBERS)} demo subscribers."
        )


if __name__ == "__main__":
    asyncio.run(seed())
