# Kauri Insight

Adaptive survey and insight platform for small and medium businesses, built in New Zealand.

---

## Key Features

- **Adaptive Branching** -- Surveys that adjust their question flow in real time based on respondent answers.
- **AI-Powered Insights** -- Automated analysis via Modelslab API (Mixtral, Llama, Qwen) with deterministic mock fallback when no API key is configured.
- **Visual Reports** -- Interactive charts (Vega-Lite, Recharts) with export to PDF and PowerPoint.
- **Multi-Tenant Architecture** -- Secure tenant isolation with role-based access control for organisations of any size.
- **Mobile-First Design** -- Fully responsive interface optimised for survey respondents on any device.
- **Domain Packs** -- Pre-built YAML survey templates for education, health, civic, and SaaS verticals.

---

## Tech Stack

| Layer          | Technology                                          |
| -------------- | --------------------------------------------------- |
| Frontend       | Next.js 14 (App Router), TypeScript, TailwindCSS, shadcn/ui |
| State          | TanStack Query v5                                   |
| Database       | PostgreSQL with Drizzle ORM                         |
| Auth           | NextAuth.js v4 (magic link emails)                  |
| AI             | Modelslab API (Mixtral, Llama, Qwen) with mock fallback |
| Charts         | Vega-Lite, Recharts                                 |
| Export         | PDF (Playwright), PowerPoint (PptxGenJS)            |
| Monorepo       | Turborepo + pnpm workspaces                         |
| Deployment     | Vercel (application) + Railway (PostgreSQL)         |
| CI             | GitHub Actions                                      |

---

## Prerequisites

| Requirement  | Minimum Version |
| ------------ | --------------- |
| Node.js      | >= 20           |
| pnpm         | >= 9            |
| PostgreSQL   | 15+             |

---

## Getting Started

### 1. Clone and install dependencies

```bash
git clone https://github.com/your-org/kauri-insight.git
cd kauri-insight
pnpm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Open `.env` and set the required values:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/kauri_insight
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=           # generate with: openssl rand -base64 32
NEXTAUTH_EMAIL_FROM=noreply@example.com
```

Optional variables (the application works without these; services fall back to mocks or console logging):

```env
MODELSLAB_API_KEY=         # AI insights; falls back to deterministic mocks
RESEND_API_KEY=            # Transactional email; falls back to console output
SLACK_WEBHOOK_URL=         # Alert notifications; falls back to console output
```

### 3. Run database migrations

```bash
pnpm db:migrate
```

### 4. Seed demo data (optional)

```bash
pnpm db:seed
```

This creates a demo user (`demo@example.com`), a sample organisation, a survey with responses, and generated insights.

### 5. Start the development server

```bash
pnpm dev
```

The application is available at `http://localhost:3000`.

---

## Project Structure

```
kauri-insight/
├── apps/
│   └── web/                    # Next.js application
├── packages/
│   ├── db/                     # Drizzle schema, migrations, seed
│   ├── ai/                     # AI provider (Modelslab + mock fallback)
│   ├── visuals/                # Charts and PDF/PPTX export
│   ├── graphics/               # Image generation integration
│   ├── integrations/           # Slack and email providers
│   ├── domain-packs/           # YAML survey templates by vertical
│   └── shared/                 # Shared types and validators
├── scripts/                    # Utility and data-generation scripts
├── tests/                      # Playwright end-to-end tests
├── turbo.json                  # Turborepo task configuration
├── pnpm-workspace.yaml         # pnpm workspace definition
└── vercel.json                 # Vercel deployment settings
```

---

## Available Scripts

All scripts are run from the repository root.

| Command              | Description                                         |
| -------------------- | --------------------------------------------------- |
| `pnpm dev`           | Start all packages in development mode              |
| `pnpm build`         | Build all packages for production                   |
| `pnpm lint`          | Run linting across all packages                     |
| `pnpm type-check`    | Run TypeScript type checking across all packages    |
| `pnpm clean`         | Remove build artefacts and node_modules             |
| `pnpm db:generate`   | Generate Drizzle migrations from schema changes     |
| `pnpm db:migrate`    | Apply pending database migrations                   |
| `pnpm db:seed`       | Seed the database with demo data                    |
| `pnpm gen:synthetic` | Generate synthetic survey responses                 |
| `pnpm insights:run`  | Run AI insight generation for existing responses    |
| `pnpm test`          | Run unit tests (Vitest)                             |
| `pnpm test:watch`    | Run unit tests in watch mode                        |
| `pnpm test:e2e`      | Run Playwright end-to-end tests                     |

---

## Deployment

### Database -- Railway

1. Create a project at [railway.app](https://railway.app) and add a PostgreSQL service.
2. Copy the `DATABASE_URL` connection string from the Railway dashboard.
3. Run migrations against the production database:

```bash
DATABASE_URL="your-railway-url" pnpm db:migrate
```

### Application -- Vercel

1. Push the repository to GitHub.
2. Import the repository at [vercel.com/new](https://vercel.com/new).
3. Set the following environment variables in the Vercel dashboard:
   - `DATABASE_URL` -- from Railway
   - `NEXTAUTH_SECRET` -- generate with `openssl rand -base64 32`
   - `NEXTAUTH_URL` -- your production URL (e.g., `https://kauri-insight.vercel.app`)
   - `NEXTAUTH_EMAIL_FROM` -- sender address for magic link emails
   - `MODELSLAB_API_KEY` -- (optional) for AI-powered insights
   - `RESEND_API_KEY` -- (optional) for transactional email delivery
4. Deploy. Vercel will automatically detect the Turborepo configuration and build the `apps/web` application.

---

## Licence

This project is released under the [MIT Licence](./LICENCE).

---

Built in New Zealand.
