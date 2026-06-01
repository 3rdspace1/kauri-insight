export const runtime = 'edge'

import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { actions } from '@kauri/db/schema'
import { eq } from 'drizzle-orm'
import { createSuccessResponse, createErrorResponse, ApiError } from '@kauri/shared/middleware'

// PATCH /api/actions/[id]
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { status } = await request.json()

    if (!status || !['open', 'doing', 'done'].includes(status)) {
      throw new ApiError(400, 'Valid status is required: open, doing, done')
    }

    const [updated] = await db
      .update(actions)
      .set({ status })
      .where(eq(actions.id, id))
      .returning()

    if (!updated) {
      throw new ApiError(404, 'Action not found')
    }

    return createSuccessResponse(updated)
  } catch (error) {
    return createErrorResponse(error)
  }
}
