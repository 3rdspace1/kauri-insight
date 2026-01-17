# 🚀 Deploy Kauri Insight to GitHub, Vercel & Railway

## Step 1: Push to GitHub

### A) Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `kauri-insight` (or any name you want)
3. **Keep it PRIVATE** (recommended) or Public
4. **DO NOT** initialize with README, .gitignore, or license (we have these already)
5. Click "Create repository"

### B) Push Your Code

GitHub will show you commands. Use these from your terminal:

```bash
cd C:/Users/User/kauri-insight

# Add GitHub as remote (replace YOUR-USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR-USERNAME/kauri-insight.git

# Push to GitHub
git branch -M main
git push -u origin main
```

**You'll be prompted for credentials:**
- Username: Your GitHub username
- Password: Use a **Personal Access Token** (not your password!)

**Don't have a token?** Create one here: https://github.com/settings/tokens
- Click "Generate new token (classic)"
- Name: "kauri-insight-deploy"
- Expiration: 90 days (or longer)
- Scopes: Check **`repo`** (full control of private repositories)
- Click "Generate token"
- **Copy the token** - you won't see it again!
- Use this token as your password when pushing

---

## Step 2: Deploy Database to Railway

### A) Create Railway Account & Project

1. Go to https://railway.app
2. Sign up / Log in (can use GitHub)
3. Click "New Project"
4. Select "Provision PostgreSQL"
5. Wait for database to provision (~30 seconds)

### B) Get Database URL

1. Click on your PostgreSQL service
2. Go to "Variables" tab
3. Find `DATABASE_URL` - click to copy
4. **Save this somewhere** - you'll need it for Vercel too!

Example: `postgresql://postgres:PASSWORD@region.railway.app:5432/railway`

### C) Run Migrations on Railway

From your terminal:

```bash
cd C:/Users/User/kauri-insight

# Set the Railway database URL temporarily
$env:DATABASE_URL="postgresql://postgres:PASSWORD@region.railway.app:5432/railway"

# Run migrations
pnpm db:migrate

# Seed demo data (optional)
pnpm db:seed
```

**Expected output:**
```
⏳ Running migrations...
✅ Migrations completed
```

✅ **Railway database is ready!**

---

## Step 3: Deploy to Vercel

### A) Import from GitHub

1. Go to https://vercel.com
2. Sign up / Log in (use GitHub for easy linking)
3. Click "Add New..." → "Project"
4. Import your `kauri-insight` repository
5. Click "Import"

### B) Configure Build Settings

Vercel should auto-detect Next.js. Verify these settings:

- **Framework Preset:** Next.js
- **Root Directory:** `./` (leave blank or use root)
- **Build Command:** `pnpm build`
- **Output Directory:** `.next` (auto-detected)
- **Install Command:** `pnpm install`

### C) Add Environment Variables

**CRITICAL:** Before deploying, add these environment variables:

Click "Environment Variables" and add:

**Required:**
```
DATABASE_URL = postgresql://postgres:PASSWORD@region.railway.app:5432/railway
(paste from Railway)

NEXTAUTH_URL = https://your-app.vercel.app
(Vercel will show you this URL - you can set it after first deploy or use placeholder)

NEXTAUTH_SECRET = (generate with: openssl rand -base64 32)
(run this in terminal to generate, then paste here)

NEXTAUTH_EMAIL_FROM = noreply@yourdomain.com
(or noreply@example.com for testing)
```

**Optional (app works without these):**
```
MODELSLAB_API_KEY = (your Modelslab API key - leave blank to use mock)
NANO_BANANA_API_KEY = (your Nano Banana key - leave blank for SVG placeholders)
SLACK_WEBHOOK_URL = (your Slack webhook - leave blank to log to console)
RESEND_API_KEY = (your Resend key - leave blank to log magic links)
```

### D) Deploy!

1. Click "Deploy"
2. Wait 2-3 minutes for build
3. You'll get a URL like: `https://kauri-insight-abc123.vercel.app`

### E) Update NEXTAUTH_URL (if needed)

After first deployment:
1. Go to your Vercel project settings
2. Environment Variables
3. Edit `NEXTAUTH_URL` to match your actual Vercel URL
4. Redeploy

---

## Step 4: Verify Deployment

### Test Your Deployed App

