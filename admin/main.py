from contextlib import asynccontextmanager
from datetime import datetime, timedelta

from aiogram import Bot
from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, RedirectResponse
from sqladmin import Admin, BaseView, ModelView, expose
from sqlalchemy import func, select

from admin.auth import AdminAuth
from bot.config import settings
from bot.models import BroadcastMessage, CartEvent, Client, FAQItem, Order, Product, Subscriber
from bot.services.broadcast_service import send_broadcast
from bot.services.db import async_session, engine, init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(title=f"{settings.store_name} — ShopMate Admin", lifespan=lifespan)


class ClientAdmin(ModelView, model=Client):
    name = "Client"
    name_plural = "Clients"
    icon = "fa-solid fa-store"
    column_list = [Client.id, Client.name, Client.is_active, Client.created_at]
    form_columns = [Client.name, Client.bot_token, Client.owner_telegram_id, Client.is_active]


class SubscriberAdmin(ModelView, model=Subscriber):
    name = "Subscriber"
    name_plural = "Subscribers"
    icon = "fa-solid fa-users"
    column_list = [
        Subscriber.id,
        Subscriber.telegram_id,
        Subscriber.first_name,
        Subscriber.username,
        Subscriber.language_code,
        Subscriber.is_active,
        Subscriber.created_at,
    ]
    column_searchable_list = [Subscriber.first_name, Subscriber.username]
    column_sortable_list = [Subscriber.id, Subscriber.created_at]
    form_columns = [Subscriber.first_name, Subscriber.username, Subscriber.language_code, Subscriber.is_active]


class ProductAdmin(ModelView, model=Product):
    name = "Product"
    name_plural = "Products"
    icon = "fa-solid fa-box"
    column_list = [Product.id, Product.name, Product.price, Product.is_available, Product.created_at]
    column_searchable_list = [Product.name]
    form_columns = [Product.name, Product.description, Product.price, Product.image_url, Product.is_available]


class OrderAdmin(ModelView, model=Order):
    name = "Order"
    name_plural = "Orders"
    icon = "fa-solid fa-cart-shopping"
    column_list = [
        Order.id,
        Order.full_name,
        Order.phone,
        Order.status,
        Order.total_amount,
        Order.created_at,
    ]
    column_sortable_list = [Order.id, Order.created_at, Order.total_amount]
    column_default_sort = [(Order.created_at, True)]
    form_columns = [Order.status, Order.full_name, Order.phone, Order.address]
    can_create = False


class FAQItemAdmin(ModelView, model=FAQItem):
    name = "FAQ Item"
    name_plural = "FAQ Items"
    icon = "fa-solid fa-circle-question"
    column_list = [FAQItem.id, FAQItem.question, FAQItem.keywords]
    form_columns = [FAQItem.question, FAQItem.keywords, FAQItem.answer]


class BroadcastMessageAdmin(ModelView, model=BroadcastMessage):
    name = "Broadcast"
    name_plural = "Broadcast History"
    icon = "fa-solid fa-bullhorn"
    column_list = [
        BroadcastMessage.id,
        BroadcastMessage.text,
        BroadcastMessage.audience,
        BroadcastMessage.recipients_count,
        BroadcastMessage.delivered_count,
        BroadcastMessage.failed_count,
        BroadcastMessage.sent_at,
    ]
    column_default_sort = [(BroadcastMessage.created_at, True)]
    can_create = False
    can_edit = False


admin = Admin(
    app,
    engine,
    authentication_backend=AdminAuth(secret_key=settings.admin_secret_key),
    title=f"{settings.store_name} — ShopMate",
)
admin.add_view(ClientAdmin)
admin.add_view(SubscriberAdmin)
admin.add_view(ProductAdmin)
admin.add_view(OrderAdmin)
admin.add_view(FAQItemAdmin)
admin.add_view(BroadcastMessageAdmin)


