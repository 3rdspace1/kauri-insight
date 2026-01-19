import { NextResponse } from 'next/server'
import { db } from '@kauri/db/client'
import { responses, responseItems } from '@kauri/db/schema'
import { eq } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Verify response exists
    const response = await db.query.responses.findFirst({
      where: eq(responses.id, params.id),
      with: {
        survey: {
          with: {
            questions: true,
          },
        },
        items: true,
      },
    })

    if (!response) {
      return NextResponse.json(
        { error: 'Response not found' },
        { status: 404 }
      )
    }

    if (response.status === 'completed') {
      return NextResponse.json(
        { error: 'Response is already completed' },
        { status: 400 }
      )
    }

    // Validate all required questions are answered
    const requiredQuestions = response.survey.questions.filter(
      (q) => q.required
    )
    const answeredQuestionIds = response.items.map((item) => item.questionId)

    const missingRequired = requiredQuestions.filter(
      (q) => !answeredQuestionIds.includes(q.id)
    )

    if (missingRequired.length > 0) {
      return NextResponse.json(
        {
          error: 'Missing required questions',
          missingQuestions: missingRequired.map((q) => ({
            id: q.id,
            text: q.text,
          })),
        },
        { status: 400 }
      )
    }

    // Mark as completed
    const [updatedResponse] = await db
      .update(responses)
      .set({
        status: 'completed',
        completedAt: new Date(),
      })
      .where(eq(responses.id, params.id))
      .returning()

    return NextResponse.json({
      success: true,
      response: updatedResponse,
    })
  } catch (error) {
    console.error('Error completing response:', error)
    return NextResponse.json(
      { error: 'Failed to complete response' },
      { status: 500 }
    )
  }
}
