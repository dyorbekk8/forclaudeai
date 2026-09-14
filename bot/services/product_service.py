from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from bot.models import OrderItem, Product

BESTSELLER_COUNT = 3
BESTSELLER_MIN_ORDERS = 2


async def list_available(session: AsyncSession) -> list[Product]:
    result = await session.execute(
        select(Product).where(Product.is_available.is_(True)).order_by(Product.id)
    )
    return list(result.scalars().all())


async def get(session: AsyncSession, product_id: int) -> Product | None:
    result = await session.execute(select(Product).where(Product.id == product_id))
    return result.scalar_one_or_none()


async def bestseller_ids(session: AsyncSession) -> set[int]:
    """Top products by units ordered — computed live from real orders, not a
    manually-flagged column, so it needs no schema change and stays honest."""
    result = await session.execute(
        select(OrderItem.product_id, func.sum(OrderItem.quantity).label("units"))
        .group_by(OrderItem.product_id)
        .having(func.sum(OrderItem.quantity) >= BESTSELLER_MIN_ORDERS)
        .order_by(func.sum(OrderItem.quantity).desc())
        .limit(BESTSELLER_COUNT)
    )
    return {row.product_id for row in result.all()}
