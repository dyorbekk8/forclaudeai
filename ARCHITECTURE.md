# ARCHITECTURE.md — a tour of the codebase

## Two processes, one database

ShopMate is deliberately split into two independent processes that share a
database, not one monolith:

- **`bot/main.py`** — the Telegram bot. Long-running, connects to Telegram
  via long polling, dispatches updates through aiogram Routers, and runs an
  in-process APScheduler for cart-abandonment reminders, the welcome series,
  and the daily report.
- **`admin/main.py`** — a FastAPI app serving the SQLAdmin-based admin panel
  (CRUD over every model, a small dashboard, and a broadcast-sending form),
  plus the payment webhook routes Click/Payme call back on.

Splitting them means the admin panel can be restarted, redeployed, or put
behind a different domain without taking the bot offline, and vice versa.

## `bot/` layout

```
bot/
├── main.py           # entrypoint: builds Bot/Dispatcher, starts polling + scheduler
├── config.py         # pydantic-settings Settings, loaded from .env
├── i18n.py           # English/Russian text lookup, t(key, lang, **kwargs)
├── keyboards.py      # aiogram keyboard builders (reply + inline)
├── states.py         # aiogram FSM state groups (OrderStates, FAQStates, ContactStates)
├── logging_config.py # console + rotating file logging setup
├── handlers/         # one Router per feature area (see below)
├── models/           # SQLAlchemy 2.x async models (one file per model)
├── services/         # business logic — the only layer that touches the DB directly
├── scheduler/        # APScheduler job functions, wired up in scheduler/jobs.py
└── payments/         # payment provider plug-ins (Stars, Click, Payme, Stripe)
```

### Handlers (`bot/handlers/`)

Each file is an aiogram `Router` for one feature area, aggregated in
`handlers/__init__.py::build_root_router()`:

| File | Handles |
|---|---|
| `start.py` | `/start`, language selection, main menu, `/menu` |
| `catalog.py` | Product browsing/pagination, starting an order |
| `order.py` | The order FSM (quantity → name → phone → address → confirm), "My Orders" |
| `payments.py` | Telegram Stars invoice, Stripe checkout link, successful-payment handler |
| `faq.py` | FAQ question/answer flow |
| `contact.py` | Forwarding a customer message straight to the store owner |
| `referral.py` | `/invite` — generates a referral link |
| `broadcast_optin.py` | `/stop` — unsubscribe |

Router **registration order matters**: routers with specific text/callback
filters (menu buttons, `/commands`) are included before FAQ's "catch any
text while in the asking state" handler, so tapping a menu button always
breaks out of FAQ mode instead of being swallowed by it.

### Services (`bot/services/`)

Handlers never write raw SQL/ORM queries — they call into `services/`, which
is the only layer allowed to open a DB session and run queries. This keeps
business logic (e.g. "what counts as an abandoned cart?", "how is a
referral code generated?") in one testable place, independent of whether
it's called from a Telegram handler, the scheduler, or a test.

- `db.py` — the async engine/session factory (`get_session()` context
  manager for handlers, `async_session()` for scheduler jobs/admin)
- `subscriber_service.py`, `product_service.py`, `order_service.py`,
  `cart_service.py`, `broadcast_service.py`, `referral_service.py`,
  `faq_engine.py` — one module per model/feature

### Scheduler (`bot/scheduler/`)

`jobs.py::setup_scheduler(bot)` configures an `AsyncIOScheduler` with three
jobs, each in its own module so they're independently testable:
- `cart_abandonment.py` — every 5 minutes, reminds customers who viewed a
  product 2+ hours ago without ordering
- `welcome_series.py` — hourly check, sends a day-1 and day-3 message to new
  subscribers (tracked via `Subscriber.welcome_step_sent`)
- `daily_report.py` — once a day, sends the store owner a subscriber/order/
  revenue summary

### Payments (`bot/payments/`)

Each provider is a small class with an `enabled` property (true only when
its `.env` variables are set) and either `build_payment_link(order)` (Click,
Payme, Stripe — URL-based) or `send_invoice(bot, chat_id, order)` (Stars —
native Telegram invoice). `bot/payments/webhooks.py` is a FastAPI router
(mounted on the admin app) implementing Click's prepare/complete callback
and Payme's JSON-RPC methods, so a successful payment automatically updates
`Order.status`. See `PAYMENTS_GUIDE.md` for the protocol details and where
to get each provider's credentials.

## `admin/` layout

- `main.py` — FastAPI app, one `ModelView` per model (auto-generates CRUD),
  plus two custom `BaseView`s: `Dashboard` (plain HTML with live stats) and
  `Send Broadcast` (a form that calls `broadcast_service.send_broadcast`).
- `auth.py` — `AdminAuth`, a session-cookie-based `AuthenticationBackend`
  checking credentials against `ADMIN_USERNAME`/`ADMIN_PASSWORD`.

## Data model

```
Client ──────────────────────────────────────────  (single row today; multi-tenant hook for later)
Subscriber ──┬── referred_by → Subscriber (self-referential, for /invite)
             ├── Order ── OrderItem ── Product
             └── CartEvent ── Product
FAQItem                                            (independent — keyword/LLM matched)
BroadcastMessage                                   (a log of sent broadcasts)
PaymeTransaction ── Order                          (Payme's own transaction bookkeeping)
```

All models live in `bot/models/`, one file each, aggregated in
`bot/models/__init__.py`. `Base` (in `models/base.py`) mixes in
`AsyncAttrs` so relationships can be lazy-loaded from async code with
`await obj.awaitable_attrs.relationship_name` where needed.

## Why these specific tradeoffs

See `DECISIONS.md` for the full list with reasoning — the short version:
SQLAlchemy async end-to-end (matches aiogram's async nature), SQLite by
default with a one-line switch to Postgres via `DATABASE_URL`, a plain
dict-based i18n instead of a translation framework (only 2 languages), and
payment providers kept as independent plug-ins so a client can start with
none and add one later without touching the order flow.
