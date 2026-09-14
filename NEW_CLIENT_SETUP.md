# NEW_CLIENT_SETUP.md — onboarding a new store owner

ShopMate is sold and deployed **per client**: each store gets its own bot,
its own database, and its own admin login. There is no shared multi-tenant
instance in this version (see `FUTURE_IDEAS.md` for that path if you later
want it). Follow this checklist for every new sale.

## 1. Collect from the client

- [ ] Store/brand name (for `STORE_NAME` and bot messages)
- [ ] Product list: name, price, short description, image URL (or photos
      you can upload somewhere and link) for each product
- [ ] FAQ content: their 5-10 most common customer questions + answers
- [ ] Their Telegram username or user ID, so you can add them as the
      `OWNER_TELEGRAM_ID` (or set up their own bot token under their own
      BotFather account if they want to own it directly — see step 2)
- [ ] Which payment method(s) they want: Click, Payme, Stripe, Telegram
      Stars, or "none yet, just collect orders manually"
- [ ] A domain (optional) if they want the admin panel on
      `admin.theirdomain.com` instead of a raw IP/Railway URL

## 2. Create their bot

Decide who owns the bot account:
- **You create it** (simpler, but they depend on you for bot settings) — go
  to @BotFather yourself, `/newbot`, name it after their store.
- **They create it** (recommended for a real client relationship) — walk
  them through @BotFather (see `README.md` → "Getting a bot token"), then
  ask them to send you the token securely (never over plain email/SMS if
  avoidable — a temporary password manager link or an encrypted message is
  better).

Also set:
- **Bot profile photo** via @BotFather → `/setuserpic`. This is the *only*
  way to set it — the Bot API has no method for a bot to set its own
  profile photo, so it's always a one-time manual upload. Use the client's
  real logo if they have one; otherwise `assets/bot_avatar.png` (a generic
  branded icon, see `assets/bot_avatar_source.html` for the editable
  source — change the gradient colors and re-render with Playwright/any
  headless browser to reskin it) works as a placeholder until they supply
  one.
- **Name and description are set automatically by the bot itself** on
  every startup (see `bot/branding.py`) — built from `STORE_NAME` in
  `.env`, so nothing to do here unless you want custom wording, in which
  case set `BOT_DISPLAY_NAME` / `BOT_DESCRIPTION` / `BOT_SHORT_DESCRIPTION`.
  The description is what a stranger sees on the empty chat screen
  *before* they ever tap Start — worth writing well per client.

## 3. Deploy a new instance

Each client gets their own deployment (own Railway project, or own Docker
stack on a VPS — see `DEPLOY.md`). Do **not** reuse an existing client's
database or `.env`.

```bash
git clone <this-repo> shopmate-<client-name>
cd shopmate-<client-name>
cp .env.example .env
```

Fill in `.env` with:
- `BOT_TOKEN` — their bot's token
- `STORE_NAME` — their brand name
- `OWNER_TELEGRAM_ID` — their Telegram user ID
- `ADMIN_USERNAME` / `ADMIN_PASSWORD` — a fresh admin login (don't reuse
  another client's or your own dev credentials)
- `ADMIN_SECRET_KEY` — generate a new one:
  `python -c "import secrets; print(secrets.token_hex(32))"`
- Payment provider variables, if applicable (see `PAYMENTS_GUIDE.md`)

## 4. Load their real catalog

Two options:

**A. Quick and manual (fastest for a first demo):** log into the admin
panel → Products → add each product by hand.

**B. Scripted (faster for 15+ products):** edit `seed_data.py`'s `PRODUCTS`
and `FAQ_ITEMS` lists with the client's real data, then run:
```bash
python seed_data.py
```
Note `seed_data.py` skips seeding if products already exist — delete the
database file first (or just add products through the admin panel instead)
if you need to re-seed.

## 5. Brand check

- [ ] `/start` shows their store name correctly
- [ ] Bot's Telegram profile photo/description matches their brand
- [ ] Products show correct prices and images
- [ ] FAQ answers match how they actually answer these questions

## 6. Handover

- [ ] Send the client their admin panel URL + login (via a secure channel)
- [ ] Give them (or walk them through) `README.md`'s admin panel basics:
      adding products, editing FAQ, sending a broadcast
- [ ] Confirm they've received a test order notification on their Telegram
- [ ] Agree on who handles ongoing hosting/updates (you, as part of the
      monthly fee — see `sales/icp.md` for the pricing model)
- [ ] Fill out `sales/case_study_template.md` once they have a few real
      orders — future cold emails are much stronger with a real result to
      point to

## 7. Ongoing maintenance (what you're being paid $19-39/mo for)

- Keep the server/Railway project running and monitor for crashes
- Apply ShopMate updates (`git pull && docker compose up -d --build`, or
  redeploy on Railway) when you improve the shared codebase
- Add new products / update FAQ on their behalf if they're not comfortable
  using the admin panel themselves
- Respond if `OWNER_TELEGRAM_ID` stops receiving alerts (usually means the
  bot process crashed — check logs)
