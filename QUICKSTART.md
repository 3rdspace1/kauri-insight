# Kauri Insight - Quick Start Guide

## 🚀 Get Running in 5 Minutes

### 1. Install Dependencies

```bash
cd kauri-insight
pnpm install
```

### 2. Set Up Environment

```bash
cp .env.example .env
```

Edit `.env` with your database connection:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/kauri_insight
NEXTAUTH_SECRET=your-generated-secret
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_EMAIL_FROM=noreply@example.com
```

Generate a secret:
```bash
openssl rand -base64 32
```

### 3. Initialize Database

```bash
# Run migrations
pnpm db:migrate

# Seed demo data
pnpm db:seed
```

### 4. Start Development Server

```bash
pnpm dev
```

Visit http://localhost:3000

## 🎯 What Works Now

✅ **Landing Page** - Professional homepage with features
✅ **Database** - Full schema with demo data
✅ **Auth System** - Email magic links (logs to console without Resend)
✅ **AI Provider** - Mock insights (works without API key)
✅ **Core API Routes** - Survey CRUD, insights generation
✅ **All Packages** - TypeScript compiles successfully

## 📝 Demo Data

After seeding, you have:

- **User**: demo@example.com
- **Tenant**: Demo Organisation
- **Survey**: "Appointment Follow Up" (3 questions, 1 adaptive rule)
- **Responses**: 2 sample responses with varied scores
- **Insights**: 1 pre-generated insight
- **Action**: 1 follow-up action

## 🧪 Test the System

### Generate Synthetic Responses

```bash
pnpm gen:synthetic  # Creates 10 responses (default)
pnpm gen:synthetic 50  # Creates 50 responses
```

### Run Insights Generation

```bash
pnpm insights:run
```

This will:
1. Fetch all responses
2. Analyze with AI provider (or mock)
3. Generate insights
4. Save to database
5. Print results to console

### Check Database

```bash
cd packages/db
pnpm studio
```

Opens Drizzle Studio at http://localhost:4983

## 🔑 API Keys (Optional)

The system works fully without any API keys using fallbacks:

- **No MODELSLAB_API_KEY**: Uses mock insights ✅
- **No RESEND_API_KEY**: Logs magic links to console ✅
- **No SLACK_WEBHOOK_URL**: Logs alerts to console ✅
- **No NANO_BANANA_API_KEY**: Uses SVG placeholders ✅

To enable real services, add keys to `.env`:

```env
MODELSLAB_API_KEY=your-modelslab-key
RESEND_API_KEY=your-resend-key
SLACK_WEBHOOK_URL=https://hooks.slack.com/...
```

## 📂 Project Structure

```
kauri-insight/
├── apps/web/              # Next.js app
│   ├── src/app/          # App Router pages
│   ├── src/components/   # React components
│   ├── src/lib/          # Utilities
│   └── src/hooks/        # React hooks
├── packages/
│   ├── db/               # Database (Drizzle ORM)
│   ├── ai/               # AI provider (Modelslab + mocks)
│   ├── visuals/          # Charts & exports (PDF/PPTX)
│   ├── graphics/         # Nano Banana Pro
│   ├── integrations/     # Slack, email
│   ├── domain-packs/     # YAML templates
│   └── shared/           # Types, validators
├── scripts/              # Utility scripts
└── tests/                # Playwright tests
```

## 🛠️ Development Commands

```bash
# Development
pnpm dev                    # Start dev server
pnpm build                  # Build for production
pnpm start                  # Start production server

# Database
pnpm db:generate            # Generate migrations
pnpm db:migrate             # Run migrations
pnpm db:seed                # Seed demo data
pnpm db:studio              # Open Drizzle Studio

# Testing
pnpm test:e2e               # Run Playwright tests
pnpm type-check             # TypeScript type checking
pnpm lint                   # ESLint

# Utilities
pnpm gen:synthetic [N]      # Generate N synthetic responses
pnpm insights:run           # Run insights generation

# Cleanup
pnpm clean                  # Remove build artifacts
```

## 📊 Check Build Status

```bash
# Type check all packages
pnpm type-check

# Build all packages
pnpm build

# Run smoke tests
pnpm test:e2e
```

## 🚢 Deploy to Production

### Railway (Database)

1. Create PostgreSQL service at https://railway.app
2. Copy `DATABASE_URL`
3. Run migrations:
   ```bash
   DATABASE_URL="your-railway-url" pnpm db:migrate
   ```

### Vercel (Application)

1. Push code to GitHub
2. Import to Vercel: https://vercel.com/new
3. Set environment variables:
   - `DATABASE_URL` (from Railway)
   - `NEXTAUTH_SECRET` (generate new)
   - `NEXTAUTH_URL` (your Vercel URL)
   - `NEXTAUTH_EMAIL_FROM`
4. Deploy!

## 🆘 Troubleshooting

### Build Fails

```bash
pnpm install
pnpm type-check  # See what's broken
```

### Database Connection Error

Check `DATABASE_URL` in `.env` is correct and database is running.

### Magic Links Not Arriving

Check console logs - without `RESEND_API_KEY`, links are logged to terminal.

### TypeScript Errors

```bash
pnpm type-check
```

Fix errors in the order they appear.

## 📚 Next Steps

After verifying the foundation works:

1. **Complete API Routes** - Add remaining endpoints
2. **Build Dashboard UI** - Create pages in `apps/web/src/app/dashboard/`
3. **Create Runtime Interface** - Survey respondent experience
4. **Add React Query Hooks** - For data fetching
5. **Polish UI** - Add remaining shadcn/ui components

See `IMPLEMENTATION-STATUS.md` for detailed roadmap.

## 🎨 UI Component Pattern

When adding new pages, follow this pattern:

```tsx
// apps/web/src/app/dashboard/example/page.tsx
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@kauri/db/client'

export default async function ExamplePage() {
  const session = await getServerSession(authOptions)

  if (!session?.user || !session.tenantId) {
    redirect('/login')
  }

  // Fetch data server-side
  const data = await db.query.surveys.findMany({
    where: eq(surveys.tenantId, session.tenantId),
  })

  return (
    <div>
      <h1>Example Page</h1>
      {/* Render data */}
    </div>
  )
}
```

## 💡 Tips

- **Start small**: Build one page at a time
- **Use patterns**: Copy from existing code
- **Test locally**: Run `pnpm dev` after each change
- **Check types**: Run `pnpm type-check` frequently
- **Commit often**: Save progress incrementally

## 📞 Support

- Check `README.md` for comprehensive documentation
- Check `IMPLEMENTATION-STATUS.md` for what's done/pending
- Run `pnpm type-check` to find TypeScript issues
- Check console logs for runtime errors

---

**You're all set!** The foundation is solid. Build forward with confidence. 🚀
