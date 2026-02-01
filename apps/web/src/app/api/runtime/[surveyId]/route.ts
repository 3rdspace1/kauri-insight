import { NextResponse } from 'next/server'
import { db } from '@kauri/db/client'
import { surveys } from '@kauri/db/schema'
import { eq } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  { params }: { params: { surveyId: string } }
) {
  try {
    // Public endpoint - no auth required
    const survey = await db.query.surveys.findFirst({
      where: eq(surveys.id, params.surveyId),
      with: {
        questions: {
          orderBy: (questions: any, { asc }: any) => [asc(questions.orderIndex)],
          with: {
            rules: true,
          },
        },
      },
    })

    if (!survey) {
      return NextResponse.json(
        { error: 'Survey not found' },
        { status: 404 }
      )
    }

    // Only return active surveys
    if (survey.status !== 'active') {
      return NextResponse.json(
        { error: 'Survey is not currently active' },
        { status: 403 }
      )
    }

    // Return survey configuration (no tenant info)
    return NextResponse.json({
      id: survey.id,
      title: survey.title,
      description: survey.description,
      questions: survey.questions.map((q: any) => ({
        id: q.id,
        text: q.text,
        type: q.type,
        required: q.required,
        scaleMin: q.scaleMin,
        scaleMax: q.scaleMax,
        scaleMinLabel: q.scaleMinLabel,
        scaleMaxLabel: q.scaleMaxLabel,
        choices: q.choices,
        orderIndex: q.orderIndex,
        rules: q.rules,
      })),
    })
  } catch (error) {
    console.error('Error fetching survey:', error)
    return NextResponse.json(
      { error: 'Failed to load survey' },
      { status: 500 }
    )
  }
}
