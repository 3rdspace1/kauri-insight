export const runtime = 'edge'

import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { surveys, responses, insights } from '@kauri/db/schema'
import { eq, count } from 'drizzle-orm'
import { createSuccessResponse, createErrorResponse, ApiError } from '@kauri/shared/middleware'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.tenantId) {
      throw new ApiError(401, 'Unauthorised')
    }

    const surveyCount = await db
      .select({ count: count() })
      .from(surveys)
      .where(eq(surveys.tenantId, session.tenantId))
      .then((r: any) => r[0]?.count || 0)

    const tenantSurveys = await db.query.surveys.findMany({
      where: eq(surveys.tenantId, session.tenantId),
      columns: { id: true },
    })
    const surveyIds = tenantSurveys.map((s: any) => s.id)

    let totalResponses = 0
    if (surveyIds.length > 0) {
      const responseCounts = await Promise.all(
        surveyIds.map((sid: string) =>
          db
            .select({ count: count() })
            .from(responses)
            .where(eq(responses.surveyId, sid))
        )
      )
      totalResponses = responseCounts.reduce((sum: number, r: any) => sum + (r[0]?.count || 0), 0)
    }

    let insightsCount = 0
    if (surveyIds.length > 0) {
      const insightCounts = await Promise.all(
        surveyIds.map((sid: string) =>
          db
            .select({ count: count() })
            .from(insights)
            .where(eq(insights.surveyId, sid))
        )
      )
      insightsCount = insightCounts.reduce((sum: number, r: any) => sum + (r[0]?.count || 0), 0)
    }

    return createSuccessResponse({ surveyCount, totalResponses, insightsCount })
  } catch (error) {
    return createErrorResponse(error)
  }
}
