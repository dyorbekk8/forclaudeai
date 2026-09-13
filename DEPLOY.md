# DEPLOY.md — putting ShopMate into production

Two supported paths: **Railway** (fastest, recommended for most clients) or
**Docker on any VPS** (full control, works anywhere).

Either way, ShopMate is two long-running processes:
1. **the bot** (`python -m bot.main`) — connects to Telegram and stays running
2. **the admin panel** (`uvicorn admin.main:app`) — a web server the store owner logs into

Both need the same `DATABASE_URL` so they share one database.

---

## Option A: Railway

Railway runs each process as its own "service" inside one project, which
maps cleanly onto ShopMate's two processes.

1. **Create a project.** On [railway.app](https://railway.app), click *New
   Project* → *Deploy from GitHub repo* → select this repository.

2. **Add a Postgres database** (recommended for production — SQLite works
   but doesn't survive a Railway redeploy since the filesystem is ephemeral
   unless you attach a volume). Click *New* → *Database* → *PostgreSQL*.
   Railway gives you a `DATABASE_URL`-shaped variable automatically; you'll
   reference it as `${{Postgres.DATABASE_URL}}` in the next step, but note
   Railway's Postgres URL uses the `postgresql://` scheme — ShopMate needs
   the async driver, so set it explicitly as described below.

3. **Create the bot service.**
   - *New* → *GitHub Repo* → same repo again (Railway lets you deploy the
     same repo as multiple services with different start commands).
   - Set the **Start Command** to: `python -m bot.main`
   - Under *Variables*, add everything from `.env.example` with real values.
     For `DATABASE_URL`, use:
     `postgresql+asyncpg://<user>:<password>@<host>:<port>/<database>`
     (take the connection details from the Postgres service Railway created,
     just change `postgresql://` to `postgresql+asyncpg://`).

4. **Create the admin service.**
   - *New* → *GitHub Repo* → same repo again.
   - Set the **Start Command** to: `sh -c "uvicorn admin.main:app --host 0.0.0.0 --port $PORT"`
     (the `sh -c "..."` wrapper matters — Railway runs a custom start command
     directly rather than through a shell, so `$PORT` is never expanded
     without it, and uvicorn fails immediately with
     `Invalid value for '--port': '$PORT' is not a valid integer`)
   - Copy the same variables as the bot service (same `DATABASE_URL`, same
     `ADMIN_SECRET_KEY` etc.) — Railway lets you reference shared variables
     so you only set them once, in a shared "environment" scope.
   - Under *Settings* → *Networking*, click *Generate Domain* to get a
     public URL for the admin panel (e.g. `https://shopmate-admin.up.railway.app`).

5. **Run the initial seed once.** Open the bot service's shell (Railway's
   web UI has a "Run a command" option), or run locally against the same
   `DATABASE_URL`:
   ```bash
   python seed_data.py
   ```

6. **Verify.** Message your bot on Telegram (`/start`), and open the admin
   panel URL and log in.

Railway auto-redeploys both services whenever you push to the connected
branch.

---

## Option B: Docker on a VPS

Works on any VPS with Docker installed (DigitalOcean, Hetzner, a $5/mo
droplet — anything).

1. **Provision a small VPS** (1 vCPU / 1GB RAM is enough for one client).
   Install Docker and Docker Compose:
   ```bash
   curl -fsSL https://get.docker.com | sh
   ```

2. **Copy the project to the server** (git clone, or `scp`/`rsync`):
   ```bash
   git clone <this-repo> shopmate
   cd shopmate
   cp .env.example .env
   nano .env   # fill in BOT_TOKEN and everything else
   ```

3. **Start everything:**
   ```bash
   docker compose up -d --build
   ```
   This builds one image and runs it twice — once as the bot (long-running,
   polling Telegram) and once as the admin panel (listening on port 8000).
   Both share a named Docker volume for the SQLite database so restarts
   don't lose data.

4. **Seed demo data (first run only):**
   ```bash
   docker compose exec bot python seed_data.py
   ```

5. **Expose the admin panel.** By default it's reachable at
   `http://<server-ip>:8000/admin`. For a real client deployment, put it
   behind a domain + HTTPS — the quickest way is
   [Caddy](https://caddyserver.com/) as a reverse proxy:
   ```bash
   # /etc/caddy/Caddyfile
   admin.yourclientdomain.com {
       reverse_proxy localhost:8000
   }
   ```
   or use Nginx + Certbot if you're more comfortable with that stack.

6. **Check logs / status:**
   ```bash
   docker compose ps
   docker compose logs -f bot
   docker compose logs -f admin
   ```

7. **Updating after a code change:**
   ```bash
   git pull
   docker compose up -d --build
   ```

### Scaling past SQLite

SQLite is fine for a single small store (dozens of orders/day). If a client
outgrows it, switch `DATABASE_URL` to a managed Postgres instance (Railway,
Neon, DigitalOcean Managed DB, or Postgres in a second Docker container) —
no code changes needed, ShopMate's models work unchanged against Postgres
via the `asyncpg` driver already listed in `requirements.txt`.

---

## Post-deploy checklist

- [ ] `/start` works and shows the language choice + main menu
- [ ] Admin panel login works with the credentials in `.env`
- [ ] Seed data (or the client's real catalog) is visible in "Products"
- [ ] `OWNER_TELEGRAM_ID` is set and receives a test order notification
- [ ] Any enabled payment provider's pay link actually opens
- [ ] Daily report arrives at the configured hour (check `TIMEZONE`)
