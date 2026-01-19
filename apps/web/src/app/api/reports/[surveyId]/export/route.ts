import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@kauri/db/client'
import { surveys, insights, responses } from '@kauri/db/schema'
import { eq, and } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

/**
 * Export Report API Route
 *
 * Generates and downloads reports in PDF or PPTX format
 *
 * Usage:
 * POST /api/reports/[surveyId]/export?format=pdf
 * POST /api/reports/[surveyId]/export?format=pptx
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { surveyId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const format = searchParams.get('format') || 'pdf'

    if (!['pdf', 'pptx'].includes(format)) {
      return NextResponse.json(
        { error: 'Invalid format. Use "pdf" or "pptx"' },
        { status: 400 }
      )
    }

    // Verify survey belongs to tenant
    const survey = await db.query.surveys.findFirst({
      where: and(
        eq(surveys.id, params.surveyId),
        eq(surveys.tenantId, session.tenantId)
      ),
      with: {
        questions: true,
      },
    })

    if (!survey) {
      return NextResponse.json({ error: 'Survey not found' }, { status: 404 })
    }

    // Get insights
    const surveyInsights = await db.query.insights.findMany({
      where: eq(insights.surveyId, params.surveyId),
      orderBy: (insights, { desc }) => [desc(insights.createdAt)],
    })

    // Get response count
    const surveyResponses = await db.query.responses.findMany({
      where: eq(responses.surveyId, params.surveyId),
      with: {
        items: {
          with: {
            question: true,
          },
        },
      },
    })

    if (surveyInsights.length === 0) {
      return NextResponse.json(
        { error: 'No insights available. Generate insights first.' },
        { status: 400 }
      )
    }

    // Prepare report data
    const reportData = {
      survey: {
        name: survey.name,
        description: survey.description,
        status: survey.status,
        questionCount: survey.questions.length,
      },
      metrics: {
        totalResponses: surveyResponses.length,
        completedResponses: surveyResponses.filter(r => r.status === 'completed').length,
        completionRate: surveyResponses.length > 0
          ? Math.round((surveyResponses.filter(r => r.status === 'completed').length / surveyResponses.length) * 100)
          : 0,
      },
      insights: surveyInsights.map(insight => ({
        title: insight.title,
        summary: insight.summary,
        sentiment: insight.sentiment,
        evidence: insight.evidenceJson,
      })),
      sentimentBreakdown: {
        positive: surveyInsights.filter(i => i.sentiment === 'positive').length,
        neutral: surveyInsights.filter(i => i.sentiment === 'neutral').length,
        negative: surveyInsights.filter(i => i.sentiment === 'negative').length,
      },
      generatedAt: new Date().toISOString(),
    }

    // Generate export based on format
    if (format === 'pdf') {
      const pdfBuffer = await generatePDFReport(reportData)

      return new NextResponse(pdfBuffer as any, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="survey-report-${params.surveyId}.pdf"`,
        },
      })
    } else {
      const pptxBuffer = await generatePPTXReport(reportData)

      return new NextResponse(pptxBuffer as any, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
          'Content-Disposition': `attachment; filename="survey-report-${params.surveyId}.pptx"`,
        },
      })
    }
  } catch (error) {
    console.error('Error exporting report:', error)
    return NextResponse.json(
      { error: 'Failed to export report', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

/**
 * Generate PDF Report using HTML template
 */
async function generatePDFReport(reportData: any): Promise<Buffer> {
  // Import dynamically to avoid build-time issues
  const { chromium } = await import('playwright')

  const html = generateReportHTML(reportData)

  const browser = await chromium.launch()
  const page = await browser.newPage()

  await page.setContent(html)

  const pdf = await page.pdf({
    format: 'A4',
    margin: {
      top: '20mm',
      right: '15mm',
      bottom: '20mm',
      left: '15mm',
    },
    printBackground: true,
  })

  await browser.close()

  return Buffer.from(pdf)
}

/**
 * Generate PowerPoint Report
 */
