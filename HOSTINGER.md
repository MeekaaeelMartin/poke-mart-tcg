# Deploy on Hostinger (Node.js Web App)

Your repo: https://github.com/MeekaaeelMartin/poke-mart-tcg

## 1. Create the app in hPanel

1. Open [hPanel](https://hpanel.hostinger.com/) → **Websites** → **Add Website**
2. Choose **Node.js web app** → **Import Git repository**
3. Connect GitHub and select **`MeekaaeelMartin/poke-mart-tcg`**
4. Confirm settings:
   - **Framework:** Next.js
   - **Branch:** `main`
   - **Node.js:** 20 or 22
   - **Build command:** `npm run build`
   - **Output directory:** `.next`
   - **Start:** leave default (Hostinger starts the standalone server)

## 2. Environment variables (required)

In the Hostinger app **Environment** settings, add:

| Name | Value |
|------|--------|
| `CARDDEX_API_KEY` | your `pk_live_…` key |
| `CARDDEX_BASE_URL` | `https://api.carddex.dev` |
| `DATABASE_URL` | `file:./dev.db` |
| `AUTH_SECRET` | long random string (`openssl rand -base64 32`) |
| `NEXTAUTH_URL` | your live Hostinger URL (e.g. `https://yourdomain.com`) |
| `CRON_SECRET` | any long random string |
| `EUR_TO_ZAR` | `20.5` (or current rate) |
| `PREMIUM_PRICE_ZAR` | `50` |

**Never** put the CardDex key in GitHub — only in Hostinger env.

## 3. Deploy

Click **Deploy**. After it goes live, open your site and run a first data sync:

```bash
# From any machine (or Hostinger SSH if available):
curl -H "Authorization: Bearer YOUR_CRON_SECRET" https://YOUR-DOMAIN/api/cron/sync?pages=25
```

Or locally against production after deploy. Nightly sync: Hostinger cron / external cron hitting that URL at **01:00 UTC** (03:00 SAST).

## 4. Auto updates

Every push to `main` rebuilds and redeploys automatically once GitHub is connected.
