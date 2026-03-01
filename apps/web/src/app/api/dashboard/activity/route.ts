export const runtime = 'edge'

import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

import { db } from '@kauri/db/client'
import { responses, insights, actions, surveys } from '@kauri/db/schema'
import { eq, desc, and } from 'drizzle-orm'

export async function GET() {
    try {
        const session = await auth()

        if (!session?.tenantId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Fetch latest responses, insights, and actions
        const latestResponses = await db.query.responses.findMany({
            limit: 3,
            orderBy: [desc(responses.createdAt)],
            with: { survey: true },
        })

        const latestInsights = await db.query.insights.findMany({
            limit: 2,
            orderBy: [desc(insights.createdAt)],
            with: { survey: true },
        })

        const latestActions = await db.query.actions.findMany({
            limit: 2,
            orderBy: [desc(actions.createdAt)],
            with: { survey: true },
        })

        // Transform into unified feed
        const feed = [
            ...latestResponses.map((r: any) => ({
                id: `r-${r.id}`,
                type: 'response' as const,
                text: 'New response received',
                timestamp: r.createdAt.toISOString(),
                surveyName: r.survey.name,
            })),
            ...latestInsights.map((i: any) => ({
                id: `i-${i.id}`,
                type: 'insight' as const,
                text: `New Insight: ${i.title}`,
                timestamp: i.createdAt.toISOString(),
                surveyName: i.survey.name,
            })),
            ...latestActions.map((a: any) => ({
                id: `a-${a.id}`,
                type: 'action' as const,
                text: `Action Required: ${a.title}`,
                timestamp: a.createdAt.toISOString(),
                surveyName: a.survey.name,
            })),
        ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

        return NextResponse.json(feed.slice(0, 7))
    } catch (error) {
        console.error('Activity error:', error)
        return NextResponse.json({ error: 'Failed' }, { status: 500 })
    }
}
