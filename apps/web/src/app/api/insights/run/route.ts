import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@kauri/db/client'
import { surveys, responses, responseItems, questions, insights as insightsTable } from '@kauri/db/schema'
import { generateSurveyInsights } from '@kauri/ai/insights'
import { createSuccessResponse, createErrorResponse, ApiError } from '@kauri/shared/middleware'
import { eq } from 'drizzle-orm'
import type { InsightPayload } from '@kauri/shared/types'

// POST /api/insights/run?surveyId=xxx
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || !session.tenantId) {
      throw new ApiError(401, 'Unauthorised')
    }

    const searchParams = request.nextUrl.searchParams
    const surveyId = searchParams.get('surveyId')

    if (!surveyId) {
      throw new ApiError(400, 'surveyId is required')
    }

    // Verify survey belongs to tenant
    const survey = await db.query.surveys.findFirst({
      where: eq(surveys.id, surveyId),
    })

    if (!survey || survey.tenantId !== session.tenantId) {
      throw new ApiError(404, 'Survey not found')
    }

    // Fetch all responses with items
    const surveyResponses = await db.query.responses.findMany({
      where: eq(responses.surveyId, surveyId),
      with: {
        items: {
          with: {
            question: true,
          },
        },
      },
    })

    if (surveyResponses.length === 0) {
      throw new ApiError(400, 'No responses to analyse')
    }

    // Prepare payload for AI
    const payload: InsightPayload = {
      surveyId,
      responses: surveyResponses.map((r) => ({
        id: r.id,
        items: r.items.map((item) => ({
          questionId: item.questionId,
          questionText: item.question.text,
          valueText: item.valueText || undefined,
          valueNum: item.valueNum || undefined,
          valueChoice: item.valueChoice || undefined,
        })),
      })),
    }

    // Generate insights using AI
    const result = await generateSurveyInsights(payload)

    // Save insights to database
    const savedInsights = []
    for (const insight of result.insights) {
      const [saved] = await db
        .insert(insightsTable)
        .values({
          surveyId,
          title: insight.title,
          summary: insight.summary,
          sentiment: insight.sentiment,
          evidenceJson: insight.evidence,
        })
        .returning()

      savedInsights.push(saved)
    }

    return createSuccessResponse({
      analysis: result.analysis,
      insights: savedInsights,
    })
  } catch (error) {
    return createErrorResponse(error)
  }
}
