# 🚀 Kauri Insight - MVP Completion Roadmap

**Current Status**: 55% Complete | **Target**: Fully Functional MVP
**Estimated Time**: 36-48 hours | **Priority**: Ship-ready product

---

## 📊 BRUTAL HONESTY ASSESSMENT

### What We Actually Have
✅ **Database**: 95% - Schema complete, migrations work, seed data exists
✅ **Auth System**: 70% - Login works, session management solid
✅ **Dashboard Views**: 80% - Can VIEW surveys, insights, responses
✅ **AI Integration**: 60% - Mock provider works, Modelslab integrated
✅ **Packages**: 100% - All core packages built and typed

### What's Critically Missing
❌ **Survey Response Submission**: 0% - Users CANNOT take surveys
❌ **Survey Creation UI**: 0% - No way to build surveys in UI
❌ **Form Components**: 20% - Can't build forms without these
❌ **API CRUD Operations**: 40% - Missing update/delete/get-by-id
❌ **Error Handling**: 10% - App crashes on any error
❌ **Export Features**: 30% - Code exists but not wired up

### Critical Issue
**The app is a "read-only dashboard"**. Users can VIEW data but cannot:
- Create surveys (UI doesn't exist)
- Take surveys (no public survey page)
- Edit surveys (no edit interface)
- Delete surveys (button doesn't work)
- Export reports (not wired up)

---

## 🎯 MVP DEFINITION

### Core User Journey That MUST Work
1. ✅ User signs in with email magic link
2. ❌ User creates a survey with 3-5 questions
3. ❌ User shares survey link
4. ❌ Respondent completes survey
5. ✅ User views responses in dashboard
6. ⚠️ User generates insights (button exists but doesn't work)
7. ❌ User exports report to PDF

**Current Reality**: Steps 2, 3, 4, 7 are completely broken. Step 6 button is cosmetic.

---

## 🔥 PRIORITY EXECUTION PLAN

### PHASE 1: CRITICAL - Make It Functional (16-20 hours)

#### Task 1.1: Survey Response Submission Page (6-8 hours)
**Why Critical**: Without this, NO ONE can take surveys. The entire product is pointless.

**Files to Create**:
```
apps/web/src/app/runtime/[surveyId]/page.tsx
apps/web/src/components/runtime/QuestionCard.tsx
apps/web/src/components/runtime/ResponseProgress.tsx
apps/web/src/app/api/responses/route.ts
apps/web/src/app/api/responses/[id]/items/route.ts
apps/web/src/app/api/responses/[id]/complete/route.ts
```

**Implementation Steps**:
1. Create `/runtime/[surveyId]` page (public, no auth)
2. Fetch survey config from database
3. Create profile (email + consent capture)
4. Render questions one-by-one with:
   - Scale questions (1-10 slider)
   - Text questions (textarea)
   - Choice questions (radio buttons)
5. POST to `/api/responses` to create response record
6. POST to `/api/responses/[id]/items` for each answer
7. POST to `/api/responses/[id]/complete` when done
8. Show thank you page

**Validation**:
- Required questions block progression
- Email validation
- Scale ranges enforced
- Text length limits

**Success Criteria**:
- User can open survey link
- User can answer all questions
- Responses save to database
- Thank you page shows

---

#### Task 1.2: Wire Up Existing Buttons (3-4 hours)
**Why Critical**: Buttons exist but do nothing. This is worse than missing features.

**Files to Fix**:
```
apps/web/src/app/dashboard/surveys/[id]/insights/page.tsx - Generate Insights button
apps/web/src/app/dashboard/surveys/page.tsx - Create Survey button
```

**Changes Needed**:

**Generate Insights Button**:
```typescript
// Current (does nothing):
<Button>
  <Sparkles className="mr-2 h-4 w-4" />
  Generate Insights
</Button>

// Fix:
'use client'
import { useMutation } from '@tanstack/react-query'

const generateInsights = useMutation({
  mutationFn: async () => {
    const res = await fetch('/api/insights/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ surveyId: params.id })
    })
    if (!res.ok) throw new Error('Failed to generate insights')
    return res.json()
  },
  onSuccess: () => {
    toast({ title: 'Insights generated successfully!' })
    router.refresh()
  },
  onError: (error) => {
    toast({ title: 'Error', description: error.message, variant: 'destructive' })
  }
})

<Button onClick={() => generateInsights.mutate()} disabled={generateInsights.isPending}>
  {generateInsights.isPending ? (
    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
  ) : (
    <Sparkles className="mr-2 h-4 w-4" />
  )}
  {generateInsights.isPending ? 'Generating...' : 'Generate Insights'}
</Button>
```

**Create Survey Button**:
- Link to `/dashboard/surveys/new` (to be built in Phase 2)
- For now, show toast: "Survey builder coming soon"

**Success Criteria**:
- Generate Insights button calls API and shows result
- Buttons show loading states
- Error messages display on failure

---

#### Task 1.3: Add Essential Form Components (4-6 hours)
**Why Critical**: Cannot build forms without these. Blocks all creation/edit features.

**Components to Add** (copy from shadcn.com):
```
apps/web/src/components/ui/form.tsx
apps/web/src/components/ui/textarea.tsx
apps/web/src/components/ui/select.tsx
apps/web/src/components/ui/checkbox.tsx
apps/web/src/components/ui/dialog.tsx
apps/web/src/components/ui/separator.tsx
apps/web/src/components/ui/skeleton.tsx
apps/web/src/components/ui/alert.tsx
```

**Installation Commands**:
```bash
cd apps/web
npx shadcn@latest add form
npx shadcn@latest add textarea
npx shadcn@latest add select
npx shadcn@latest add checkbox
npx shadcn@latest add dialog
npx shadcn@latest add separator
npx shadcn@latest add skeleton
npx shadcn@latest add alert
```

**Success Criteria**:
- All components render correctly
- Form validation works
- Type-safe with TypeScript

---

#### Task 1.4: Complete Core API Routes (3-4 hours)
**Why Critical**: Dashboard buttons call these but they don't exist.

**Routes to Create**:
```
apps/web/src/app/api/surveys/[id]/route.ts - GET, PATCH, DELETE
apps/web/src/app/api/surveys/[id]/questions/route.ts - POST, PATCH, DELETE
apps/web/src/app/api/runtime/[surveyId]/route.ts - GET survey config
```

**Implementation Pattern**:
```typescript
// /api/surveys/[id]/route.ts
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@kauri/db/client'
import { surveys } from '@kauri/db/schema'
import { eq, and } from 'drizzle-orm'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.tenantId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const survey = await db.query.surveys.findFirst({
    where: and(
      eq(surveys.id, params.id),
      eq(surveys.tenantId, session.tenantId)
    ),
    with: {
      questions: {
        with: {
          rules: true
        }
      }
    }
  })

  if (!survey) {
    return Response.json({ error: 'Survey not found' }, { status: 404 })
  }

  return Response.json(survey)
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.tenantId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await db.delete(surveys).where(
    and(
      eq(surveys.id, params.id),
      eq(surveys.tenantId, session.tenantId)
    )
  )

  return Response.json({ success: true })
}
```

**Success Criteria**:
- All CRUD operations work
- Tenant isolation enforced
- Errors return proper status codes

---

### PHASE 2: HIGH PRIORITY - Make It Usable (12-16 hours)

#### Task 2.1: Survey Builder UI (8-10 hours)
**Why Important**: Users need to create surveys in the UI, not via SQL.

**Files to Create**:
```
apps/web/src/app/dashboard/surveys/new/page.tsx
apps/web/src/components/surveys/SurveyForm.tsx
apps/web/src/components/surveys/QuestionBuilder.tsx
apps/web/src/components/surveys/RuleBuilder.tsx
```

**Features**:
1. Survey metadata form:
   - Title, description
   - Status (draft/active/closed)

2. Question builder:
   - Add/remove questions
   - Set question type (scale/text/choice)
   - Configure scale ranges (1-5, 1-10, etc.)
   - Set required/optional

3. Rule builder (Phase 3, skip for now):
   - Define branching conditions
   - Set trigger thresholds

**Implementation**:
```typescript
// Simplified first version
'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const surveySchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().max(1000).optional(),
  questions: z.array(z.object({
    text: z.string().min(3),
    type: z.enum(['scale', 'text', 'choice']),
    required: z.boolean().default(true),
    scaleMin: z.number().optional(),
    scaleMax: z.number().optional(),
    choices: z.array(z.string()).optional()
  })).min(1)
})

export default function NewSurveyPage() {
  const form = useForm({
    resolver: zodResolver(surveySchema),
    defaultValues: {
      questions: [{ text: '', type: 'scale', required: true }]
    }
  })

  const onSubmit = async (data) => {
    // POST to /api/surveys
    // Then POST each question to /api/surveys/[id]/questions
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* Survey form fields */}
      </form>
    </Form>
  )
}
```

**Success Criteria**:
- Can create survey with 1-10 questions
- Can set question types
- Survey saves to database
- Redirects to survey detail page

---

#### Task 2.2: Error Boundaries & Loading States (4-6 hours)
**Why Important**: App crashes on any error. Users see blank pages during loading.

**Files to Create**:
```
apps/web/src/components/ErrorBoundary.tsx
apps/web/src/components/LoadingScreen.tsx
apps/web/src/components/LoadingSkeleton.tsx
apps/web/src/app/error.tsx
apps/web/src/app/dashboard/error.tsx
apps/web/src/app/dashboard/surveys/[id]/error.tsx
```

**Implementation**:
```typescript
// apps/web/src/app/error.tsx
'use client'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
        <h2 className="mt-4 text-lg font-semibold">Something went wrong!</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {error.message || 'An unexpected error occurred'}
        </p>
        <Button onClick={reset} className="mt-4">
          Try again
        </Button>
      </div>
    </div>
  )
}
```

**Add Loading States**:
```typescript
// Wrap async operations with Suspense
import { Suspense } from 'react'
import LoadingSkeleton from '@/components/LoadingSkeleton'

export default function SurveysPage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <SurveysList />
    </Suspense>
  )
}
```

**Success Criteria**:
- Errors show user-friendly message
- Can retry failed operations
- Loading states show during data fetching

---

### PHASE 3: MEDIUM PRIORITY - Make It Complete (8-12 hours)

#### Task 3.1: Report Export (4-6 hours)
**Why Important**: Users want to download/share insights.

**Files to Create**:
```
apps/web/src/app/api/reports/[surveyId]/route.ts
apps/web/src/app/api/reports/[surveyId]/export/route.ts
apps/web/src/app/dashboard/surveys/[id]/reports/page.tsx
```

**Implementation**:
```typescript
// /api/reports/[surveyId]/export/route.ts
import { getServerSession } from 'next-auth'
import { generatePDF } from '@kauri/visuals/export/pdf'
import { generatePPTX } from '@kauri/visuals/export/pptx'

export async function POST(
  request: Request,
  { params }: { params: { surveyId: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.tenantId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { format } = await request.json() // 'pdf' or 'pptx'

  // Fetch survey + responses + insights
  const survey = await db.query.surveys.findFirst({...})
  const insights = await db.query.insights.findMany({...})

  let buffer
  if (format === 'pdf') {
    buffer = await generatePDF({ survey, insights })
  } else {
    buffer = await generatePPTX({ survey, insights })
  }

  return new Response(buffer, {
    headers: {
      'Content-Type': format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'Content-Disposition': `attachment; filename="report-${survey.title}.${format}"`
    }
  })
}
```

**UI Button**:
```typescript
<Button onClick={async () => {
  const res = await fetch(`/api/reports/${surveyId}/export`, {
    method: 'POST',
    body: JSON.stringify({ format: 'pdf' })
  })
  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `report-${surveyId}.pdf`
  a.click()
}}>
  <Download className="mr-2 h-4 w-4" />
  Export PDF
</Button>
```

**Success Criteria**:
- PDF export generates and downloads
- PPTX export generates and downloads
- Reports include survey data + insights
- Charts render correctly

---

#### Task 3.2: Delete Survey Functionality (2-3 hours)
**Why Important**: Users need to clean up surveys.

**Files to Modify**:
```
apps/web/src/app/dashboard/surveys/[id]/page.tsx
```

**Implementation**:
```typescript
'use client'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

function DeleteSurveyDialog({ surveyId }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  const handleDelete = async () => {
    const res = await fetch(`/api/surveys/${surveyId}`, {
      method: 'DELETE'
    })
    if (res.ok) {
      toast({ title: 'Survey deleted successfully' })
      router.push('/dashboard/surveys')
    } else {
      toast({ title: 'Error deleting survey', variant: 'destructive' })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive">
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Survey
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you sure?</DialogTitle>
        </DialogHeader>
        <p>This will permanently delete the survey and all responses.</p>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="destructive" onClick={handleDelete}>Delete</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

**Success Criteria**:
- Confirmation dialog shows
- Delete removes survey from database
- Cascading deletes remove questions, responses, insights
- Redirects to surveys list

---

#### Task 3.3: Survey Sharing & Public Links (2-3 hours)
**Why Important**: Users need to share surveys with respondents.

**Files to Modify**:
```
apps/web/src/app/dashboard/surveys/[id]/page.tsx
```

**Implementation**:
```typescript
function ShareSurveyButton({ surveyId }) {
  const surveyLink = `${window.location.origin}/runtime/${surveyId}`

  const copyToClipboard = () => {
    navigator.clipboard.writeText(surveyLink)
    toast({ title: 'Link copied to clipboard!' })
  }

  return (
    <div className="flex gap-2">
      <Input value={surveyLink} readOnly />
      <Button onClick={copyToClipboard}>
        <Copy className="mr-2 h-4 w-4" />
        Copy Link
      </Button>
    </div>
  )
}
```

**Success Criteria**:
- Survey link displays prominently
- Copy button works
- Link goes to functional survey page

---

### PHASE 4: POLISH - Make It Production-Ready (6-10 hours)

#### Task 4.1: Pagination & Performance (3-4 hours)

**Add Pagination to Surveys List**:
```typescript
// /api/surveys/route.ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const offset = (page - 1) * limit

  const surveys = await db.query.surveys.findMany({
    where: eq(surveys.tenantId, session.tenantId),
    limit,
    offset,
    orderBy: desc(surveys.createdAt)
  })

  const total = await db.select({ count: sql<number>`count(*)` })
    .from(surveys)
    .where(eq(surveys.tenantId, session.tenantId))

  return Response.json({
    surveys,
    pagination: {
      page,
      limit,
      total: total[0].count,
      pages: Math.ceil(total[0].count / limit)
    }
  })
}
```

**Success Criteria**:
- Dashboard loads quickly even with 100+ surveys
- Pagination controls work
- Can navigate between pages

---

#### Task 4.2: Input Validation & Sanitization (2-3 hours)

**Add Server-Side Validation**:
```typescript
// Use existing Zod schemas from @kauri/shared
import { createSurveySchema } from '@kauri/shared/validators'

export async function POST(request: Request) {
  const body = await request.json()

  // Validate with Zod
  const validation = createSurveySchema.safeParse(body)
  if (!validation.success) {
    return Response.json({
      error: 'Validation failed',
      details: validation.error.errors
    }, { status: 400 })
  }

  // Sanitize HTML in text fields
  const sanitizedData = {
    ...validation.data,
    title: DOMPurify.sanitize(validation.data.title),
    description: DOMPurify.sanitize(validation.data.description)
  }

  // Proceed with insert
}
```

**Success Criteria**:
- Invalid input returns clear error messages
- XSS attempts are sanitized
- SQL injection prevented by Drizzle parameterization

---

#### Task 4.3: Rate Limiting (1-2 hours)

**Add Rate Limiting Middleware**:
```typescript
// apps/web/src/middleware.ts
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 m'), // 10 requests per minute
})

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/api')) {
    const ip = request.ip ?? '127.0.0.1'
    const { success } = await ratelimit.limit(ip)

    if (!success) {
      return Response.json(
        { error: 'Too many requests' },
        { status: 429 }
      )
    }
  }

  return NextResponse.next()
}
```

**Success Criteria**:
- API rate limiting prevents abuse
- Users get clear error on rate limit
- Legitimate usage not blocked

---

### PHASE 5: OPTIONAL ENHANCEMENTS (Post-MVP)

These can be added after launch:

1. **Adaptive Branching Logic** - Complex rule evaluation
2. **Domain Packs** - YAML template system
3. **Team Management** - Invite users, manage roles
4. **Advanced Analytics** - Custom date ranges, filtering
5. **Webhook Integrations** - Zapier, Slack advanced features
6. **Custom Branding** - White-label surveys
7. **Scheduled Reports** - Automatic PDF generation
8. **Response Notifications** - Email on new response

---

## 🛠️ DEVELOPMENT WORKFLOW

### Daily Execution Plan

**Day 1 (8 hours)**:
- Morning: Task 1.1 - Survey response page (4 hours)
- Afternoon: Task 1.2 - Wire up buttons (2 hours)
- Evening: Task 1.3 - Start adding form components (2 hours)

**Day 2 (8 hours)**:
- Morning: Task 1.3 - Finish form components (2 hours)
- Mid-morning: Task 1.4 - Core API routes (3 hours)
- Afternoon: Task 2.1 - Start survey builder (3 hours)

**Day 3 (8 hours)**:
- Morning: Task 2.1 - Finish survey builder (5 hours)
- Afternoon: Task 2.2 - Error boundaries (3 hours)

**Day 4 (8 hours)**:
- Morning: Task 3.1 - Report export (4 hours)
- Afternoon: Task 3.2 - Delete functionality (2 hours)
- Evening: Task 3.3 - Survey sharing (2 hours)

**Day 5 (8 hours)**:
- Morning: Task 4.1 - Pagination (3 hours)
- Afternoon: Task 4.2 - Validation (2 hours)
- Evening: Task 4.3 - Rate limiting (1 hour)
- Final: Testing & bug fixes (2 hours)

---

## ✅ TESTING CHECKLIST

After each phase, verify:

### Phase 1 Tests:
- [ ] Can complete survey from `/runtime/[surveyId]`
- [ ] Responses save to database
- [ ] Generate Insights button works
- [ ] Loading states show during operations
- [ ] Form components render correctly

### Phase 2 Tests:
- [ ] Can create survey with 3 questions
- [ ] Survey appears in dashboard
- [ ] Can view survey detail
- [ ] Error pages show on failures

### Phase 3 Tests:
- [ ] Can export PDF report
- [ ] Can export PPTX report
- [ ] Can delete survey
- [ ] Can copy survey link
- [ ] Survey link opens functional page

### Phase 4 Tests:
- [ ] Pagination works with 50+ surveys
- [ ] Invalid input shows validation errors
- [ ] Rate limiting prevents abuse

---

## 🚀 DEPLOYMENT PLAN

### Pre-Deployment Checklist:
- [ ] All environment variables set in Vercel
- [ ] Railway database has latest migrations
- [ ] All TypeScript errors resolved
- [ ] Build succeeds locally
- [ ] Critical user journeys tested

### Deployment Steps:
1. Run final build: `pnpm build`
2. Fix any build errors
3. Commit changes: `git add . && git commit -m "MVP completion"`
4. Push to GitHub: `git push origin main`
5. Vercel auto-deploys
6. Run migrations on Railway: `DATABASE_URL=xxx pnpm db:migrate`
7. Test on production URL

---

## 🔧 TROUBLESHOOTING GUIDE

### Common Issues:

**"Button doesn't work"**
- Check: Is it wrapped in `'use client'`?
- Check: Does onClick call the API?
- Check: Is loading state shown?

**"API returns 401"**
- Check: Is session valid?
- Check: Is tenantId in session?
- Check: Is auth middleware applied?

**"Database query fails"**
- Check: Are migrations applied?
- Check: Does tenant isolation filter exist?
- Check: Are relations loaded correctly?

**"Form validation doesn't work"**
- Check: Is Zod schema correct?
- Check: Is react-hook-form configured?
- Check: Are error messages displayed?

---

## 📈 SUCCESS METRICS

### MVP Launch Criteria:
✅ User can create account
✅ User can create survey with 3-5 questions
✅ User can share survey link
✅ Respondent can complete survey
✅ User can view responses
✅ User can generate insights
✅ User can export report
✅ No critical bugs in happy path

### Performance Targets:
- Page load: < 2 seconds
- API response: < 500ms
- Survey submission: < 1 second
- Report generation: < 5 seconds

---

## 🎯 FINAL NOTES

**This is achievable in 36-48 focused hours.**

**Order matters** - Don't skip Phase 1. You cannot ship without survey response submission.

**Test as you go** - Don't wait until the end to test. Each task should be verified before moving on.

**Use existing patterns** - All the code patterns exist. Copy, adapt, repeat.

**Ship iteratively** - After Phase 1, you have a barely-viable product. After Phase 2, it's actually usable. After Phase 3, it's complete.

**Ask for help** - If stuck for more than 30 minutes, ask for code review or debugging help.

---

**Let's build this thing. 🚀**

**Next Step**: Start with Task 1.1 - Survey Response Submission Page.
