# 🚀 Push to GitHub - Quick Commands

## Step 1: Create GitHub Repository

1. Go to: https://github.com/new
2. Repository name: `kauri-insight`
3. **DO NOT** check "Initialize with README"
4. Click "Create repository"

## Step 2: Get Your Personal Access Token

1. Go to: https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Name: `kauri-insight-deploy`
4. Scopes: Check **`repo`**
5. Click "Generate token"
6. **COPY THE TOKEN** - you won't see it again!

## Step 3: Push Your Code

Open PowerShell and run these commands:

```powershell
cd C:\Users\User\kauri-insight

# Add your GitHub repo as remote
# REPLACE YOUR-USERNAME with your actual GitHub username!
git remote add origin https://github.com/YOUR-USERNAME/kauri-insight.git

# Rename branch to main (GitHub standard)
git branch -M main

# Push to GitHub
git push -u origin main
```

**When prompted:**
- Username: `your-github-username`
- Password: `paste-your-personal-access-token-here`

## That's It!

Your code is now on GitHub! ✅

Check it at: `https://github.com/YOUR-USERNAME/kauri-insight`

## Next: Deploy to Vercel & Railway

See `DEPLOY-GUIDE.md` for the complete deployment process.

Or quick version:

**Railway:**
1. Go to https://railway.app
2. New Project → Provision PostgreSQL
3. Copy DATABASE_URL
4. Run: `pnpm db:migrate` (after setting DATABASE_URL)

**Vercel:**
1. Go to https://vercel.com
2. Import your GitHub repo
3. Add environment variables (DATABASE_URL, NEXTAUTH_SECRET, etc.)
4. Deploy!

---

**Need help?** Check DEPLOY-GUIDE.md for detailed instructions with screenshots and troubleshooting.
