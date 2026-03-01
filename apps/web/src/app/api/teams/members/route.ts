export const runtime = 'edge'

import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

import { db } from '@kauri/db/client'
import { memberships, invitations } from '@kauri/db/schema'
import { eq, and } from 'drizzle-orm'

export async function GET() {
    try {
        const session = await auth()

        if (!session?.tenantId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get active members
        const activeMembers = await db.query.memberships.findMany({
            where: eq(memberships.tenantId, session.tenantId),
            with: {
                user: true,
            },
        })

        // Get pending invitations
        const pendingInvites = await db.query.invitations.findMany({
            where: and(
                eq(invitations.tenantId, session.tenantId),
                eq(invitations.status, 'pending')
            ),
            orderBy: (invitations: any, { desc }: any) => [desc(invitations.createdAt)],
        })

        return NextResponse.json({
            members: activeMembers,
            invitations: pendingInvites,
        })
    } catch (error) {
        console.error('Error fetching team members:', error)
        return NextResponse.json(
            { error: 'Failed to fetch team members' },
            { status: 500 }
        )
    }
}
