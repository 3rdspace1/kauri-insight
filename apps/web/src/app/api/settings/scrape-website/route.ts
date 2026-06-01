export const runtime = 'edge'

import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { createSuccessResponse, createErrorResponse, ApiError } from '@kauri/shared/middleware'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.tenantId) {
      throw new ApiError(401, 'Unauthorised')
    }

    const { url } = await request.json()

    if (!url) {
      throw new ApiError(400, 'URL is required')
    }

    // In production, we'd scrape the website for business context
    // For now, return a basic response
    return createSuccessResponse({
      description: '',
      industry: '',
    })
  } catch (error) {
    return createErrorResponse(error)
  }
}
