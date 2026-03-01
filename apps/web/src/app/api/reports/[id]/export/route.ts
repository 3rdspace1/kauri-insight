export const runtime = 'edge'

import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

import { db } from '@kauri/db/client'
import { reports } from '@kauri/db/schema'
import { eq, and } from 'drizzle-orm'
import { generatePDF } from '@/lib/pdf'

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth()

        if (!session?.tenantId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const report = await db.query.reports.findFirst({
            where: eq(reports.id, params.id),
        })

        if (!report) {
            return NextResponse.json({ error: 'Report not found' }, { status: 404 })
        }

        // Construct the URL to the report view
        // In a real environment, you'd use the full domain
        const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https'
        const host = request.headers.get('host') || 'localhost:3000'
        const reportUrl = `${protocol}://${host}/dashboard/reports/${params.id}/view`

        console.log(`🖨️ Generating PDF for ${reportUrl}...`)

        const pdf = await generatePDF(reportUrl)

        return new NextResponse(pdf as any, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="report-${report.title.replace(/\s+/g, '_')}.pdf"`,
            },
        })
    } catch (error) {
        console.error('PDF Export Error:', error)
        return NextResponse.json(
            { error: 'Failed to generate PDF. Make sure Playwright is installed correctly.' },
            { status: 500 }
        )
    }
}
