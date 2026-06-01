export const runtime = 'edge'

import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { surveys, responses, insights } from '@kauri/db/schema'
import { eq, desc } from 'drizzle-orm'
import { createSuccessResponse, createErrorResponse, ApiError } from '@kauri/shared/middleware'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.tenantId) {
      throw new ApiError(401, 'Unauthorised')
    }

    const tenantSurveys = await db.query.surveys.findMany({
      where: eq(surveys.tenantId, session.tenantId),
    })

    const activities: any[] = []

    for (const survey of tenantSurveys) {
      // Recent responses
      const recentResponses = await db.query.responses.findMany({
        where: eq(responses.surveyId, survey.id),
        orderBy: (responses: any, { desc }: any) => [desc(responses.createdAt)],
        limit: 3,
      })

      for (const r of recentResponses) {
        activities.push({
          id: r.id,
          type: 'response',
          text: r.status === 'completed' ? 'New response completed' : 'Response started',
          timestamp: r.createdAt,
          surveyName: survey.name,
        })
      }

      // Recent insights
      const recentInsights = await db.query.insights.findMany({
        where: eq(insights.surveyId, survey.id),
        orderBy: (insights: any, { desc }: any) => [desc(insights.createdAt)],
        limit: 2,
      })

      for (const i of recentInsights) {
        activities.push({
          id: i.id,
          type: 'insight',
          text: i.title,
          timestamp: i.createdAt,
          surveyName: survey.name,
        })
      }
    }

    // Sort by timestamp descending and take top 10
    activities.sort(
      (a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )

    return createSuccessResponse(activities.slice(0, 10))
  } catch (error) {
    return createErrorResponse(error)
  }
}