async function generatePPTXReport(reportData: any): Promise<Buffer> {
  const PptxGenJS = (await import('pptxgenjs')).default

  const pptx = new PptxGenJS()

  // Slide 1: Title
  const titleSlide = pptx.addSlide()
  titleSlide.background = { color: '0F172A' }

  titleSlide.addText(reportData.survey.name, {
    x: 0.5,
    y: 2,
    w: 9,
    h: 1.5,
    fontSize: 44,
    bold: true,
    color: 'FFFFFF',
    align: 'center',
  })

  titleSlide.addText('Survey Insights Report', {
    x: 0.5,
    y: 3.5,
    w: 9,
    h: 0.5,
    fontSize: 24,
    color: 'CBD5E1',
    align: 'center',
  })

  titleSlide.addText(`Generated: ${new Date(reportData.generatedAt).toLocaleDateString()}`, {
    x: 0.5,
    y: 5,
    w: 9,
    h: 0.3,
    fontSize: 14,
    color: '94A3B8',
    align: 'center',
  })

  // Slide 2: Executive Summary
  const summarySlide = pptx.addSlide()
  summarySlide.addText('Executive Summary', {
    x: 0.5,
    y: 0.5,
    w: 9,
    h: 0.6,
    fontSize: 36,
    bold: true,
    color: '1E293B',
  })

  summarySlide.addText([
    { text: 'Total Responses: ', options: { bold: true } },
    { text: reportData.metrics.totalResponses.toString() },
  ], {
    x: 0.5,
    y: 1.5,
    w: 4,
    h: 0.4,
    fontSize: 18,
  })

  summarySlide.addText([
    { text: 'Completion Rate: ', options: { bold: true } },
    { text: `${reportData.metrics.completionRate}%` },
  ], {
    x: 0.5,
    y: 2,
    w: 4,
    h: 0.4,
    fontSize: 18,
  })

  summarySlide.addText([
    { text: 'Total Insights: ', options: { bold: true } },
    { text: reportData.insights.length.toString() },
  ], {
    x: 0.5,
    y: 2.5,
    w: 4,
    h: 0.4,
    fontSize: 18,
  })

  // Slide 3: Sentiment Breakdown
  const sentimentSlide = pptx.addSlide()
  sentimentSlide.addText('Sentiment Analysis', {
    x: 0.5,
    y: 0.5,
    w: 9,
    h: 0.6,
    fontSize: 36,
    bold: true,
    color: '1E293B',
  })

  sentimentSlide.addChart(pptx.ChartType.pie, [
    {
      name: 'Sentiment',
      labels: ['Positive', 'Neutral', 'Negative'],
      values: [
        reportData.sentimentBreakdown.positive,
        reportData.sentimentBreakdown.neutral,
        reportData.sentimentBreakdown.negative,
      ],
    },
  ], {
    x: 1.5,
    y: 2,
    w: 7,
    h: 4,
    showTitle: false,
  })

  // Slides 4+: Individual Insights
  reportData.insights.slice(0, 8).forEach((insight: any, index: number) => {
    const insightSlide = pptx.addSlide()

    const sentimentColor =
      insight.sentiment === 'positive' ? '10B981' :
      insight.sentiment === 'negative' ? 'EF4444' : '6B7280'

    insightSlide.addText(`Insight ${index + 1}`, {
      x: 0.5,
      y: 0.3,
      w: 9,
      h: 0.4,
      fontSize: 16,
      color: '64748B',
    })

    insightSlide.addText(insight.title, {
      x: 0.5,
      y: 0.8,
      w: 9,
      h: 0.8,
      fontSize: 32,
      bold: true,
      color: '1E293B',
    })

    insightSlide.addShape(pptx.ShapeType.rect, {
      x: 0.5,
      y: 1.8,
      w: 0.8,
      h: 0.3,
      fill: { color: sentimentColor },
    })

    insightSlide.addText(insight.sentiment.toUpperCase(), {
      x: 0.55,
      y: 1.85,
      w: 0.7,
      h: 0.2,
      fontSize: 12,
      bold: true,
      color: 'FFFFFF',
    })

    insightSlide.addText(insight.summary, {
      x: 0.5,
      y: 2.5,
      w: 9,
      h: 3,
      fontSize: 16,
      color: '334155',
      valign: 'top',
    })
  })

  // Final slide: Next Steps
  const finalSlide = pptx.addSlide()
  finalSlide.addText('Next Steps & Recommendations', {
    x: 0.5,
    y: 0.5,
    w: 9,
    h: 0.6,
    fontSize: 36,
    bold: true,
    color: '1E293B',
  })

  finalSlide.addText(
    '• Review insights with key stakeholders\n\n' +
    '• Prioritize action items based on sentiment\n\n' +
    '• Develop implementation plan\n\n' +
    '• Schedule follow-up survey',
    {
      x: 0.5,
      y: 2,
      w: 9,
      h: 3,
      fontSize: 20,
      color: '334155',
    }
  )

  return Buffer.from(await pptx.write({ outputType: 'nodebuffer' }) as ArrayBuffer)
}

