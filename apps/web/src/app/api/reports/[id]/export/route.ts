export const runtime = 'edge'

import { createSuccessResponse, createErrorResponse } from '@kauri/shared/middleware'

// GET /api/reports/[id]/export - Export report as PDF/PPTX
export async function GET() {
  try {
    // In production, this would generate a PDF/PPTX file from report data
    // For now, return a simple text response
    return new Response('Report export coming soon', {
      headers: {
        'Content-Type': 'text/plain',
      },
    })
  } catch (error) {
    return createErrorResponse(error)
  }
}
