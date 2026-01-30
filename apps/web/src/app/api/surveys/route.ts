import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@kauri/db/client'
import { surveys } from '@kauri/db/schema'
import { createSurveySchema } from '@kauri/shared/validators'
import { createSuccessResponse, createErrorResponse, ApiError } from '@kauri/shared/middleware'
import { eq, and, desc } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

// GET /api/surveys - List surveys for tenant
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || !session.tenantId) {
      throw new ApiError(401, 'Unauthorised')
    }

    const tenantSurveys = await db.query.surveys.findMany({
      where: eq(surveys.tenantId, session.tenantId),
      orderBy: [desc(surveys.createdAt)],
    })

    return createSuccessResponse(tenantSurveys)
  } catch (error) {
    return createErrorResponse(error)
  }
}

// POST /api/surveys - Create survey
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || !session.tenantId) {
      throw new ApiError(401, 'Unauthorised')
    }

    const body = await request.json()
    const validated = createSurveySchema.parse(body)

    const [survey] = await db
      .insert(surveys)
      .values({
        tenantId: session.tenantId,
        name: validated.name,
        title: validated.name, // Use name as title for now
        type: validated.type || null,
        status: validated.status,
        language: validated.language,
      })
      .returning()

    return createSuccessResponse(survey, 201)
  } catch (error) {
    return createErrorResponse(error)
  }
}
