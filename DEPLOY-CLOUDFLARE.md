# Kauri Insight — Cloudflare Deployment Guide

## Prerequisites
- Cloudflare account
- Wrangler CLI: `npm install -g wrangler@latest`
- Node.js 20+ and pnpm 9+

---

## Step 1: Install dependencies

```bash
cd kauri-insight
pnpm install
```

## Step 2: Create D1 Database

```bash
npx wrangler d1 create kauri-insight-db
```

Copy the `database_id` from the output and update `wrangler.toml` if needed (it's already pre-configured with ID `356d244f-2ce4-485c-90ff-face2e079523`).

## Step 3: Apply Database Schema

```bash
# Apply migration to D1
npx wrangler d1 execute kauri-insight-db \
  --remote \
  --file=scripts/d1-schema.sql
```

## Step 4: Build for Cloudflare Pages

```bash
cd apps/web

# Set Cloudflare environment
set NEXTAUTH_SECRET=jX9fK2mP8qR5tY7wN3vL6hG4sD1aZ0xC9bV8nM5kJ2
set NEXTAUTH_URL=https://kauri-insight.pages.dev
set MODELSLAB_API_KEY=JZ2sSqdyaFahnFioDJyYtBANUMAEnmiJqQZ3qw73DGtpIapnxNWa8imSWWBm

# Build with next-on-pages
npx @cloudflare/next-on-pages
```

## Step 5: Deploy to Cloudflare Pages

### Option A: Via CLI

```bash
npx wrangler pages deploy .vercel/output/static
```

### Option B: Via Cloudflare Dashboard (Recommended)

1. Go to [Cloudflare Dashboard → Pages](https://dash.cloudflare.com/?to=/:account/pages)
2. Click **Create a project** → **Connect to Git**
3. Select the `kauri-insight` repository
4. Configure build settings:
   - **Build command:** `cd apps/web && npx @cloudflare/next-on-pages`
   - **Build output directory:** `apps/web/.vercel/output/static`
   - **Root directory:** `/`
5. Add **Environment Variables** (see below)
6. Under **Functions** → **D1 database bindings**, add:
   - Variable name: `DB`
   - D1 database: `kauri-insight-db`
7. Deploy!

## Step 6: Set Environment Variables

Add these to Cloudflare Pages → Settings → Environment variables:

| Variable | Value |
|----------|-------|
| `MODELSLAB_API_KEY` | `JZ2sSqdyaFahnFioDJyYtBANUMAEnmiJqQZ3qw73DGtpIapnxNWa8imSWWBm` |
| `NEXTAUTH_SECRET` | `jX9fK2mP8qR5tY7wN3vL6hG4sD1aZ0xC9bV8nM5kJ2` |
| `NEXTAUTH_URL` | `https://kauri-insight.pages.dev` |
| `NEXTAUTH_EMAIL_FROM` | `3rdspacenz@gmail.com` |
| `NODE_ENV` | `production` |

## Custom Domain

1. In Cloudflare Pages → Custom domains, add `kauriinsight.com`
2. Update `NEXTAUTH_URL` to `https://www.kauriinsight.com`
3. Redeploy

---

## Verification

After deployment:
1. Visit your `.pages.dev` URL
2. Landing page should load
3. Click "Sign In" → enter email → magic link is sent
4. Dashboard shows stats and surveys
5. Create survey → add questions → publish
6. Share runtime link → respondents can take survey
7. Generate insights → view AI analysis
8. Export report

All database state is in Cloudflare D1 (SQLite at the edge).
