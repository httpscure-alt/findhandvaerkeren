# Production deployment guide

This app is split into **three** pieces you configure separately:

1. **PostgreSQL database** (e.g. Supabase, Neon, RDS)
2. **Backend API** — Node.js + Express in `backend/` (long-running server)
3. **Frontend** — Vite + React in the repo root (static build on **Vercel** or similar)

Secrets live only in each host’s **environment variables**, never in Git.

---

## Prerequisites

- GitHub repo connected (this project already uses `origin` on GitHub).
- Domains decided, for example:
  - Site: `https://www.yourdomain.dk`
  - API: `https://api.yourdomain.dk` (subdomain is typical)

---

## 1. Database (production)

1. Create a **PostgreSQL** instance (Supabase: Project → Settings → Database → URI).
2. Copy the connection string as **`DATABASE_URL`** (use the **transaction** / direct URI Prisma expects, usually port `5432`).

You will set `DATABASE_URL` on the **API server** only.

---

## 2. Deploy the backend (API)

Use any host that runs a **Node** process 24/7 (e.g. **Railway**, **Render**, **Fly.io**, **DigitalOcean App Platform**).

### Repository settings

- **Root directory:** `backend`
- **Install:** `npm ci`
- **Build:** `npm run build` (after `npx prisma generate`; some platforms add a build hook)
- **Start:** `npm start` → runs `node dist/server.js`

### Environment variables (backend)

Copy from `backend/.env.example` and fill real values:

| Variable | Purpose |
|----------|---------|
| `NODE_ENV` | `production` |
| `PORT` | Often set by the platform; optional if default `4000` works |
| `DATABASE_URL` | Production Postgres URL |
| `JWT_SECRET` | Random string, **≥ 32 characters** |
| `FRONTEND_URL` | Your live site URL, e.g. `https://www.yourdomain.dk` |
| `CORS_ORIGINS` | Same origin(s) as the browser, comma-separated |
| `STRIPE_SECRET_KEY` | `sk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | From Stripe webhook endpoint (see below) |
| `STRIPE_PUBLISHABLE_KEY` | `pk_live_...` (optional on server; required on frontend) |
| All `STRIPE_PRICE_*` | Price IDs from Stripe Dashboard or `npm run stripe:seed-products` |
| `RESEND_API_KEY`, `FROM_EMAIL` | Email |
| Optional: `SENTRY_DSN`, `STRIPE_TAX_RATE_ID` |

### Run migrations (once per production DB)

From your machine (or CI), with production `DATABASE_URL`:

```bash
cd backend
DATABASE_URL="postgresql://..." npx prisma migrate deploy
```

Optional: seed admin users (one-time):

```bash
DATABASE_URL="postgresql://..." npx prisma db seed
```

### Health check

Open `https://YOUR-API-HOST/health` — expect JSON with `"status":"ok"` and database connected.

---

## 3. Stripe (live)

1. **Dashboard → Developers → API keys** — use **live** keys on production.
2. **Products / Prices** — create or run locally:

   ```bash
   cd backend
   # Set STRIPE_SECRET_KEY=sk_live_... in backend/.env
   npm run stripe:seed-products
   ```

   Paste printed `STRIPE_PRICE_*` lines into the **API** environment.

3. **Developers → Webhooks → Add endpoint**

   - URL: `https://YOUR-API-HOST/api/stripe/webhook`
   - Subscribe to events your server handles (checkout, invoices, subscriptions).
   - Copy the **signing secret** → `STRIPE_WEBHOOK_SECRET` on the API host.

---

## 4. Deploy the frontend (Vercel)

1. **Vercel → Add New Project** → import this GitHub repo.
2. **Root directory:** repository root (not `backend`).
3. **Framework:** Vite (or Other).
4. **Build command:** `npm run build`
5. **Output directory:** `dist`
6. **Environment variables (Production):**

   | Variable | Example |
   |----------|---------|
   | `VITE_API_URL` | `https://YOUR-API-HOST/api` |
   | `VITE_STRIPE_PUBLISHABLE_KEY` | `pk_live_...` |

   Add any other `VITE_*` keys your app uses (Sentry, analytics, etc.).

7. Deploy. **Every** change to `VITE_*` requires a **new production build**.

8. **Custom domain:** Vercel → Project → Domains → add `www.yourdomain.dk` / apex as needed.

### CORS

After the frontend URL is final, set on the **API**:

- `FRONTEND_URL=https://www.yourdomain.dk`
- `CORS_ORIGINS=https://www.yourdomain.dk` (comma-separated if multiple)

Redeploy the API if you change these.

---

## 5. End-to-end checklist

- [ ] `GET https://api.../health` returns OK
- [ ] `DATABASE_URL` + `npx prisma migrate deploy` applied to production
- [ ] Stripe live prices in API env; webhook URL + `STRIPE_WEBHOOK_SECRET`
- [ ] Vercel `VITE_API_URL` points to `https://api.../api`
- [ ] Vercel `VITE_STRIPE_PUBLISHABLE_KEY` = live publishable key
- [ ] Browser: open site → login / flows → **no CORS errors** in DevTools
- [ ] Test payment or Stripe test mode on a **staging** project if you use one

---

## 6. Local vs production

| Concern | Local | Production |
|--------|--------|--------------|
| API URL | `http://localhost:4000/api` in `.env.local` | `https://api.../api` in Vercel |
| Stripe | `sk_test_` / `pk_test_` + Stripe CLI webhooks | `sk_live_` / `pk_live_` + Dashboard webhook |
| Database | Local Postgres or dev Supabase | Production `DATABASE_URL` only on API host |

---

## 7. Troubleshooting

- **CORS errors** — `CORS_ORIGINS` must match the exact browser origin (scheme + host, no trailing slash mismatch).
- **401 / API not reached** — Wrong `VITE_API_URL` or API down; check Vercel build logs used the right env.
- **Stripe webhooks fail** — URL must be public HTTPS; secret must match the endpoint; raw body on webhook route must not be altered by proxies.

For more context on Vercel + Git, see `LOCAL_AND_VERCEL_GUIDE.md` in this repo.
