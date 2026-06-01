export const runtime = 'edge'

import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { surveys, questions } from '@kauri/db/schema'
import { eq } from 'drizzle-orm'
import { createSuccessResponse, createErrorResponse, ApiError } from '@kauri/shared/middleware'

// POST /api/surveys/[id]/questions
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: surveyId } = await params
    const session = await auth()

    if (!session?.tenantId) {
      throw new ApiError(401, 'Unauthorised')
    }

    const survey = await db.query.surveys.findFirst({
      where: eq(surveys.id, surveyId),
    })

    if (!survey || survey.tenantId !== session.tenantId) {
      throw new ApiError(404, 'Survey not found')
    }

    const body = await request.json()

    const [question] = await db
      .insert(questions)
      .values({
        id: body.id || crypto.randomUUID(),
        surveyId,
        kind: body.kind || body.type || 'text',
        text: body.text,
        type: body.type || body.kind || 'text',
        required: body.required ?? true,
        scaleMin: body.scaleMin || null,
        scaleMax: body.scaleMax || null,
        scaleMinLabel: body.scaleMinLabel || null,
        scaleMaxLabel: body.scaleMaxLabel || null,
        choices: body.choices || null,
        choicesJson: body.choices || null,
        logicJson: body.logicJson || null,
        orderIndex: body.orderIndex || 0,
        createdAt: new Date(),
      })
      .returning()

    return createSuccessResponse(question, 201)
  } catch (error) {
    return createErrorResponse(error)
  }
}
