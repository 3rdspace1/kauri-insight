export const runtime = 'edge'

import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { responses } from '@kauri/db/schema'
import { eq } from 'drizzle-orm'
import { createSuccessResponse, createErrorResponse, ApiError } from '@kauri/shared/middleware'

// POST /api/responses/[id]/complete - Mark a response as complete
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const response = await db.query.responses.findFirst({
      where: eq(responses.id, id),
    })

    if (!response) {
      throw new ApiError(404, 'Response not found')
    }

    const [updated] = await db
      .update(responses)
      .set({
        status: 'completed',
        completedAt: new Date(),
      })
      .where(eq(responses.id, id))
      .returning()

    return createSuccessResponse({ response: updated })
  } catch (error) {
    return createErrorResponse(error)
  }
}
