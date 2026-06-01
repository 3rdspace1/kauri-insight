export const runtime = 'edge'

import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { invitations } from '@kauri/db/schema'
import { createSuccessResponse, createErrorResponse, ApiError } from '@kauri/shared/middleware'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.tenantId) {
      throw new ApiError(401, 'Unauthorised')
    }

    if (session.role !== 'admin' && session.role !== 'owner') {
      throw new ApiError(403, 'Only admins can invite members')
    }

    const { email, role } = await request.json()

    if (!email) {
      throw new ApiError(400, 'Email is required')
    }

    // In a real app, send an invitation email here
    // For now, just record the invitation
    const [invite] = await db
      .insert(invitations)
      .values({
        id: crypto.randomUUID(),
        tenantId: session.tenantId,
        email,
        role: role || 'viewer',
        status: 'pending',
        createdAt: new Date(),
      })
      .returning()

    return createSuccessResponse({ invitation: invite }, 201)
  } catch (error) {
    return createErrorResponse(error)
  }
}
