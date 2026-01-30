import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@kauri/db/client'
import { actions, surveys } from '@kauri/db/schema'
import { eq, and } from 'drizzle-orm'
import { createSuccessResponse, createErrorResponse, ApiError } from '@kauri/shared/middleware'
import { NextRequest } from 'next/server'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const updateSchema = z.object({
    status: z.enum(['open', 'doing', 'done']),
})

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.tenantId) {
            throw new ApiError(401, 'Unauthorised')
        }

        const actionId = params.id
        const body = await request.json()
        const { status } = updateSchema.parse(body)

        // Verify action belongs to survey belonging to tenant
        const action = await db.query.actions.findFirst({
            where: eq(actions.id, actionId),
            with: {
                survey: true,
            },
        }) as any

        if (!action || action.survey.tenantId !== session.tenantId) {
            throw new ApiError(404, 'Action not found')
        }

        const [updatedAction] = await db
            .update(actions)
            .set({ status })
            .where(eq(actions.id, actionId))
            .returning()

        return createSuccessResponse(updatedAction)
    } catch (error) {
        return createErrorResponse(error)
    }
}
