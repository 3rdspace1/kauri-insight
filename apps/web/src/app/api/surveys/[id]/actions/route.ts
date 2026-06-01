export const runtime = 'edge'

import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { actions, surveys } from '@kauri/db/schema'
import { eq } from 'drizzle-orm'
import { createSuccessResponse, createErrorResponse, ApiError } from '@kauri/shared/middleware'

// GET /api/surveys/[id]/actions
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
    })

    if (!survey || survey.tenantId !== session.tenantId) {
      throw new ApiError(404, 'Survey not found')
    }

    const surveyActions = await db.query.actions.findMany({
      where: eq(actions.surveyId, id),
      orderBy: (actions: any, { desc }: any) => [desc(actions.createdAt)],
    })

    return createSuccessResponse(surveyActions)
  } catch (error) {
    return createErrorResponse(error)
  }
}
