# ShopMate — Telegram sales & support bot for small online stores

ShopMate is a Telegram bot (+ admin panel) that lets a small online store sell
products, answer customer questions, and recover abandoned carts — entirely
inside Telegram, with no app to install and no website required.

**For customers:** browse a product catalog, place an order (name, phone,
address — no forms outside the chat), get answered by an FAQ engine, get a
reminder if they looked at a product but didn't order, and pay by card
(Stripe), Click, Payme, or Telegram Stars if the store owner enables them.

**For the store owner:** a password-protected admin panel to manage products,
see orders, edit FAQ answers, and send a broadcast message to every
subscriber — plus automatic new-order alerts and a daily summary, sent
straight to the owner's own Telegram account.

This repository is built to be **resold**: one codebase, deployed once per
client (see `NEW_CLIENT_SETUP.md`), each with its own bot token and database.

## What's inside

- `bot/` — the Telegram bot (aiogram 3, async)
- `admin/` — the admin panel (FastAPI + SQLAdmin)
- `tests/` — pytest test suite
- `sales/` — landing page, cold email templates, and other materials for
  *selling* ShopMate to store owners (see `sales/` for details)
- Root-level docs: this file, `DEPLOY.md`, `NEW_CLIENT_SETUP.md`,
  `ARCHITECTURE.md`, `PAYMENTS_GUIDE.md`, `DECISIONS.md`

## Requirements

- Python 3.11+
- A Telegram bot token from [@BotFather](https://t.me/BotFather)
- (Optional) Docker, if you'd rather not manage a Python environment

## Quick start (local)

```bash
git clone <this-repo>
cd forclaudeai

python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# Edit .env: at minimum set BOT_TOKEN (see "Getting a bot token" below)

python seed_data.py             # creates the database + demo products/FAQ
python -m bot.main              # starts the Telegram bot (polling)
```

In a second terminal, to run the admin panel:

```bash
source venv/bin/activate
uvicorn admin.main:app --reload --port 8000
# Open http://localhost:8000/admin — log in with ADMIN_USERNAME/ADMIN_PASSWORD from .env
```

Message your bot on Telegram with `/start` — you should see the welcome
message, language choice, and main menu.

## Getting a bot token

1. Open Telegram, search for **@BotFather**, and start a chat.
2. Send `/newbot`, choose a display name and a unique username (must end in `bot`).
3. BotFather replies with a token like `123456789:AAExampleTokenHere`.
4. Paste it into `.env` as `BOT_TOKEN=...`.

## Configuration (`.env`)

All configuration lives in `.env` (copy it from `.env.example`). The most
important variables:

| Variable | Required | Purpose |
|---|---|---|
| `BOT_TOKEN` | Yes | Telegram bot token from @BotFather |
| `DATABASE_URL` | No (defaults to local SQLite) | SQLAlchemy connection string |
| `ADMIN_USERNAME` / `ADMIN_PASSWORD` | Yes, for the admin panel | Admin panel login |
| `ADMIN_SECRET_KEY` | Yes, for the admin panel | Signs the admin session cookie |
| `OWNER_TELEGRAM_ID` | Recommended | Where new-order/report alerts are sent |
| `STORE_NAME` | No | Shown to customers in bot messages |
| `TIMEZONE` | No | IANA timezone for scheduled jobs |
| `LLM_API_KEY` | No | Enables AI-powered FAQ answers (see below) |
| `CLICK_*`, `PAYME_*`, `STRIPE_KEY` | No | Enable that payment provider |

See `.env.example` for the full list with comments, and `PAYMENTS_GUIDE.md`
for how to obtain payment provider credentials.

### Finding your Telegram user ID (for `OWNER_TELEGRAM_ID`)

Message [@userinfobot](https://t.me/userinfobot) on Telegram — it replies
with your numeric user ID.

### AI-powered FAQ (optional)

By default, ShopMate answers FAQ questions with simple keyword matching
against the FAQ entries you configure in the admin panel — free, offline,
works immediately. If you set `LLM_API_KEY` (plus optionally `LLM_API_BASE`
and `LLM_MODEL`, which default to OpenAI), ShopMate switches to an
LLM-backed FAQ engine that answers more naturally, still grounded only in
your own FAQ entries, and falls back to keyword matching if the API call
ever fails.

## Running the tests

```bash
source venv/bin/activate
pytest                 # runs the full test suite
ruff check .           # lint
ruff format .          # auto-format
```

## Deploying to production

See `DEPLOY.md` for Railway and Docker/VPS instructions.

## Setting up a new client

Selling ShopMate to a new store owner? See `NEW_CLIENT_SETUP.md` for the
step-by-step checklist (new bot token, new database, re-seeding products,
branding).

## How it's organized

See `ARCHITECTURE.md` for a tour of the codebase.

## License / ownership

This codebase belongs to its operator (built as a resellable product, not
open-source software). Adjust this section if you decide to license it
differently.
