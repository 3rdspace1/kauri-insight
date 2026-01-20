# 🚀 Deployment Guide - kauriinsight.com

**Branch**: `strange-germain`
**Status**: ✅ Ready for Production
**Build**: ✅ Passing
**Date**: 2026-01-20

---

## 📋 Pre-Deployment Checklist

### ✅ Code Ready
- [x] All features implemented
- [x] Build succeeds (verified)
- [x] No TypeScript errors
- [x] No linting errors
- [x] All commits pushed to `strange-germain`

### ✅ Database Ready
- [x] Migration scripts created
- [x] Schema validated
- [ ] **ACTION REQUIRED**: Run migration (see below)

### ✅ Environment Variables
- [ ] **ACTION REQUIRED**: Set required env vars (see below)

---

## 🗄️ Database Migration

**IMPORTANT**: Run this migration before deploying!

### Option 1: Direct SQL

```bash
# Connect to your database
psql $DATABASE_URL

# Run migration
\i packages/db/migrations/0009_add_tenant_business_context.sql
```

### Option 2: Via Application

```bash
# If using Drizzle Kit
cd packages/db
pnpm drizzle-kit push
```

### Migration Contents

Adds business context fields to `tenants` table:
- `industry` (VARCHAR 255) - Industry classification
- `website` (TEXT) - Company website
- `description` (TEXT) - Business description
- `logo` (TEXT) - Logo URL
- `primary_color` (VARCHAR 7) - Hex color code
- `context_json` (JSONB) - Scraped metadata

---

## 🔐 Environment Variables

### Required (Must Set)

```bash
# Database
DATABASE_URL=your_postgres_connection_string

# NextAuth
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your_secure_random_string

# AI Provider (Claude)
ANTHROPIC_API_KEY=your_anthropic_api_key
```

### Optional but Recommended

```bash
# Nano Banana Pro for AI-generated visuals
MODELSLAB_API_KEY=your_modelslab_api_key
```

**Note**: Without `MODELSLAB_API_KEY`, the system still works perfectly - it will use beautiful SVG placeholders for report covers.

---

## 📦 Dependencies Installation

### Production Dependencies

All required dependencies are already in `package.json`. On deploy:

```bash
# Install all dependencies
pnpm install

# Install Playwright for PDF generation
npx playwright install chromium
```

### Key Dependencies Added
- `playwright` - PDF rendering
- `pptxgenjs` - PowerPoint generation
- `@hookform/resolvers` - Form validation
- `react-hook-form` - Forms
- `zod` - Schema validation

---

## 🏗️ Build & Deploy Steps

### 1. Merge Branch

```bash
# Create pull request or merge directly
git checkout main
git merge strange-germain
git push origin main
```

### 2. Deploy Platform

**Vercel** (Recommended):
```bash
# Connect GitHub repo
# Vercel auto-deploys on push to main

# Or manual deploy
vercel --prod
```

**Railway**:
```bash
railway up
```

**Docker**:
```bash
# Build image
docker build -t kauriinsight .

# Run container
docker run -p 3000:3000 \
  -e DATABASE_URL=$DATABASE_URL \
  -e ANTHROPIC_API_KEY=$ANTHROPIC_API_KEY \
  -e MODELSLAB_API_KEY=$MODELSLAB_API_KEY \
  kauriinsight
```

### 3. Run Database Migration

```bash
# After deploy, connect to production DB
psql $PRODUCTION_DATABASE_URL < packages/db/migrations/0009_add_tenant_business_context.sql
```

### 4. Verify Deployment

Test these endpoints:
- `GET /` - Homepage loads
- `GET /login` - Login page works
- `GET /dashboard` - Dashboard accessible (after auth)
- `GET /dashboard/settings/business` - Business context page loads
- `POST /api/insights/run` - AI insights work
- `POST /api/reports/[surveyId]/export` - Export works

---

## 🧪 Post-Deployment Testing

### 1. Business Context Setup

```
1. Navigate to /dashboard/settings/business
2. Fill in test company information
3. Try "Auto-Fill" with a website
4. Set a custom color
5. Save configuration
6. Verify data saved in database
```

### 2. Survey Flow

```
1. Create new survey
2. Add questions
3. Share survey link
4. Complete survey (as respondent)
5. View responses
6. Generate insights
7. Export report (PDF & PPTX)
8. Verify download works
```

### 3. Visual Generation (If API Key Set)

```
1. Create survey with responses
2. Generate insights
3. Export report
4. Check console logs for:
   "🎨 Generating expert-crafted cover for [Industry] survey..."
   "✅ 4K visual generated successfully with Nano Banana Pro"
5. Verify cover image appears in report
```

---

## 📊 Monitoring

### Key Metrics to Watch

**Performance**:
- Report generation time (~20-40 seconds expected)
- Insight generation time (~10-20 seconds expected)
- Visual generation time (~10-20 seconds if API enabled)

**Errors**:
- ModelsLab API failures (should gracefully fall back to SVG)
- Playwright crashes (may need memory increase)
- Database connection issues

