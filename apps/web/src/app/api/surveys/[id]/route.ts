import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

import { db } from '@kauri/db/client'
import { surveys } from '@kauri/db/schema'
import { eq, and } from 'drizzle-orm'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const updateSurveySchema = z.object({
  name: z.string().min(1).optional(),
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  status: z.enum(['draft', 'active', 'closed']).optional(),
  language: z.string().optional(),
})

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()

    if (!session?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const survey = await db.query.surveys.findFirst({
      where: and(
        eq(surveys.id, params.id),
        eq(surveys.tenantId, session.tenantId)
      ),
      with: {
        questions: {
          orderBy: (questions: any, { asc }: any) => [asc(questions.orderIndex)],
          with: {
            rules: true,
          },
        },
      },
    }) as any

    if (!survey) {
      return NextResponse.json({ error: 'Survey not found' }, { status: 404 })
    }

    return NextResponse.json(survey)
  } catch (error) {
    console.error('Error fetching survey:', error)
    return NextResponse.json(
      { error: 'Failed to fetch survey' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()

    if (!session?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validated = updateSurveySchema.parse(body)

    // Verify survey belongs to tenant
    const existing = await db.query.surveys.findFirst({
      where: and(
        eq(surveys.id, params.id),
        eq(surveys.tenantId, session.tenantId)
      ),
    })

    if (!existing) {
      return NextResponse.json({ error: 'Survey not found' }, { status: 404 })
    }

    // Update survey
    const [updated] = await db
      .update(surveys)
      .set(validated)
      .where(eq(surveys.id, params.id))
      .returning()

    return NextResponse.json({
      success: true,
      survey: updated,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error updating survey:', error)
    return NextResponse.json(
      { error: 'Failed to update survey' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()

    if (!session?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify survey belongs to tenant
    const existing = await db.query.surveys.findFirst({
      where: and(
        eq(surveys.id, params.id),
        eq(surveys.tenantId, session.tenantId)
      ),
    })

    if (!existing) {
      return NextResponse.json({ error: 'Survey not found' }, { status: 404 })
    }

    // Delete survey (cascading deletes will handle related records)
    await db.delete(surveys).where(eq(surveys.id, params.id))

    return NextResponse.json({
      success: true,
      message: 'Survey deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting survey:', error)
    return NextResponse.json(
      { error: 'Failed to delete survey' },
      { status: 500 }
    )
  }
}
