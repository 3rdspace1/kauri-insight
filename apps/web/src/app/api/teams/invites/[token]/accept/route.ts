export const runtime = 'edge'

import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

import { db } from '@kauri/db/client'
import { invitations, memberships } from '@kauri/db/schema'
import { eq, and } from 'drizzle-orm'

export async function POST(
    request: Request,
    { params }: { params: { token: string } }
) {
    try {
        const session = await auth()

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Must be logged in to accept invitation' }, { status: 401 })
        }

        // Find valid invitation
        const invitation = await db.query.invitations.findFirst({
            where: and(
                eq(invitations.token, params.token),
                eq(invitations.status, 'pending')
            ),
        })

        if (!invitation) {
            return NextResponse.json({ error: 'Invitation not found or already used' }, { status: 404 })
        }

        if (new Date() > invitation.expiresAt) {
            await db
                .update(invitations)
                .set({ status: 'expired' })
                .where(eq(invitations.id, invitation.id))
            return NextResponse.json({ error: 'Invitation expired' }, { status: 410 })
        }

        // Create membership
        await db.insert(memberships).values({
            id: crypto.randomUUID(),
            createdAt: Date.now() as any,
            tenantId: invitation.tenantId,
            userId: session.user.id,
            role: invitation.role,
        })

        // Mark invitation as accepted
        await db
            .update(invitations)
            .set({ status: 'accepted' })
            .where(eq(invitations.id, invitation.id))

        return NextResponse.json({
            success: true,
            message: 'Invitation accepted successfully',
        })
    } catch (error) {
        console.error('Error accepting invitation:', error)
        return NextResponse.json(
            { error: 'Failed to accept invitation' },
            { status: 500 }
        )
    }
}
