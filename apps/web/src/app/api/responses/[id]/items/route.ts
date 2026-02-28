import { NextResponse } from 'next/server'
import { db } from '@kauri/db/client'
import { responseItems, responses } from '@kauri/db/schema'
import { z } from 'zod'
import { eq } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

const createItemSchema = z.object({
  questionId: z.string().uuid(),
  valueScale: z.number().min(1).max(10).nullable().optional(),
  valueText: z.string().nullable().optional(),
  valueChoice: z.string().nullable().optional(),
})

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const validated = createItemSchema.parse(body)

    // Verify response exists and is in_progress
    const response = await db.query.responses.findFirst({
      where: eq(responses.id, params.id),
    })

    if (!response) {
      return NextResponse.json(
        { error: 'Response not found' },
        { status: 404 }
      )
    }

    if (response.status !== 'in_progress') {
      return NextResponse.json(
        { error: 'Response is already completed' },
        { status: 400 }
      )
    }

    // Check if item already exists for this question
    const existingItem = await db.query.responseItems.findFirst({
      where: (items: any, { and, eq }: any) =>
        and(
          eq(items.responseId, params.id),
          eq(items.questionId, validated.questionId)
        ),
    })

    if (existingItem) {
      // Update existing item
      const [updatedItem] = await db
        .update(responseItems)
        .set({
          valueScale: validated.valueScale,
          valueText: validated.valueText,
          valueChoice: validated.valueChoice,
        })
        .where(eq(responseItems.id, existingItem.id))
        .returning()

      return NextResponse.json({
        success: true,
        item: updatedItem,
      })
    }

    // Create new item
    const [item] = await db
      .insert(responseItems)
      .values({
        id: crypto.randomUUID(),
        createdAt: Date.now() as any,
        responseId: params.id,
        questionId: validated.questionId,
        valueScale: validated.valueScale,
        valueText: validated.valueText,
        valueChoice: validated.valueChoice,
      })
      .returning()

    return NextResponse.json({
      success: true,
      item,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating response item:', error)
    return NextResponse.json(
      { error: 'Failed to save answer' },
      { status: 500 }
    )
  }
}