/**
 * Generate HTML for PDF report
 */
function generateReportHTML(reportData: any): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #1e293b;
    }

    .cover {
      height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      text-align: center;
      page-break-after: always;
    }

    .cover h1 {
      font-size: 48px;
      margin-bottom: 20px;
    }

    .cover p {
      font-size: 24px;
      opacity: 0.9;
    }

    .page {
      padding: 40px;
      page-break-after: always;
    }

    h1 {
      font-size: 36px;
      margin-bottom: 30px;
      color: #0f172a;
    }

    h2 {
      font-size: 28px;
      margin-top: 30px;
      margin-bottom: 15px;
      color: #1e293b;
    }

    .metrics {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      margin: 30px 0;
    }

    .metric {
      padding: 20px;
      background: #f8fafc;
      border-radius: 8px;
      border-left: 4px solid #667eea;
    }

    .metric-value {
      font-size: 36px;
      font-weight: bold;
      color: #667eea;
    }

    .metric-label {
      font-size: 14px;
      color: #64748b;
      margin-top: 5px;
    }

    .insight {
      margin: 30px 0;
      padding: 25px;
      background: white;
      border-radius: 8px;
      border-left: 4px solid #cbd5e1;
    }

    .insight.positive {
      border-left-color: #10b981;
    }

    .insight.negative {
      border-left-color: #ef4444;
    }

    .insight.neutral {
      border-left-color: #6b7280;
    }

    .insight-header {
      display: flex;
      align-items: center;
      margin-bottom: 15px;
    }

    .sentiment-badge {
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      margin-right: 15px;
    }

    .sentiment-badge.positive {
      background: #d1fae5;
      color: #065f46;
    }

    .sentiment-badge.negative {
      background: #fee2e2;
      color: #991b1b;
    }

    .sentiment-badge.neutral {
      background: #e5e7eb;
      color: #374151;
    }

    .insight-title {
      font-size: 22px;
      font-weight: 600;
    }

    .insight-summary {
      color: #475569;
      line-height: 1.8;
    }
  </style>
</head>
<body>
  <div class="cover">
    <h1>${reportData.survey.name}</h1>
    <p>Survey Insights Report</p>
    <p style="font-size: 16px; margin-top: 40px;">Generated: ${new Date(reportData.generatedAt).toLocaleDateString()}</p>
  </div>

  <div class="page">
    <h1>Executive Summary</h1>

    <div class="metrics">
      <div class="metric">
        <div class="metric-value">${reportData.metrics.totalResponses}</div>
        <div class="metric-label">Total Responses</div>
      </div>
      <div class="metric">
        <div class="metric-value">${reportData.metrics.completionRate}%</div>
        <div class="metric-label">Completion Rate</div>
      </div>
      <div class="metric">
        <div class="metric-value">${reportData.insights.length}</div>
        <div class="metric-label">Insights Generated</div>
      </div>
    </div>

    <h2>Sentiment Breakdown</h2>
    <div class="metrics">
      <div class="metric" style="border-left-color: #10b981;">
        <div class="metric-value" style="color: #10b981;">${reportData.sentimentBreakdown.positive}</div>
        <div class="metric-label">Positive</div>
      </div>
      <div class="metric" style="border-left-color: #6b7280;">
        <div class="metric-value" style="color: #6b7280;">${reportData.sentimentBreakdown.neutral}</div>
        <div class="metric-label">Neutral</div>
      </div>
      <div class="metric" style="border-left-color: #ef4444;">
        <div class="metric-value" style="color: #ef4444;">${reportData.sentimentBreakdown.negative}</div>
        <div class="metric-label">Negative</div>
      </div>
    </div>
  </div>

  <div class="page">
    <h1>Key Insights</h1>
    ${reportData.insights.map((insight: any) => `
      <div class="insight ${insight.sentiment}">
        <div class="insight-header">
          <span class="sentiment-badge ${insight.sentiment}">${insight.sentiment}</span>
          <span class="insight-title">${insight.title}</span>
        </div>
        <div class="insight-summary">${insight.summary}</div>
      </div>
    `).join('')}
  </div>

  <div class="page">
    <h1>Next Steps</h1>
    <div style="margin-top: 30px; line-height: 2;">
      <p>• Review insights with key stakeholders</p>
      <p>• Prioritize action items based on sentiment analysis</p>
      <p>• Develop implementation plan for top recommendations</p>
      <p>• Schedule follow-up survey to track improvements</p>
      <p>• Monitor progress against key metrics</p>
    </div>
  </div>
</body>
</html>
  `.trim()
}
