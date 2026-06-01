export const runtime = 'edge'

import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { memberships, users, invitations } from '@kauri/db/schema'
import { eq } from 'drizzle-orm'
import { createSuccessResponse, createErrorResponse, ApiError } from '@kauri/shared/middleware'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.tenantId) {
      throw new ApiError(401, 'Unauthorised')
    }

    const teamMembers = await db.query.memberships.findMany({
      where: eq(memberships.tenantId, session.tenantId),
      with: {
        user: true,
      },
    })

    const pendingInvites = await db.query.invitations
      ? await db.query.invitations.findMany({
          where: eq((invitations as any).tenantId, session.tenantId),
        })
      : []

    return createSuccessResponse({
      members: teamMembers.map((m: any) => ({
        id: m.id,
        role: m.role,
        user: m.user,
      })),
      invitations: pendingInvites || [],
    })
  } catch (error) {
    return createErrorResponse(error)
  }
}
