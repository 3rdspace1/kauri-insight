export const runtime = 'edge'

import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

import { db } from '@kauri/db/client'
import { surveys, responses, insights as insightsTable } from '@kauri/db/schema'
import { eq, count } from 'drizzle-orm'

export async function GET() {
    try {
        const session = await auth()

        if (!session?.tenantId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const tenantSurveys = await db.query.surveys.findMany({
            where: eq(surveys.tenantId, session.tenantId),
        })

        const surveyCount = tenantSurveys.length

        let totalResponses = 0
        for (const survey of tenantSurveys) {
            const result = await db
                .select({ count: count() })
                .from(responses)
                .where(eq(responses.surveyId, survey.id))
            totalResponses += result[0]?.count || 0
        }

        const [insightsCountResult] = await db
            .select({ count: count() })
            .from(insightsTable)
            .innerJoin(surveys, eq(insightsTable.surveyId, surveys.id))
            .where(eq(surveys.tenantId, session.tenantId))

        return NextResponse.json({
            surveyCount,
            totalResponses,
            insightsCount: insightsCountResult?.count || 0,
        })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
    }
}
