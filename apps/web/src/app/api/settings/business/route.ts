import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

import { db } from '@kauri/db/client'
import { tenants } from '@kauri/db/schema'
import { eq } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

/**
 * Update Business Context API
 *
 * Updates tenant business information for AI-powered reporting
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, industry, website, description, logo, primaryColor } = body

    // Validate required fields
    if (!name || !industry || !description) {
      return NextResponse.json(
        { error: 'Missing required fields: name, industry, description' },
        { status: 400 }
      )
    }

    // Update tenant
    await db
      .update(tenants)
      .set({
        name,
        industry,
        website: website || null,
        description,
        logo: logo || null,
        primaryColor: primaryColor || '#667eea',
      })
      .where(eq(tenants.id, session.tenantId))

    return NextResponse.json({
      success: true,
      message: 'Business context updated successfully',
    })
  } catch (error) {
    console.error('Error updating business context:', error)
    return NextResponse.json(
      { error: 'Failed to update business context' },
      { status: 500 }
    )
  }
}
