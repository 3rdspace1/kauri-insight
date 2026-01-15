import { test, expect } from '@playwright/test'

test.describe('Kauri Insight - Smoke Tests', () => {
  test('landing page loads', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/Kauri Insight/)
    await expect(page.getByText('Adaptive surveys that learn and respond')).toBeVisible()
  })

  test('landing page has get started button', async ({ page }) => {
    await page.goto('/')
    const getStartedButton = page.getByRole('button', { name: /get started/i })
    await expect(getStartedButton).toBeVisible()
  })

  test('features section displays correctly', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('Adaptive Branching')).toBeVisible()
    await expect(page.getByText('AI-Powered Insights')).toBeVisible()
    await expect(page.getByText('Visual Reports')).toBeVisible()
  })

  // TODO: Add more tests when dashboard and runtime are implemented
  // - Dashboard loads after auth
  // - Survey list displays
  // - Runtime survey accepts responses
  // - Actions status updates
})
