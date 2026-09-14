# TODO.md — known gaps and honest limitations

ShopMate meets the "TUGADI" (done) bar from the original spec: the bot's
core flow works end-to-end, 48 tests pass, the admin panel has full CRUD,
and all required docs + sales materials exist. It is also now running
live in production on Railway (see `SUMMARY.md`), which resolved two
items that used to live in this file (Docker build correctness, and the
SQLite-vs-Postgres concern — production uses Postgres). This file lists
what's still *not* done or only partially done, so nothing is quietly
overstated.

## Payment providers

- **Click/Payme webhooks are protocol-complete but not certification-tested
  against the real Click/Payme sandbox.** The signature verification and
  JSON-RPC method implementations (including Payme's `GetStatement`, now
  implemented) follow each provider's published documentation and are
  unit-tested in isolation, but neither has been exercised against a live
  Click/Payme test merchant account (which requires registering a real
  merchant account first — something only Diyor/the client can do). Budget
  time for this with a client's first payment-enabled deployment — see
  `PAYMENTS_GUIDE.md`.
- **Telegram Stars pricing** uses a manually configured `STARS_PER_USD`
  rate rather than a live exchange rate — Telegram doesn't publish one
  fixed rate, so this needs a periodic manual check (see `PAYMENTS_GUIDE.md`).

## FAQ engine

- The LLM-backed FAQ engine (`LLMFAQEngine`) is implemented and falls back
  to keyword matching on any error; this is now covered by mocked-`httpx`
  tests for the success, no-match, and network-failure-fallback paths.

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
  wiring was verified against real Telegram traffic on the live Railway
  deployment (see `SUMMARY.md`), which is stronger evidence than a mocked
  end-to-end test would be, but a proper automated one is still not there.

## Deployment

- The Dockerfile has now been proven end-to-end: it's the exact image
  running the live `shopmate-bot` and `shopmate-admin` services on
  Railway. `docker-compose.yml` (for a non-Railway VPS deploy) still
  hasn't been run in this environment specifically — same Dockerfile
  though, so low risk, but worth one `docker compose up --build` before
  a client's first VPS deployment.
- Railway's custom Start Command does not go through a shell, so `$PORT`
  needs an explicit `sh -c "..."` wrapper — hit this live deploying
  `shopmate-admin` and documented the fix in `DEPLOY.md`.
