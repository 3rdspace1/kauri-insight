export const runtime = 'edge'

import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { responseItems, responses } from '@kauri/db/schema'
import { eq } from 'drizzle-orm'
import { createSuccessResponse, createErrorResponse, ApiError } from '@kauri/shared/middleware'

// POST /api/responses/[id]/items - Save an answer
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: responseId } = await params
    const body = await request.json()
    const { questionId, valueText, valueNum, valueScale, valueChoice } = body

    if (!questionId) {
      throw new ApiError(400, 'questionId is required')
    }

    // Check response exists
    const response = await db.query.responses.findFirst({
      where: eq(responses.id, responseId),
    })

    if (!response) {
      throw new ApiError(404, 'Response not found')
    }

    if (response.status === 'completed') {
      throw new ApiError(400, 'This response has already been completed')
    }

    // Upsert: delete existing item for this question if present, then insert
    await db
      .delete(responseItems)
      .where(eq(responseItems.responseId, responseId))

    // We do a simpler approach: just insert
    const [item] = await db
      .insert(responseItems)
      .values({
        id: crypto.randomUUID(),
        responseId,
        questionId,
        valueText: valueText || null,
        valueNum: valueNum || null,
        valueScale: valueScale || null,
        valueChoice: valueChoice || null,
        createdAt: new Date(),
      })
      .returning()

    return createSuccessResponse({ item }, 201)
  } catch (error) {
    return createErrorResponse(error)
  }
}
