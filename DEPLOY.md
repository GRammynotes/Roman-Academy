# Roman Academy — Deployment Guide

Deploy the **API backend to Render** and the **frontend to Vercel** — both free tiers work perfectly.

---

## Part 1 — Deploy the API on Render

### Step 1 — Create a Render account
Go to [render.com](https://render.com) → Sign up (free).

### Step 2 — Connect your GitHub repo
Push this project to GitHub first (if not done):
```bash
git init
git add .
git commit -m "initial commit"
git remote add origin https://github.com/YOUR_USERNAME/roman-academy.git
git push -u origin main
```

### Step 3 — Create a new Web Service on Render
1. Click **New +** → **Web Service**
2. Connect your GitHub repo
3. Render will auto-detect `render.yaml` — click **Apply** when prompted, OR fill manually:

| Field | Value |
|-------|-------|
| **Name** | `roman-academy-api` |
| **Region** | Singapore (closest to India) |
| **Branch** | `main` |
| **Build Command** | `npm install -g pnpm@10.26.1 && pnpm install --frozen-lockfile && pnpm --filter @workspace/api-server run build` |
| **Start Command** | `node artifacts/api-server/dist/index.mjs` |
| **Plan** | Free |

### Step 4 — Set Environment Variables on Render
Go to **Environment** tab and add:

| Variable | Value |
|----------|-------|
| `NODE_ENV` | `production` |
| `PORT` | `8080` |
| `DATABASE_URL` | Your Neon PostgreSQL URL (from Replit secrets) |
| `SESSION_SECRET` | Any 64-character random string (generate at [randomkeygen.com](https://randomkeygen.com)) |
| `ALLOWED_ORIGINS` | `https://your-app.vercel.app` ← fill after Vercel deploy |

### Step 5 — Deploy and get your URL
Click **Deploy** and wait ~2 minutes. Your API URL will be:
```
https://roman-academy-api.onrender.com
```
Copy this URL — you'll need it in the next step.

> **Note:** Free Render services spin down after 15 min of inactivity. First request after sleep takes ~30 seconds. Upgrade to Starter ($7/mo) to keep it always-on.

---

## Part 2 — Deploy the Frontend on Vercel

### Step 1 — Create a Vercel account
Go to [vercel.com](https://vercel.com) → Sign up with GitHub (free).

### Step 2 — Update vercel.json with your Render URL
Open `vercel.json` in the project and replace the placeholder:
```json
"destination": "https://roman-academy-api.onrender.com/api/:path*"
```
Commit and push this change.

### Step 3 — Import project on Vercel
1. Click **Add New Project** → Import your GitHub repo
2. Vercel reads `vercel.json` automatically — no extra config needed
3. Click **Deploy**

### Step 4 — Set Environment Variable on Vercel (if needed)
No extra env vars needed — the frontend only talks to the API via the `/api` rewrite proxy defined in `vercel.json`.

### Step 5 — Update ALLOWED_ORIGINS on Render
Once Vercel gives you a URL (e.g. `https://roman-academy.vercel.app`), go back to Render → Environment → update:
```
ALLOWED_ORIGINS = https://roman-academy.vercel.app
```
Then **Manual Deploy** → redeploy on Render.

---

## Part 3 — Final Checks After Deploy

### Run the DB seed (first time only)
The database schema is already applied. If the DB is fresh (empty), seed it:
```bash
# Run locally from the project root:
cd lib/db && pnpm exec tsx seed.ts
```
This creates all 19 students + 2 teacher accounts.

### Pre-launch reset (clear test/demo data before students use it)
```bash
# Run locally from the project root:
pnpm exec tsx scripts/reset-sample-data.ts
```
This wipes test scores, drafts, rank history and resets `firstLogin = true` so every student sets a real password on first login.

### Test the live site
1. Visit `https://roman-academy.vercel.app`
2. Login as `roman_sir / Roman@123`
3. Check Dashboard → Students → Upload Marks all load
4. Login as `kunal.datkhile.2026 / student@123` (demo student)

---

## All Login Credentials

See **`CREDENTIALS.md`** in the project root for the complete list.

**Quick reference:**

| Account | Username | Password |
|---------|----------|----------|
| Main teacher | `roman_sir` | `Roman@123` |
| Recovery admin | `super_admin` | `RomanAdmin@2026!` |
| All students | `firstname.lastname.2026` | `student@123` |

---

## Environment Variables Reference

### Render (API Backend)
| Variable | Required | Notes |
|----------|----------|-------|
| `DATABASE_URL` | ✅ | Neon PostgreSQL connection string |
| `SESSION_SECRET` | ✅ | Min 32 chars, random |
| `NODE_ENV` | ✅ | Set to `production` |
| `PORT` | ✅ | Set to `8080` |
| `ALLOWED_ORIGINS` | ✅ | Your Vercel URL, comma-separated if multiple |

### Vercel (Frontend)
No environment variables needed — all API calls go through the `/api` rewrite proxy.

---

## Troubleshooting

**"Network Error" or API not responding on live site**
- Check Render logs for errors
- Verify `ALLOWED_ORIGINS` matches your exact Vercel URL (no trailing slash)
- Render free tier: first request after idle takes ~30s — just wait

**Login works but session drops immediately**
- `SESSION_SECRET` is missing or different across Render deploys
- Make sure `NODE_ENV=production` is set (enables secure cookies)

**"relation users does not exist" in Render logs**
- The DB schema hasn't been pushed — run `pnpm --filter @workspace/db run push` locally with the production `DATABASE_URL`

**CORS error in browser console**
- `ALLOWED_ORIGINS` on Render doesn't match the exact Vercel URL
- Update it and redeploy on Render

---

## Architecture

```
Student/Teacher Browser
        │
        ▼
  Vercel (Frontend)
  react-vite SPA
  roman-academy.vercel.app
        │
        │ /api/* rewrites to →
        ▼
  Render (API Backend)
  Express 5 + Drizzle ORM
  roman-academy-api.onrender.com
        │
        ▼
  Neon PostgreSQL
  (Serverless DB, always-on free tier)
```
