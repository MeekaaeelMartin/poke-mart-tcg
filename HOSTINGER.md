# Deploy on Hostinger (Node.js Web App)

Your repo: https://github.com/MeekaaeelMartin/poke-mart-tcg  
Live example URL: `https://white-mouse-613181.hostingersite.com`

## 1. Create / reconnect the app in hPanel

1. **Websites → Add Website → Node.js web app → Import Git repository**
2. Select **`MeekaaeelMartin/poke-mart-tcg`**, branch **`main`**
3. Settings:
   - Framework: **Next.js**
   - Node.js: **20 or 22**
   - Build: `npm run build`
   - Output: `.next`

## 2. Environment variables (critical)

Add these in the Hostinger app **Environment** panel (not only in GitHub):

| Name | Value |
|------|--------|
| `CARDDEX_API_KEY` | your `pk_live_…` key |
| `CARDDEX_BASE_URL` | `https://api.carddex.dev` |
| `DATABASE_URL` | `file:./prisma/prod.db` |
| `AUTH_SECRET` | long random string (`openssl rand -base64 32`) |
| `AUTH_TRUST_HOST` | `true` |
| `NEXTAUTH_URL` | `https://white-mouse-613181.hostingersite.com` (your real URL) |
| `CRON_SECRET` | any long random string |
| `EUR_TO_ZAR` | `20.5` |
| `PREMIUM_PRICE_ZAR` | `50` |

If `NEXTAUTH_URL` still says `localhost`, auth and some requests can fail in production.

## 3. Deploy & verify

1. Click **Deploy** / **Redeploy**
2. Open `/api/health` — should return JSON like `{ "ok": true, "database": true, ... }`
3. Then open `/` — homepage should load with CardDex prices
4. Warm the DB once:

```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
  "https://white-mouse-613181.hostingersite.com/api/cron/sync?pages=15"
```

## 4. If you still see “This page couldn’t load”

- Confirm env vars are saved **and** you redeployed after saving them
- Check Hostinger **Runtime / Application logs** for Prisma or Auth errors
- Hit `/api/health` and check `database` / `hasAuthSecret` / `hasCarddexKey`
