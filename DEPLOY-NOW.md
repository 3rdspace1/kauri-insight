# 🚀 DEPLOY NOW - Cloudflare Edition (3-Step Guide)

**Everything is ready to run entirely on Cloudflare!** The database has been migrated from Postgres to Cloudflare D1 (SQLite) and the app is optimized for Cloudflare Pages with edge runtime.

---

## ✅ What's Already Done

- ✅ Integrated Database layer with Cloudflare D1
- ✅ Replaced Auth.js database adapter to work with SQLite/D1 at the Edge
- ✅ Installed `@cloudflare/next-on-pages` and `wrangler`
- ✅ Generated a `wrangler.toml` for deployment

---

## 📋 Prerequisites

Before starting, make sure you have:
1. A **Cloudflare account** (free)
2. A **GitHub account**
3. **Cloudflare CLI (Wrangler)** installed globally on your machine (or just use `npx wrangler`)

If you don't have Wrangler authorized yet, run:
```bash
npx wrangler login
```

---

## 🎯 3-Step Deployment

### **STEP 1: Create your D1 Database**

1. Run the following command in your terminal to create the database:
   ```bash
   npx wrangler d1 create kauri-insight-db
   ```
2. The command will output bindings like `database_id = "xxxxx-xxxx-xxxx-xxxx"`.
3. Open `apps/web/wrangler.toml` and replace `replace-with-your-d1-id` with your generated ID.

### **STEP 2: Apply the Database Schema**

Now we need to create the tables in your production Cloudflare database.

Run this command to execute the Drizzle migrations:
```bash
npx wrangler d1 execute kauri-insight-db --local --file=packages/db/migrations/meta/_journal.json
# Note: In production you can deploy the migrations via standard drizzle-kit commands or executing your SQL dump block.
# Since we generated standard drizzle artifacts, you can just run:
npx wrangler d1 execute kauri-insight-db --remote --file=packages/db/migrations/0000_xxxxx.sql 
```
*(Check your exact filename under `packages/db/migrations/` to find the correct SQL migration file).*


### **STEP 3: Deploy to Cloudflare Pages!**

1. Go to `apps/web`
   ```bash
   cd apps/web
   ```
2. Build the project using next-on-pages:
   ```bash
   npx @cloudflare/next-on-pages
   ```
3. Deploy it to Cloudflare Pages:
   ```bash
   npx wrangler pages deploy .vercel/output/static
   ```

*(Alternatively, you can just link your GitHub repository inside the Cloudflare Dashboard -> Pages -> Create a Project -> Framework: Next.js -> Build command: `npx @cloudflare/next-on-pages` -> Set up the D1 Binding under Settings > Functions > D1 Database Bindings with the variable name `DB`!)*

### **STEP 4: Set Environment Variables on Cloudflare Dashboard**

1. Go to your Cloudflare Dashboard -> Pages -> Kauri Insight project.
2. Go to **Settings** -> **Environment variables**.
3. Add the following secrets (don't forget to **Encrypt** them):
   
   - `MODELSLAB_API_KEY`: JZ2sSqdyaFahnFioDJyYtBANUMAEnmiJqQZ3qw73DGtpIapnxNWa8imSWWBm
   - `NEXTAUTH_SECRET`: jX9fK2mP8qR5tY7wN3vL6hG4sD1aZ0xC9bV8nM5kJ2
   - `NEXTAUTH_URL`: https://kauri-insight.pages.dev *(Change your `.pages.dev` to match your actual CF domain)*
   - `NODE_ENV`: production

---

## 🎉 That's It!

Your Next.js App Router application is now fully running off **Cloudflare Workers** via standard Edge routing, and its state is persisting natively onto **Cloudflare D1**. Because D1 relies entirely on SQLite, the app enjoys lightning-fast read access with global distributed edges!

> **Having Troubles?** 
> * Build Errors? `next-on-pages` usually logs clearly. Some Windows environments have issues resolving Vercel CLI locally so deploying via the GitHub integration inside the Cloudflare dashboard is the **safest & most seamless** deployment method.
