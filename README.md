# Kauri Insight

An agentic, adaptive survey and insight system for SMBs. Built with Next.js, PostgreSQL, Drizzle ORM, and AI-powered analysis.

## Features

- 🔄 **Adaptive Branching** - Surveys that respond to answers in real-time
- 🧠 **AI-Powered Insights** - Automatic analysis with Modelslab API (graceful fallbacks)
- 📊 **Visual Reports** - Export to PDF and PowerPoint with charts
- 🏢 **Multi-Tenant** - Secure tenant isolation with role-based access
- 📱 **Mobile-First** - Responsive design for survey respondents
- 🌏 **NZ English** - Consistent New Zealand spelling throughout

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, TailwindCSS, shadcn/ui, Radix UI
- **Backend**: Next.js API Routes, TanStack Query
- **Database**: PostgreSQL (Railway), Drizzle ORM
- **Auth**: NextAuth.js with email magic links
- **AI**: Modelslab API (Mixtral, Llama, Qwen models)
- **Graphics**: Nano Banana Pro API (with SVG fallbacks)
- **Export**: Playwright PDF, PptxGenJS
- **Charts**: Vega-Lite, Recharts
- **Integrations**: Slack webhooks, Resend email

## Project Structure

```
kauri-insight/
├── apps/
│   └── web/                    # Next.js application
├── packages/
│   ├── db/                     # Drizzle schema & migrations
│   ├── ai/                     # AI provider (Modelslab + mocks)
│   ├── visuals/                # Charts & PDF/PPTX export
│   ├── graphics/               # Nano Banana Pro integration
│   ├── integrations/           # Slack, email
│   ├── domain-packs/           # YAML survey templates
│   └── shared/                 # Shared types & validators
├── scripts/                    # Utility scripts
├── tests/                      # Playwright tests
└── turbo.json                  # Turbo configuration
```

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9+
- PostgreSQL database (local or Railway)

### Local Development

1. **Clone and install dependencies**

```bash
cd kauri-insight
pnpm install
```

2. **Set up environment variables**

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

**Required variables:**

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/kauri_insight

# Auth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here  # Generate with: openssl rand -base64 32
NEXTAUTH_EMAIL_FROM=noreply@example.com
```

**Optional variables (fallbacks work without these):**

```env
# AI
MODELSLAB_API_KEY=your-key-here

# Graphics
NANO_BANANA_API_KEY=your-key-here

# Integrations
SLACK_WEBHOOK_URL=https://hooks.slack.com/...
RESEND_API_KEY=your-key-here