PAGE_STYLE = """
<style>
  body { font-family: -apple-system, Arial, sans-serif; background: #f6f7f9; margin: 0; padding: 32px; color: #1b1f24; }
  .card { background: #fff; border-radius: 10px; padding: 24px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,.08); }
  .stats { display: flex; gap: 16px; flex-wrap: wrap; }
  .stat { flex: 1; min-width: 160px; }
  .stat h3 { margin: 0; font-size: 28px; }
  .stat p { margin: 4px 0 0; color: #6b7280; }
  a.button, button { display: inline-block; background: #2563eb; color: #fff; border: none; padding: 10px 18px;
    border-radius: 6px; text-decoration: none; cursor: pointer; font-size: 14px; }
  textarea { width: 100%; min-height: 140px; padding: 10px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; }
  nav a { margin-right: 16px; color: #2563eb; text-decoration: none; }
  .success { color: #16a34a; }
</style>
"""


class DashboardView(BaseView):
    name = "Dashboard"
    icon = "fa-solid fa-gauge"

    @expose("/dashboard", methods=["GET"])
    async def dashboard(self, request: Request) -> HTMLResponse:
        since = datetime.utcnow() - timedelta(days=1)
        async with async_session() as session:
            total_subscribers = (
                await session.execute(select(func.count()).select_from(Subscriber).where(Subscriber.is_active.is_(True)))
            ).scalar_one()
            total_products = (await session.execute(select(func.count()).select_from(Product))).scalar_one()
            orders_today = (
                await session.execute(select(func.count()).select_from(Order).where(Order.created_at >= since))
            ).scalar_one()
            total_sales = (
                await session.execute(select(func.coalesce(func.sum(Order.total_amount), 0)))
            ).scalar_one()
            total_carts = (await session.execute(select(func.count()).select_from(CartEvent))).scalar_one()

        html = f"""
        <html><head><title>ShopMate Dashboard</title>{PAGE_STYLE}</head>
        <body>
          <nav><a href="/admin/">← Back to admin</a><a href="/admin/broadcast/send">Send broadcast</a></nav>
          <div class="card">
            <h1>{settings.store_name} — Dashboard</h1>
            <div class="stats">
              <div class="stat"><h3>{total_subscribers}</h3><p>Active subscribers</p></div>
              <div class="stat"><h3>{orders_today}</h3><p>Orders in last 24h</p></div>
              <div class="stat"><h3>${float(total_sales):.2f}</h3><p>Total order value (all-time)</p></div>
              <div class="stat"><h3>{total_products}</h3><p>Products</p></div>
              <div class="stat"><h3>{total_carts}</h3><p>Product views tracked</p></div>
            </div>
          </div>
        </body></html>
        """
        return HTMLResponse(html)


class BroadcastView(BaseView):
    name = "Send Broadcast"
    icon = "fa-solid fa-paper-plane"

    @expose("/broadcast/send", methods=["GET"])
    async def form(self, request: Request) -> HTMLResponse:
        sent = request.query_params.get("sent")
        message = ""
        if sent is not None:
            message = f'<p class="success">Broadcast sent to {sent} subscribers.</p>'

        html = f"""
        <html><head><title>Send Broadcast</title>{PAGE_STYLE}</head>
        <body>
          <nav><a href="/admin/">← Back to admin</a><a href="/admin/dashboard">Dashboard</a></nav>
          <div class="card">
            <h1>Send a broadcast message</h1>
            {message}
            <form method="post" action="/admin/broadcast/send">
              <textarea name="text" placeholder="Type your announcement..." required></textarea><br><br>
              <button type="submit">Send to all active subscribers</button>
            </form>
          </div>
        </body></html>
        """
        return HTMLResponse(html)

    @expose("/broadcast/send", methods=["POST"])
    async def send(self, request: Request) -> RedirectResponse:
        form = await request.form()
        text = str(form.get("text", "")).strip()

        if text and settings.bot_token != "TEST:TOKEN":
            bot = Bot(token=settings.bot_token)
            try:
                async with async_session() as session:
                    result = await send_broadcast(bot, session, text)
                recipients = result.recipients_count
            finally:
                await bot.session.close()
        else:
            recipients = 0

        return RedirectResponse(f"/admin/broadcast/send?sent={recipients}", status_code=303)


admin.add_base_view(DashboardView)
admin.add_base_view(BroadcastView)
