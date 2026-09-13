# PAYMENTS_GUIDE.md — accepting money through ShopMate

ShopMate supports four payment methods, each independently optional. This
guide covers **getting paid inside the bot** (a customer paying for an
order) and, separately, **getting paid by your agency clients** for
building/hosting ShopMate itself (a different problem, covered at the end).

> Not legal or tax advice. Payment method choice, especially crypto, can
> have tax implications that vary by country — check with a local
> accountant before relying on any of this for large sums.

## In-bot payment methods

### Telegram Stars — always available, zero setup

Telegram's own in-app currency. No merchant account needed — it works the
moment your bot exists. Customers buy Stars with a card through Telegram
itself; you receive Stars, which Telegram lets you withdraw (subject to
Telegram's own payout terms, which have changed over time — check
Telegram's current documentation before promising a client fast payouts).

Set `STARS_PER_USD` in `.env` to control the USD→Stars conversion ShopMate
uses when pricing an order in Stars (Telegram doesn't fix this rate — check
what it currently is before going live with real money amounts).

### Click.uz — dominant in Uzbekistan

1. Register a merchant account at [my.click.uz](https://my.click.uz).
2. Create a service; Click gives you a **Merchant ID**, **Service ID**, and
   a **Secret Key**.
3. Set `CLICK_MERCHANT_ID`, `CLICK_SERVICE_ID`, `CLICK_SECRET_KEY` in `.env`.
4. In the Click merchant panel, set your callback URL to:
   `https://<your-admin-domain>/payments/click`
5. ShopMate builds a "pay by link" URL for each order automatically (no
   pre-registration of the order with Click needed) and verifies Click's
   callback signature (MD5, per Click's Merchant API v2) before marking an
   order as paid.

### Payme — the other dominant gateway in Uzbekistan

1. Register a merchant account at [business.payme.uz](https://business.payme.uz).
2. Get your **Merchant ID** and **Secret Key** (called the "Kassa" key in
   Payme's dashboard).
3. Set `PAYME_MERCHANT_ID`, `PAYME_SECRET_KEY` in `.env`.
4. In the Payme dashboard, set your callback URL to:
   `https://<your-admin-domain>/payments/payme`
5. ShopMate implements Payme's JSON-RPC merchant protocol
   (`CheckPerformTransaction`, `CreateTransaction`, `PerformTransaction`,
   `CancelTransaction`, `CheckTransaction`) — Payme's own systems call these
   methods on your webhook to move money and confirm the order.

Both Click and Payme require your webhook endpoint to be reachable over
HTTPS with a valid certificate — see `DEPLOY.md` for putting the admin app
behind a domain (Caddy/Nginx handle HTTPS for you). Both providers also
typically require a short certification/testing period with their sandbox
before approving you for real transactions — budget a few days for this
with a client's first payment-enabled deployment.

### Stripe — international cards

1. Create a Stripe account at [stripe.com](https://stripe.com) and grab
   your **secret key** from the dashboard (Developers → API keys).
2. Set `STRIPE_KEY` in `.env`.
3. In the Stripe dashboard, go to Developers → Webhooks → Add endpoint, set
   the URL to `https://<your-admin-domain>/payments/stripe`, and subscribe
   to the `checkout.session.completed` event. Copy the **signing secret**
   Stripe gives you into `STRIPE_WEBHOOK_SECRET` in `.env`.
4. That's it — ShopMate creates a Stripe Checkout Session per order via the
   Stripe API directly (no pre-created Product/Price needed in your Stripe
   dashboard), sends the customer the checkout URL, and marks the order
   paid automatically once Stripe confirms the payment via the webhook
   (signature verified using `STRIPE_WEBHOOK_SECRET`).

Stripe is the best fit for stores whose customers pay in USD/EUR by card
rather than local Uzbek payment rails.

## What if the client doesn't want online payment yet?

Perfectly fine — and the more common starting point. Leave all four
provider variables empty, and ShopMate just collects the order (name,
phone, address) and notifies the owner, who then arranges payment however
they already do (cash on delivery, a bank transfer, calling the customer).
This is standard for small stores in this market and requires zero setup.

---

## Getting paid *yourself*, as the agency (not code — for Diyor)

For invoicing store-owner clients for ShopMate itself (setup fee + monthly),
given known friction with PayPal/Payoneer from Uzbekistan:

- **USDT (TRC-20)** — fast, low fees, works with almost any exchange
  worldwide. Get a wallet address from any major exchange (Binance, etc.).
  Downside: some clients are unfamiliar with crypto and may need a quick
  explanation; upside: no chargebacks, no frozen accounts.
- **Wise Business** — a real IBAN/account number clients can wire to like a
  normal bank transfer, often the least friction for a non-crypto-native
  client. Worth re-attempting even if personal Wise had issues before —
  Business accounts have different verification requirements.
- **Payoneer** — worth re-trying since policies change, but don't block
  your first sale on getting this working; use USDT or Wise as the primary
  path and treat Payoneer as a secondary option to revisit.

Whichever you pick, get at least one real invoice paid before optimizing
further — see `sales/finding_first_20_leads.md` and the cold email
templates in `sales/` to get there.