# Email (if using Resend)
SMTP_HOST=smtp.resend.com
SMTP_PORT=587
SMTP_USER=resend
SMTP_PASSWORD=your-resend-api-key
```

3. **Run database migrations**

```bash
pnpm db:migrate
```

4. **Seed demo data**

```bash
pnpm db:seed
```

This creates:
- Demo user: `demo@example.com`
- Demo tenant: "Demo Organisation"
- Sample survey: "Appointment Follow Up"
- Sample responses and insights

5. **Start development server**

```bash
pnpm dev
```

Visit http://localhost:3000

## Database Management

### Generate migrations

After changing schema in `packages/db/src/schema/`:

```bash
pnpm db:generate
```

### Run migrations

```bash
pnpm db:migrate
```

### Seed database

```bash
pnpm db:seed
```

### Generate synthetic responses

```bash
pnpm gen:synthetic
```

### Run insights generation

```bash
pnpm insights:run
```

## Testing

### Run Playwright tests

```bash
pnpm test:e2e
```

### Run type checking

```bash
pnpm type-check
```

### Run linting

```bash
pnpm lint
```

## Deployment

### Railway (PostgreSQL)

1. Create a new Railway project: https://railway.app
2. Add a PostgreSQL service
3. Copy the `DATABASE_URL` from Railway
4. Run migrations:

```bash
DATABASE_URL="your-railway-url" pnpm db:migrate
```

5. Optionally seed data:

```bash
DATABASE_URL="your-railway-url" pnpm db:seed
```

### Vercel (Application)

1. Push code to GitHub
2. Import repository to Vercel: https://vercel.com/new
3. Configure environment variables in Vercel dashboard:

**Required:**
- `DATABASE_URL` - from Railway
- `NEXTAUTH_SECRET` - generate with `openssl rand -base64 32`
- `NEXTAUTH_URL` - your Vercel URL (e.g., https://your-app.vercel.app)
- `NEXTAUTH_EMAIL_FROM` - e.g., noreply@yourapp.com

**Optional (uses fallbacks if not set):**
- `MODELSLAB_API_KEY`
- `NANO_BANANA_API_KEY`
- `SLACK_WEBHOOK_URL`
- `RESEND_API_KEY`
- SMTP settings (if using Resend)

4. Deploy!

## API Routes

### Surveys
- `GET /api/surveys` - List surveys for tenant
- `POST /api/surveys` - Create survey
- `GET /api/surveys/[id]` - Get survey details
- `PATCH /api/surveys/[id]` - Update survey
- `DELETE /api/surveys/[id]` - Delete survey

### Runtime
- `GET /api/runtime/[surveyId]` - Get survey configuration
- `POST /api/responses/[id]/items` - Submit response item
- `POST /api/responses/[id]/complete` - Mark response complete

### Insights & Actions
- `GET /api/surveys/[id]/insights` - List insights
- `POST /api/insights/run` - Generate insights now
- `GET /api/surveys/[id]/actions` - List actions
- `PATCH /api/actions/[id]` - Update action status

### Reports
- `GET /api/reports/[surveyId]` - Get report
- `POST /api/reports/export?format=pdf|pptx` - Export report

### Sources
- `POST /api/sources` - Add website or CSV source
- `POST /api/surveys/[id]/draft-from-sources` - Generate survey draft

### Webhooks
- `POST /api/hooks/alert` - Slack alert webhook

## Architecture Decisions

### 1. Turbo Monorepo
Clean code separation with reusable packages. Each package (`db`, `ai`, `visuals`, etc.) can be consumed by multiple apps.

### 2. Email Magic Links Only
Simplest auth for SMBs. No password management, minimal attack surface. Uses Resend or falls back to console logging.

### 3. Modelslab API Primary
Cost-efficient AI (70-90% cheaper than GPT-4). Graceful fallback to deterministic mocks when API key missing.

### 4. Polling Only (No WebSocket)
Serverless-friendly. React Query handles polling elegantly. 10-30s latency acceptable for dashboard analytics.

### 5. Drizzle ORM
Lightweight, type-safe, SQL-first. Better performance for complex survey analytics queries.

## Graceful Fallbacks

**All external services have fallbacks:**

- **No MODELSLAB_API_KEY** → Uses deterministic mock insights
- **No NANO_BANANA_API_KEY** → Uses SVG placeholders
- **No SLACK_WEBHOOK_URL** → Logs to console
- **No RESEND_API_KEY** → Logs magic links to console

This means the app **works fully without any API keys** for development!

## Domain Packs

Pre-built survey templates in `packages/domain-packs/packs/`:

- **Education** - Post-course feedback
- **Health** - Patient satisfaction
- **Civic** - Community feedback
- **SaaS** - Product satisfaction

Each pack includes:
- Recommended questions
- Adaptive rules (triggers & probes)
- Action templates

Load packs with:

```typescript
import { loadDomainPack } from '@kauri/domain-packs'

const pack = loadDomainPack('education')
```

## Scripts

### Generate synthetic responses

```bash
pnpm gen:synthetic
```

Creates N synthetic survey responses with varied scores and text answers.

### Run insights generation

```bash
pnpm insights:run
```

Generates insights for the demo survey using AI or mock provider.

## Development Tips

### Testing without API keys

The app works fully without any API keys. All services gracefully fall back to console logging or mock data:

```bash
# Just run with DATABASE_URL and auth config
pnpm dev
```

### Testing with Modelslab

Add `MODELSLAB_API_KEY` to your `.env` and restart. The AI provider will automatically switch from mock to real API.

### Inspecting database

Use Drizzle Studio:

```bash
cd packages/db
pnpm studio
```

Opens a web UI at http://localhost:4983

## Troubleshooting

### Build fails with missing dependencies

```bash
pnpm install
```

### Migrations fail

Check `DATABASE_URL` is correct and database is accessible:

```bash
pnpm db:migrate
```

### Type errors

Run type check to see all errors:

```bash
pnpm type-check
```

### Email magic links not working

Check console logs - if `RESEND_API_KEY` is not set, magic links are logged to console.

## Contributing

This is an MVP. Contributions welcome!

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `pnpm test:e2e`
5. Run type check: `pnpm type-check`
6. Submit a pull request

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.

---

Built with ❤️ in New Zealand
