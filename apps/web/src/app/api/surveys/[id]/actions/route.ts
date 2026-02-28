import { auth } from '@/lib/auth'

import { db } from '@kauri/db/client'
import { actions, surveys } from '@kauri/db/schema'
import { eq, and } from 'drizzle-orm'
import { createSuccessResponse, createErrorResponse, ApiError } from '@kauri/shared/middleware'
import { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth()

        if (!session?.tenantId) {
            throw new ApiError(401, 'Unauthorised')
        }

        const surveyId = params.id

        // Verify survey belongs to tenant
        const survey = await db.query.surveys.findFirst({
            where: and(
                eq(surveys.id, surveyId),
                eq(surveys.tenantId, session.tenantId)
            ),
        })

        if (!survey) {
            throw new ApiError(404, 'Survey not found')
        }

        const surveyActions = await db.query.actions.findMany({
            where: eq(actions.surveyId, surveyId),
            orderBy: (actions: any, { desc }: any) => [desc(actions.createdAt)],
        })

        return createSuccessResponse(surveyActions)
    } catch (error) {
        return createErrorResponse(error)
    }
}
