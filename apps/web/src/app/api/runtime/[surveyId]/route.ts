export const runtime = 'edge'

import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { surveys, questions } from '@kauri/db/schema'
import { eq } from 'drizzle-orm'
import { createSuccessResponse, createErrorResponse, ApiError } from '@kauri/shared/middleware'

// GET /api/runtime/[surveyId] - Public endpoint for survey respondents
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ surveyId: string }> }
) {
  try {
    const { surveyId } = await params

    const survey = await db.query.surveys.findFirst({
      where: eq(surveys.id, surveyId),
      with: {
        questions: {
          orderBy: (questions: any, { asc }: any) => [asc(questions.orderIndex)],
        },
      },
    })

    if (!survey) {
      throw new ApiError(404, 'Survey not found')
    }

    if (survey.status !== 'active') {
      throw new ApiError(400, 'This survey is not currently accepting responses')
    }

    return createSuccessResponse({
      id: survey.id,
      title: survey.title || survey.name,
      description: survey.description,
      questions: survey.questions.map((q: any) => ({
        id: q.id,
        text: q.text,
        type: q.type || q.kind,
        required: q.required,
        scaleMin: q.scaleMin,
        scaleMax: q.scaleMax,
        scaleMinLabel: q.scaleMinLabel,
        scaleMaxLabel: q.scaleMaxLabel,
        choices: q.choices || q.choicesJson,
        orderIndex: q.orderIndex,
        logicJson: q.logicJson,
      })),
    })
  } catch (error) {
    return createErrorResponse(error)
  }
}
