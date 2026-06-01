export const runtime = 'edge'

import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { surveys, insights } from '@kauri/db/schema'
import { eq } from 'drizzle-orm'
import { createSuccessResponse, createErrorResponse, ApiError } from '@kauri/shared/middleware'

// POST /api/surveys/[id]/reports - Generate a report
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth()

    if (!session?.tenantId) {
      throw new ApiError(401, 'Unauthorised')
    }

    const survey = await db.query.surveys.findFirst({
      where: eq(surveys.id, id),
    })

    if (!survey || survey.tenantId !== session.tenantId) {
      throw new ApiError(404, 'Survey not found')
    }

    const surveyInsights = await db.query.insights.findMany({
      where: eq(insights.surveyId, id),
    })

    // Create a report object (in production, this would generate PDF/PPTX)
    const report = {
      id: crypto.randomUUID(),
      surveyId: id,
      surveyName: survey.name,
      insights: surveyInsights,
      generatedAt: new Date().toISOString(),
    }

    return createSuccessResponse({ report }, 201)
  } catch (error) {
    return createErrorResponse(error)
  }
}
