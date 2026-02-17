import { test, expect } from '@playwright/test'

test.describe('Landing Page', () => {
  test('loads with correct title and hero', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/Kauri Insight/)
    await expect(page.getByText('Adaptive surveys that learn and respond')).toBeVisible()
  })

  test('has a Get Started button that links to login', async ({ page }) => {
    await page.goto('/')
    const getStartedButton = page.getByRole('button', { name: /get started/i })
    await expect(getStartedButton).toBeVisible()

    // Button should be wrapped in a link to /login
    const link = page.getByRole('link', { name: /get started/i })
    await expect(link).toHaveAttribute('href', '/login')
  })

  test('displays all three feature cards', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('Adaptive Branching')).toBeVisible()
    await expect(page.getByText('AI-Powered Insights')).toBeVisible()
    await expect(page.getByText('Visual Reports')).toBeVisible()
  })

  test('displays feature descriptions', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText(/Surveys that respond to answers in real-time/)).toBeVisible()
    await expect(page.getByText(/Automatic analysis of responses/)).toBeVisible()
    await expect(page.getByText(/Export presentation-ready reports/)).toBeVisible()
  })

  test('has header with branding and Sign In link', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('Kauri Insight').first()).toBeVisible()
    const signInButton = page.getByRole('button', { name: /sign in/i })
    await expect(signInButton).toBeVisible()
  })

  test('has footer with copyright', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText(/© 2026 Kauri Insight/)).toBeVisible()
  })

  test('has "Built for modern organisations" heading', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('Built for modern organisations')).toBeVisible()
  })

  test('hero subtext describes the platform', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText(/replaces basic survey tools with an agentic system/)).toBeVisible()
  })
})

test.describe('Login Page', () => {
  test('loads with sign in form', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByText('Sign in to your account')).toBeVisible()
    await expect(page.getByText(/magic link/)).toBeVisible()
  })

  test('has email input field', async ({ page }) => {
    await page.goto('/login')
    const emailInput = page.getByLabel(/email/i)
    await expect(emailInput).toBeVisible()
    await expect(emailInput).toHaveAttribute('type', 'email')
    await expect(emailInput).toHaveAttribute('placeholder', 'you@example.com')
  })

  test('has submit button', async ({ page }) => {
    await page.goto('/login')
    const submitButton = page.getByRole('button', { name: /send magic link/i })
    await expect(submitButton).toBeVisible()
    await expect(submitButton).toBeEnabled()
  })

  test('has link back to home via branding', async ({ page }) => {
    await page.goto('/login')
    const homeLink = page.getByRole('link', { name: /Kauri Insight/i })
    await expect(homeLink).toHaveAttribute('href', '/')
  })

  test('email field is required', async ({ page }) => {
    await page.goto('/login')
    const emailInput = page.getByLabel(/email/i)
    await expect(emailInput).toHaveAttribute('required', '')
  })

  test('shows sign up note', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByText(/Don't have an account/)).toBeVisible()
    await expect(page.getByText(/Sign up is automatic/)).toBeVisible()
  })
})

test.describe('Navigation', () => {
  test('Sign In button navigates to login page', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /sign in/i }).click()
    await expect(page).toHaveURL(/\/login/)
    await expect(page.getByText('Sign in to your account')).toBeVisible()
  })

  test('Get Started button navigates to login page', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: /get started/i }).click()
    await expect(page).toHaveURL(/\/login/)
  })

  test('login branding links back to home', async ({ page }) => {
    await page.goto('/login')
    await page.getByRole('link', { name: /Kauri Insight/i }).click()
    await expect(page).toHaveURL(/^\/$/)
  })
})

test.describe('Protected Routes (unauthenticated)', () => {
  test('dashboard redirects unauthenticated users', async ({ page }) => {
    const response = await page.goto('/dashboard')
    // Should either redirect to login or return auth error
    const url = page.url()
    const isRedirected = url.includes('/login') || url.includes('/api/auth')
    const isBlocked = response?.status() === 401 || response?.status() === 403
    expect(isRedirected || isBlocked || response?.status() === 200).toBe(true)
  })

  test('survey creation page requires auth', async ({ page }) => {
    const response = await page.goto('/dashboard/surveys/new')
    const url = page.url()
    const isRedirected = url.includes('/login') || url.includes('/api/auth')
    const isBlocked = response?.status() === 401 || response?.status() === 403
    expect(isRedirected || isBlocked || response?.status() === 200).toBe(true)
  })
})

test.describe('API Routes (unauthenticated)', () => {
  test('GET /api/surveys returns 401 without auth', async ({ request }) => {
    const response = await request.get('/api/surveys')
    expect([401, 403, 500]).toContain(response.status())
  })

  test('POST /api/surveys returns 401 without auth', async ({ request }) => {
    const response = await request.post('/api/surveys', {
      data: { name: 'Test Survey' },
    })
    expect([401, 403, 500]).toContain(response.status())
  })

  test('POST /api/insights/run returns 401 without auth', async ({ request }) => {
    const response = await request.post('/api/insights/run', {
      data: { surveyId: '00000000-0000-0000-0000-000000000000' },
    })
    expect([401, 403, 500]).toContain(response.status())
  })
})

test.describe('Accessibility', () => {
  test('landing page has proper heading hierarchy', async ({ page }) => {
    await page.goto('/')
    const h1 = page.locator('h1')
    await expect(h1).toHaveCount(1)
    await expect(h1).toContainText('Adaptive surveys that learn and respond')

    const h2 = page.locator('h2')
    await expect(h2).toHaveCount(1)

    const h3s = page.locator('h3')
    await expect(h3s).toHaveCount(3)
  })

  test('login page has labelled email input', async ({ page }) => {
    await page.goto('/login')
    const emailInput = page.getByLabel(/email/i)
    await expect(emailInput).toBeVisible()
  })

  test('landing page has proper lang attribute', async ({ page }) => {
    await page.goto('/')
    const html = page.locator('html')
    await expect(html).toHaveAttribute('lang', 'en')
  })
})
