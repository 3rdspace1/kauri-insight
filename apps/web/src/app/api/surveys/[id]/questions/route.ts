import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@kauri/db/client'
import { surveys, questions } from '@kauri/db/schema'
import { eq, and } from 'drizzle-orm'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const createQuestionSchema = z.object({
  kind: z.enum(['scale', 'text', 'choice']),
  text: z.string().min(1, 'Question text is required'),
  type: z.enum(['scale', 'text', 'choice']),
  required: z.boolean().default(true),
  scaleMin: z.number().int().optional(),
  scaleMax: z.number().int().optional(),
  scaleMinLabel: z.string().optional(),
  scaleMaxLabel: z.string().optional(),
  choices: z.array(z.string()).optional(),
  orderIndex: z.number().int().default(0),
})

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify survey belongs to tenant
    const survey = await db.query.surveys.findFirst({
      where: and(
        eq(surveys.id, params.id),
        eq(surveys.tenantId, session.tenantId)
      ),
    })

    if (!survey) {
      return NextResponse.json({ error: 'Survey not found' }, { status: 404 })
    }

    const body = await request.json()
    const validated = createQuestionSchema.parse(body)

    // Get current max order index
    const existingQuestions = await db.query.questions.findMany({
      where: eq(questions.surveyId, params.id),
      orderBy: (questions, { desc }) => [desc(questions.orderIndex)],
    })

    const nextOrderIndex = existingQuestions.length > 0
      ? (existingQuestions[0].orderIndex || 0) + 1
      : 0

    // Create question
    const [question] = await db
      .insert(questions)
      .values({
        surveyId: params.id,
        kind: validated.kind,
        text: validated.text,
        type: validated.type,
        required: validated.required,
        scaleMin: validated.scaleMin,
        scaleMax: validated.scaleMax,
        scaleMinLabel: validated.scaleMinLabel,
        scaleMaxLabel: validated.scaleMaxLabel,
        choices: validated.choices,
        orderIndex: validated.orderIndex || nextOrderIndex,
        order: validated.orderIndex || nextOrderIndex,
      })
      .returning()

    return NextResponse.json({
      success: true,
      question,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating question:', error)
    return NextResponse.json(
      { error: 'Failed to create question' },
      { status: 500 }
    )
  }
}
