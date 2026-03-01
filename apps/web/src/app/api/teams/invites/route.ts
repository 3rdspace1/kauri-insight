export const runtime = 'edge'

import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

import { db } from '@kauri/db/client'
import { invitations } from '@kauri/db/schema'
import { z } from 'zod'
import crypto from 'crypto'

const inviteSchema = z.object({
    email: z.string().email('Invalid email address'),
    role: z.enum(['admin', 'editor', 'viewer']).default('viewer'),
})

export async function POST(request: Request) {
    try {
        const session = await auth()

        if (!session?.tenantId || (session.role !== 'admin' && session.role !== 'owner')) {
            return NextResponse.json({ error: 'Unauthorized. Admin role required.' }, { status: 403 })
        }

        const body = await request.json()
        const validated = inviteSchema.parse(body)

        // Generate secure token
        const token = crypto.randomBytes(32).toString('hex')
        const expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + 7) // expires in 7 days

        const [invitation] = await db
            .insert(invitations)
            .values({
                id: crypto.randomUUID(),
                createdAt: Date.now() as any,
                tenantId: session.tenantId,
                email: validated.email,
                role: validated.role,
                token,
                status: 'pending',
                expiresAt: expiresAt.getTime() as any,
                invitedBy: session.user.id,
            })
            .returning()

        // In a real app, send actual email here
        // const inviteLink = `${process.env.NEXTAUTH_URL}/join/${token}`

        return NextResponse.json({
            success: true,
            invitation: {
                id: invitation.id,
                email: invitation.email,
                role: invitation.role,
                token, // For demo purposes, returning the token
            },
        })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Validation failed', details: error.errors },
                { status: 400 }
            )
        }

        console.error('Error creating invitation:', error)
        return NextResponse.json(
            { error: 'Failed to create invitation' },
            { status: 500 }
        )
    }
}
