export const runtime = 'edge'

import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { tenants } from '@kauri/db/schema'
import { eq } from 'drizzle-orm'
import { createSuccessResponse, createErrorResponse, ApiError } from '@kauri/shared/middleware'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.tenantId) {
      throw new ApiError(401, 'Unauthorised')
    }

    const body = await request.json()

    const [updated] = await db
      .update(tenants)
      .set({
        name: body.name,
        industry: body.industry || null,
        website: body.website || null,
        description: body.description || null,
        logo: body.logo || null,
        primaryColor: body.primaryColor || '#667eea',
      })
      .where(eq(tenants.id, session.tenantId))
      .returning()

    return createSuccessResponse({ tenant: updated })
  } catch (error) {
    return createErrorResponse(error)
  }
}
