export const runtime = 'edge'

import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { surveys, questions } from '@kauri/db/schema'
import { eq } from 'drizzle-orm'
import { createSuccessResponse, createErrorResponse, ApiError } from '@kauri/shared/middleware'

// GET /api/surveys/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth()

    if (!session?.tenantId) {
      throw new ApiError(401, 'Unauthorised')
    }

    const survey = await db.query.surveys.findFirst({
      where: eq(surveys.id, id),
      with: { questions: true },
    })

    if (!survey || survey.tenantId !== session.tenantId) {
      throw new ApiError(404, 'Survey not found')
    }

    return createSuccessResponse(survey)
  } catch (error) {
    return createErrorResponse(error)
  }
}

// PATCH /api/surveys/[id]
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth()

    if (!session?.tenantId) {
      throw new ApiError(401, 'Unauthorised')
    }

    const survey = await db.query.surveys.findFirst({
      where: eq(surveys.id, id),
    })

    if (!survey || survey.tenantId !== session.tenantId) {
      throw new ApiError(404, 'Survey not found')
    }

    const body = await request.json()
    const allowedFields: Record<string, any> = {}
    if (body.status) allowedFields.status = body.status
    if (body.name) allowedFields.name = body.name
    if (body.description !== undefined) allowedFields.description = body.description
    if (body.language) allowedFields.language = body.language

    if (Object.keys(allowedFields).length === 0) {
      throw new ApiError(400, 'No valid fields to update')
    }

    const [updated] = await db
      .update(surveys)
      .set(allowedFields)
      .where(eq(surveys.id, id))
      .returning()

    return createSuccessResponse(updated)
  } catch (error) {
    return createErrorResponse(error)
  }
}

// DELETE /api/surveys/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth()

    if (!session?.tenantId) {
      throw new ApiError(401, 'Unauthorised')
    }

    const survey = await db.query.surveys.findFirst({
      where: eq(surveys.id, id),
    })

    if (!survey || survey.tenantId !== session.tenantId) {
      throw new ApiError(404, 'Survey not found')
    }

    await db.delete(surveys).where(eq(surveys.id, id))

    return createSuccessResponse({ deleted: true })
  } catch (error) {
    return createErrorResponse(error)
  }
}
