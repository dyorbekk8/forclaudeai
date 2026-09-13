from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from bot.models import Order, OrderItem, OrderStatus, Product, Subscriber


async def create_order(
    session: AsyncSession,
    subscriber: Subscriber,
    items: list[tuple[Product, int]],
    full_name: str,
    phone: str,
    address: str,
) -> Order:
    total = sum(product.price * qty for product, qty in items)
    order = Order(
        subscriber_id=subscriber.id,
        full_name=full_name,
        phone=phone,
        address=address,
        total_amount=total,
        status=OrderStatus.NEW,
    )
    order.items = [
        OrderItem(product_id=product.id, quantity=qty, unit_price=product.price)
        for product, qty in items
    ]
    session.add(order)
    await session.commit()
    loaded = await get(session, order.id)
    assert loaded is not None
    return loaded


async def list_for_subscriber(session: AsyncSession, subscriber: Subscriber) -> list[Order]:
    result = await session.execute(
        select(Order)
        .where(Order.subscriber_id == subscriber.id)
        .options(selectinload(Order.items).selectinload(OrderItem.product))
        .order_by(Order.created_at.desc(), Order.id.desc())
    )
    return list(result.scalars().all())


async def get(session: AsyncSession, order_id: int) -> Order | None:
    result = await session.execute(
        select(Order)
        .where(Order.id == order_id)
        .options(selectinload(Order.items).selectinload(OrderItem.product))
    )
    return result.scalar_one_or_none()


async def update_status(session: AsyncSession, order: Order, status: OrderStatus) -> Order:
    order.status = status
    await session.commit()
    return order
