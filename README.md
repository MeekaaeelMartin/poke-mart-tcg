# Poke Mart TCG

South Africa's Pokemon TCG companion — free card search, live ZAR pricing via [CardDex](https://carddex.dev/), and a **R50/month** premium portfolio dashboard.

## Where to put your CardDex API key

Open **`.env`** in the project root and set:

```env
CARDDEX_API_KEY="pk_live_YOUR_ACTUAL_KEY"
```

- Never put the key in frontend code or commit it to git (`.env` is gitignored).
- The key is only used **server-side** by the nightly sync (`/api/cron/sync` and `npm run sync`).
- Get a free key at https://carddex.dev/

Also set `AUTH_SECRET` to a long random string before production:

```bash
openssl rand -base64 32
```

## Quick start

```bash
npm install
npm run db:setup    # create SQLite DB + seed blog + demo user
npm run sync        # pull sets/prices/cards from CardDex (needs API key)
npm run dev         # http://localhost:3000
```

### Demo premium account (after seed)

- Email: `trainer@poke-mart-tcg.co.za`
- Password: `demo1234`
- Already Premium — open `/dashboard`

## Nightly 3:00 AM sync

Every night the server should ping CardDex, download updated prices, and **overwrite** local DB prices.

| Method | Details |
|--------|---------|
| **Vercel Cron** | `vercel.json` runs `GET /api/cron/sync` at `0 1 * * *` UTC (= **03:00 SAST**) |
| **Manual** | `npm run sync` |
| **HTTP** | `curl "http://localhost:3000/api/cron/sync?secret=YOUR_CRON_SECRET"` |
| **crontab** | `0 3 * * * curl -H "Authorization: Bearer $CRON_SECRET" https://your-domain/api/cron/sync` |

Protect production with `CRON_SECRET` in `.env`.

## Features

| Feature | Access |
|---------|--------|
| Search / browse cards, sets, prices, blog, contact | Free |
| Portfolio, watchlist, activity, AI upload UI | Premium R50/mo (`/premium`) |
| Price data | CardDex → local SQLite, converted EUR→ZAR via `EUR_TO_ZAR` |

## Stack

Next.js 16 · Prisma · SQLite · NextAuth (credentials) · Tailwind CSS 4 · CardDex API
