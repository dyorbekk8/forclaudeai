# TODO.md — known gaps and honest limitations

ShopMate meets the "TUGADI" (done) bar from the original spec: the bot's
core flow works end-to-end, 38 tests pass, the admin panel has full CRUD,
and all required docs + sales materials exist. This file lists what's
*not* done or only partially done, so nothing is quietly overstated.

## Payment providers

- **Click/Payme webhooks are protocol-complete but not certification-tested
  against the real Click/Payme sandbox.** The signature verification and
  JSON-RPC method implementations follow each provider's published
  documentation and are unit-tested in isolation, but neither has been
  exercised against a live Click/Payme test merchant account (which
  requires registering a real merchant account first). Budget time for
  this with a client's first payment-enabled deployment — see
  `PAYMENTS_GUIDE.md`.
- **Payme's `GetStatement` method is not implemented** (used for
  reconciliation reports in Payme's merchant dashboard). The five methods
  needed for the actual payment lifecycle are implemented.
- **Telegram Stars pricing** uses a manually configured `STARS_PER_USD`
  rate rather than a live exchange rate — Telegram doesn't publish one
  fixed rate, so this needs a periodic manual check (see `PAYMENTS_GUIDE.md`).

## FAQ engine

- The LLM-backed FAQ engine (`LLMFAQEngine`) is implemented and falls back
  to keyword matching on any error, but there's no automated test that
  mocks a real LLM API response — only the default keyword-matching path
  and the "falls back when disabled" path are tested. Low risk (the
  feature is opt-in and the fallback is unconditional), but worth adding
  a mocked-`httpx` test if this path sees real client usage.

## Admin panel

- Orders can have their `status`/`full_name`/`phone`/`address` edited from
  the admin panel, but not their line items (products/quantities) — by
  design, to avoid silently changing order totals after the fact. If a
  client needs this, it's a small addition to `admin/main.py`'s
  `OrderAdmin.form_columns` plus a bit of care around recalculating
  `total_amount`.
- No password reset flow for the admin login — if `ADMIN_PASSWORD` is
  forgotten, it's a `.env` edit + restart, not a self-service flow.

## Internationalization

- Only English and Russian are implemented (see `DECISIONS.md` #5).
  Uzbek is a natural next addition — see `FUTURE_IDEAS.md`.

## Testing

- No end-to-end test drives an actual Telegram update through the
  dispatcher (e.g. simulating `/start` → tapping "Products" → placing an
  order) — tests cover the service layer directly and confirm the
  dispatcher/admin app both construct and boot without errors. Handler
  wiring was manually verified (router registration order, a dry run
  against a validly-formatted fake token, and the full admin flow via
  Starlette's `TestClient`).
- No load/concurrency testing against SQLite's write-locking behavior
  under simultaneous bot + admin writes — fine at small-store scale, worth
  watching if a client's order volume grows (see `DEPLOY.md`'s note on
  moving to Postgres).

## Deployment

- The Dockerfile/docker-compose setup was reviewed manually but not
  built/run in this environment (no Docker daemon available in this
  sandbox session) — the image is a standard `python:3.11-slim` +
  `pip install -r requirements.txt` build with no unusual steps, but
  run `docker compose up --build` once for real before a client deploy.