1. Visit your Vercel URL
2. You should see the landing page! ✅
3. Try signing in (if you set RESEND_API_KEY, magic links work; otherwise check Vercel logs)

### Check Vercel Logs

If something doesn't work:
1. Go to your Vercel project
2. Click "Deployments"
3. Click on your latest deployment
4. Click "View Function Logs"

### Common Issues & Fixes

**Issue: Build fails**
- Check that `DATABASE_URL` is set
- Verify all environment variables are correct
- Check build logs for specific errors

**Issue: Magic links don't send**
- Expected! Without `RESEND_API_KEY`, they log to console
- Check Vercel function logs to see the magic link URL
- Or add RESEND_API_KEY to send real emails

**Issue: Database connection error**
- Verify `DATABASE_URL` from Railway is correct
- Make sure you ran migrations on Railway database
- Check Railway database is running

---

## Step 5: Custom Domain (Optional)

### Add Your Own Domain

1. In Vercel project settings, go to "Domains"
2. Add your domain (e.g., `kauri-insight.yourcompany.com`)
3. Follow Vercel's DNS instructions
4. Update `NEXTAUTH_URL` to use your custom domain
5. Redeploy

---

## Quick Reference Commands

### Push Code Changes

```bash
cd C:/Users/User/kauri-insight

# After making changes
git add .
git commit -m "Your change description"
git push

# Vercel auto-deploys on push!
```

### Update Railway Database

```bash
# Set Railway DB URL
$env:DATABASE_URL="your-railway-url"

# Generate new migration (if schema changed)
pnpm db:generate

# Run new migrations
pnpm db:migrate
```

### Vercel CLI (Optional but useful)

Install Vercel CLI for easier deployments:

```bash
npm i -g vercel

cd C:/Users/User/kauri-insight
vercel login
vercel  # Deploy
vercel --prod  # Deploy to production
```

---

## Environment Variables Summary

### Railway
- Just the database - no env vars needed

### Vercel (Required)
```
DATABASE_URL=postgresql://...       (from Railway)
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=<generate-random-string>
NEXTAUTH_EMAIL_FROM=noreply@example.com
```

### Vercel (Optional - app works without these)
```
MODELSLAB_API_KEY=
NANO_BANANA_API_KEY=
SLACK_WEBHOOK_URL=
RESEND_API_KEY=
```

---

## What Happens Next

1. **Push to GitHub** → Code is backed up and version controlled
2. **Deploy to Railway** → PostgreSQL database ready
3. **Deploy to Vercel** → App is live on the internet!

Every time you push to GitHub, Vercel auto-deploys your changes! 🚀

---

## Troubleshooting

### Can't push to GitHub?

**Error: "Authentication failed"**
- Use a Personal Access Token, not your password
- Generate at: https://github.com/settings/tokens
- Select `repo` scope

**Error: "remote already exists"**
```bash
git remote remove origin
git remote add origin https://github.com/YOUR-USERNAME/kauri-insight.git
```

### Railway migrations fail?

**Error: "Connection refused"**
- Check DATABASE_URL is copied correctly
- Ensure Railway database is running
- Try copying URL again from Railway dashboard

### Vercel build fails?

**Error: "MODULE_NOT_FOUND"**
- Usually means dependencies didn't install
- Check `pnpm-lock.yaml` is committed to git
- Try redeploying

**Error: "DATABASE_URL not found"**
- Add DATABASE_URL to Vercel environment variables
- Redeploy

---

## Success Checklist

- [ ] GitHub repository created
- [ ] Code pushed to GitHub
- [ ] Railway database created
- [ ] DATABASE_URL copied from Railway
- [ ] Migrations run on Railway database
- [ ] Vercel project created from GitHub repo
- [ ] Environment variables added to Vercel
- [ ] Vercel deployment successful
- [ ] Landing page loads on Vercel URL
- [ ] (Optional) Custom domain added

---

## Next Steps After Deployment

1. **Share the URL** with your team
2. **Set up monitoring** (Vercel Analytics)
3. **Add custom domain** (optional)
4. **Configure Resend** for real email (optional)
5. **Add Modelslab API key** for real AI insights (optional)
6. **Continue building** the dashboard UI

---

**You're about to go live!** 🚀✨

Any issues? Check:
- Vercel deployment logs
- Railway database status
- GitHub repository settings
