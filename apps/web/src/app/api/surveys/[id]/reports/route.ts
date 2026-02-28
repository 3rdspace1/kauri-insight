import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

import { db } from '@kauri/db/client'
import { surveys, reports, reportSections, insights as insightsTable, responses } from '@kauri/db/schema'
import { eq, and, count } from 'drizzle-orm'
import { generateReport } from '@kauri/ai/insights'

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth()

        if (!session?.tenantId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Verify survey
        const survey = await db.query.surveys.findFirst({
            where: and(
                eq(surveys.id, params.id),
                eq(surveys.tenantId, session.tenantId)
            ),
        })

        if (!survey) {
            return NextResponse.json({ error: 'Survey not found' }, { status: 404 })
        }

        // Fetch existing insights and metrics
        const existingInsights = await db.query.insights.findMany({
            where: eq(insightsTable.surveyId, params.id),
        })

        const [responseCountResult] = await db
            .select({ count: count() })
            .from(responses)
            .where(eq(responses.surveyId, params.id))

        const metrics = {
            totalResponses: responseCountResult?.count || 0,
            surveyTitle: survey.name,
        }

        // Call AI to draft report
        const drafted = await generateReport(params.id, existingInsights, metrics)

        // Store report in DB
        const [report] = await db
            .insert(reports)
            .values({
                id: crypto.randomUUID(),
                createdAt: Date.now() as any,
                surveyId: params.id,
                title: drafted.title || `${survey.name} - Executive Report`,
                executiveSummary: drafted.executiveSummary,
            })
            .returning()

        // Store sections
        if (drafted.sections && drafted.sections.length > 0) {
            await db.insert(reportSections).values(
                drafted.sections.map((s: any, i: number) => ({
                    id: crypto.randomUUID(),
                    createdAt: Date.now() as any,
                    reportId: report.id,
                    heading: s.heading,
                    body: s.body,
                    orderIndex: i,
                }))
            )
        }

        return NextResponse.json({
            success: true,
            report,
        })
    } catch (error) {
        console.error('Error generating report:', error)
        return NextResponse.json(
            { error: 'Failed to generate report' },
            { status: 500 }
        )
    }
}