**Logs to Monitor**:
```
🎨 [Nano Banana Pro] No API key configured, using elegant placeholder
✅ 4K visual generated successfully with Nano Banana Pro
📊 Metadata: nano-banana-pro, Aspect: 16:9
❌ Failed to generate graphic: [error details]
```

---

## 🔧 Configuration Options

### Memory Requirements

**Minimum**:
- 512 MB for basic functionality
- 1 GB recommended for PDF generation
- 2 GB recommended for concurrent exports

**Recommended Platform Settings**:
- Vercel: Pro plan (no function timeout)
- Railway: 2 GB RAM
- AWS/GCP: t3.small or equivalent

### Playwright Configuration

If PDF generation fails:
```bash
# Ensure Chromium is installed
npx playwright install chromium

# Set environment variables (if needed)
PLAYWRIGHT_BROWSERS_PATH=/path/to/browsers
```

---

## 🎨 Feature Availability

### Without MODELSLAB_API_KEY

✅ **All features work**:
- Business context configuration
- Survey creation and management
- Response collection
- AI insights generation
- PDF/PPTX export
- **Beautiful SVG placeholders** for covers

### With MODELSLAB_API_KEY

✅ **Enhanced visuals**:
- All above features PLUS
- **4K AI-generated cover images**
- Industry-specific visual design
- Sentiment-aware composition
- Brand color integration
- Expert prompting quality

---

## 🚨 Troubleshooting

### Issue: Build Fails

```bash
# Clear cache and reinstall
rm -rf node_modules .next
pnpm install
pnpm build
```

### Issue: Database Migration Fails

```bash
# Check if table exists
psql $DATABASE_URL -c "\d tenants"

# If exists, manually add columns
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS industry VARCHAR(255);
# ... (run other ALTER statements)
```

### Issue: PDF Export Fails

```bash
# Reinstall Playwright
npx playwright install --force chromium

# Check memory
# Increase if < 1GB
```

### Issue: Nano Banana Not Working

```bash
# Check API key format
echo $MODELSLAB_API_KEY

# Test API directly
curl -X POST https://modelslab.com/api/v7/images/text-to-image \
  -H "Content-Type: application/json" \
  -d '{"key":"YOUR_KEY","model_id":"nano-banana-pro","prompt":"test","aspect_ratio":"1:1"}'

# Check logs for error details
```

---

## 📈 Scaling Considerations

### High Volume (100+ concurrent users)

**Database**:
- Connection pooling (already configured)
- Read replicas for reports
- Index optimization

**API Rate Limits**:
- Anthropic: Monitor usage
- ModelsLab: Queue visual generation

**Caching**:
- Redis for session storage
- CDN for static assets
- Cache generated reports (optional)

---

## 🎯 Post-Launch Tasks

### Week 1
- [ ] Monitor error rates
- [ ] Check report generation times
- [ ] Verify visual quality (if API enabled)
- [ ] Collect user feedback

### Week 2
- [ ] Analyze usage patterns
- [ ] Optimize slow queries
- [ ] Review AI prompt quality
- [ ] Plan next features

### Week 3
- [ ] A/B test report designs
- [ ] Gather visual feedback
- [ ] Optimize costs (API usage)
- [ ] Document edge cases

---

## 🔐 Security Notes

### API Keys
- Never commit to git ✅
- Use environment variables ✅
- Rotate regularly
- Monitor usage

### Data Privacy
- Business context: tenant-isolated ✅
- Survey responses: encrypted in transit ✅
- Generated reports: ephemeral (not stored) ✅
- User data: GDPR compliant ✅

---

## 📞 Support Resources

### Documentation
- `AUTOMATION-COMPLETE.md` - Full system overview
- `REPORTING-FEATURES.md` - Report export details
- `EXPERT-PROMPTING-SYSTEM.md` - Visual generation
- `AI-REPORTING-STATUS.md` - AI integration
- `PROGRESS-UPDATE.md` - MVP status

### GitHub
- Repository: kauri-insight
- Branch: `strange-germain`
- Issues: Report bugs here

### APIs
- ModelsLab: https://modelslab.com/
- Anthropic: https://console.anthropic.com/

---

## ✅ Deployment Checklist

Before going live:

- [ ] Database migration run
- [ ] Environment variables set
- [ ] Playwright installed
- [ ] Build succeeds
- [ ] Test endpoints working
- [ ] Business context saves
- [ ] Insights generate
- [ ] Reports export
- [ ] Monitoring configured
- [ ] Backup strategy ready
- [ ] Team notified

---

## 🎉 You're Ready!

The system is **production-ready** with:
- ✅ Complete MVP functionality
- ✅ AI-powered insights
- ✅ Professional report generation
- ✅ Business context integration
- ✅ Expert visual generation (optional)
- ✅ Beautiful fallbacks
- ✅ Comprehensive documentation

**Deploy with confidence!** 🚀

---

**Questions?** Check the documentation files or review the commit history for implementation details.
