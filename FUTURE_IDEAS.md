# FUTURE_IDEAS.md — where ShopMate could go next

Not commitments, not scoped — just a backlog of ideas worth considering
once the first few clients are live and you know what they actually ask
for. Prioritize based on real client requests over anything on this list.

## Multi-tenant SaaS version

Right now, `Client` exists as a model but the deployment model is
single-tenant (one bot process + one database per client, see
`NEW_CLIENT_SETUP.md`). A true multi-tenant version would let one running
instance serve many stores, each with its own bot token, routed through a
single process. This is a significant architecture change (every query
needs a `client_id` scope, webhook routing needs to resolve which client a
request belongs to) — worth it once you have 10+ clients and per-client
hosting overhead becomes real money, not before.

## Full AI-powered FAQ + product recommendations

The current `LLMFAQEngine` (see `bot/services/faq_engine.py`) answers
questions grounded only in the store's own FAQ entries. A further step:
let the LLM also see the product catalog, so it can answer "do you have
anything under $30?" or "what would go well with the blue jacket?" —
useful, but needs careful prompt design to avoid hallucinating prices or
stock status that isn't real.

## Telegram Mini App

A Mini App (Telegram's in-chat web app surface) could replace the
text-based product catalog with a proper scrollable storefront UI —
images grid, filters, a real cart with multiple items per order (today's
flow is one product per order — see `ARCHITECTURE.md`). Bigger lift than
it sounds (a separate small web frontend, hosted alongside the bot), but
would meaningfully raise the perceived polish for higher-ticket clients.

## Multi-item cart

Today, an order is one product + a quantity (see `bot/handlers/order.py`).
A real "add multiple items then checkout" cart is a natural next step —
the data model (`Order`/`OrderItem`) already supports multiple items per
order; only the FSM/UI needs extending to accumulate items before checkout.

## Inventory sync with Shopify/Instagram Shop

Right now the product catalog is managed entirely through ShopMate's own
admin panel. Many target clients already maintain a catalog in Shopify —
a Shopify Admin API integration to import/sync products (and even push
order data back) would remove the double-entry problem and be a strong
selling point for Shopify-based leads specifically.

## Uzbek language support

`bot/i18n.py` currently ships English and Russian (see `DECISIONS.md` #5).
Adding Uzbek (Latin script) is a small, contained change — extend the
`TEXTS` dict and the language-selection keyboard in `bot/keyboards.py`.
Worth doing once selling to the local Uzbekistan/CIS market becomes a
priority alongside the initial English-speaking ICP.

## Analytics dashboard beyond the basics

The current admin `Dashboard` view shows a handful of live counts. A
proper analytics view (orders over time, FAQ questions with no match —
useful for spotting FAQ gaps, conversion rate from product view to order)
would help clients see ShopMate's value more concretely, which helps
retention and upsells.

## Automated Payme/Click merchant certification checklist

Since both require a short sandbox certification period (see
`PAYMENTS_GUIDE.md`), a small internal checklist/script that runs through
their required test cases against a staging deployment would make
enabling payments for each new client faster and less error-prone.
