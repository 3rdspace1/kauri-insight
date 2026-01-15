import { NextRequest, NextResponse } from 'next/server'

export interface TenantContext {
  tenantId: string
  userId: string
  role: string
}

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export function createErrorResponse(error: unknown): NextResponse {
  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: error.statusCode }
    )
  }

  console.error('Unexpected error:', error)
  return NextResponse.json(
    {
      success: false,
      error: 'Internal server error',
    },
    { status: 500 }
  )
}

export function createSuccessResponse<T>(data: T, status = 200): NextResponse {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    { status }
  )
}
