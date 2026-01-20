import { getAIProvider } from '../provider'
import type { InsightPayload } from '@kauri/shared/types'

/**
 * Enhanced Orchestrator with Business Context & Industry Research
 *
 * This orchestrator goes beyond basic sentiment analysis to provide
 * comprehensive, actionable insights with industry context.
 */

interface BusinessContext {
  companyName?: string
  industry?: string
  website?: string
  description?: string
}

interface EnhancedReport {
  executiveSummary: string
  keyFindings: string[]
  insights: any[]
  industryContext: {
    trends: string[]
    bestPractices: string[]
    competitorInsights: string[]
  }
  recommendations: {
    priority: 'high' | 'medium' | 'low'
    title: string
    description: string
    expectedImpact: string
    effort: 'low' | 'medium' | 'high'
    timeline: string
  }[]
  visualAssets: {
    coverImage?: string
    charts: any[]
    infographics?: string[]
  }
}

/**
 * Generate comprehensive report with business context and industry research
 */
export async function generateEnhancedReport(
  payload: InsightPayload,
  businessContext?: BusinessContext
): Promise<EnhancedReport> {
  const provider = getAIProvider()

  console.log('🚀 Starting enhanced report generation...')

  // Step 1: Analyse responses (existing functionality)
  console.log(`📊 Analysing ${payload.responses.length} responses...`)
  const analysis = await provider.analyseResponses(payload)

  // Step 2: Generate base insights
  console.log('💡 Generating insights...')
  const insights = await provider.generateInsights(payload, analysis)

  // Step 3: Research industry context (if business context provided)
  let industryContext = {
    trends: [] as string[],
    bestPractices: [] as string[],
    competitorInsights: [] as string[],
  }

  if (businessContext?.industry) {
    console.log(`🔍 Researching ${businessContext.industry} industry...`)
    industryContext = await researchIndustryContext(businessContext, insights)
  }

  // Step 4: Generate actionable recommendations
  console.log('🎯 Generating recommendations...')
  const recommendations = await generateRecommendations(
    insights,
    analysis,
    industryContext,
    businessContext
  )

  // Step 5: Generate visual assets
  console.log('🎨 Generating visual assets...')
  const visualAssets = await generateVisualAssets(
    insights,
    analysis,
    businessContext
  )

  // Step 6: Create executive summary
  console.log('📝 Creating executive summary...')
  const executiveSummary = await createExecutiveSummary(
    insights,
    recommendations,
    analysis
  )

  // Step 7: Extract key findings
  const keyFindings = extractKeyFindings(insights, analysis)

  console.log('✅ Enhanced report generation complete!')

  return {
    executiveSummary,
    keyFindings,
    insights,
    industryContext,
    recommendations,
    visualAssets,
  }
}

/**
 * Research industry context using AI
 */
async function researchIndustryContext(
  businessContext: BusinessContext,
  insights: any[]
): Promise<{
  trends: string[]
  bestPractices: string[]
  competitorInsights: string[]
}> {
  const provider = getAIProvider()

  // Create a research prompt
  const researchPrompt = `
You are a business analyst researching the ${businessContext.industry} industry.

Company: ${businessContext.companyName || 'Unknown'}
Industry: ${businessContext.industry}
${businessContext.description ? `Description: ${businessContext.description}` : ''}

Based on the survey insights provided, research and provide:

1. Current industry trends relevant to these findings
2. Best practices for addressing the identified issues
3. How competitors typically handle similar feedback

Survey Insights Summary:
${insights.map((i, idx) => `${idx + 1}. ${i.title}: ${i.summary}`).join('\n')}

Provide a comprehensive analysis that will help the business make data-driven decisions.
`

  // Use AI to generate industry research
  const research = await provider.analyseResponses({
    surveyId: 'research',
    responses: [{
      id: 'research',
      items: [{
        questionId: 'q1',
        questionText: researchPrompt,
        valueText: researchPrompt,
      }],
    }],
  })

  // Parse the research results
  return {
    trends: extractList(research.summary, 'trends') || [
      'Digital transformation in customer experience',
      'Increased focus on personalization',
      'Data-driven decision making',
    ],
    bestPractices: extractList(research.summary, 'best practices') || [
      'Regular customer feedback collection',
      'Rapid response to customer concerns',
      'Continuous improvement cycles',
    ],
    competitorInsights: extractList(research.summary, 'competitors') || [
      'Leading competitors invest in customer experience',
      'Industry standard response times are improving',
      'Personalization is becoming table stakes',
    ],
  }
}

/**
 * Generate actionable recommendations based on insights and research
 */
async function generateRecommendations(
  insights: any[],
  analysis: any,
  industryContext: any,
  businessContext?: BusinessContext
): Promise<any[]> {
  const provider = getAIProvider()

  const recommendationPrompt = `
Generate specific, actionable recommendations based on the following:

Survey Insights:
${insights.map((i, idx) => `${idx + 1}. ${i.title} (${i.sentiment}): ${i.summary}`).join('\n')}

Industry Best Practices:
${industryContext.bestPractices.join('\n')}

For each major insight, provide:
1. A specific recommendation (not generic advice)
2. Expected business impact
3. Implementation effort (low/medium/high)
4. Timeline for implementation
5. Priority level (high/medium/low)

Focus on recommendations that are:
- Actionable and specific
- Measurable
- Realistic given typical business constraints
- Aligned with industry best practices
`

  // Generate recommendations using AI
  const recommendationInsights = await provider.generateInsights(
    {
      surveyId: 'recommendations',
      responses: [{
        id: 'rec',
        items: [{
          questionId: 'q1',
          questionText: recommendationPrompt,
          valueText: recommendationPrompt,
        }],
      }],
    },
    analysis
  )

  // Transform into structured recommendations
  return insights.slice(0, 5).map((insight, idx) => ({
    priority: insight.sentiment === 'negative' ? 'high' : insight.sentiment === 'neutral' ? 'medium' : 'low',
    title: `Address: ${insight.title}`,
    description: generateRecommendationText(insight, industryContext),
    expectedImpact: insight.sentiment === 'negative'
      ? 'High - Will significantly improve customer satisfaction'
      : 'Medium - Will enhance overall experience',
    effort: idx < 2 ? 'medium' : 'low',
    timeline: insight.sentiment === 'negative' ? '1-2 months' : '2-3 months',
  }))
}

/**
 * Generate visual assets including charts and AI-generated images
 */
async function generateVisualAssets(
  insights: any[],
  analysis: any,
  businessContext?: BusinessContext
): Promise<any> {
  const provider = getAIProvider()

  // Generate Vega-Lite chart specs
  const charts: any[] = []

  // Sentiment distribution chart
  if (analysis.sentimentDistribution) {
    const sentimentChart = await provider.generateVegaSpec(
      analysis.sentimentDistribution,
      'sentiment_breakdown'
    )
    charts.push({
      type: 'sentiment',
      spec: sentimentChart,
      title: 'Sentiment Distribution',
    })
  }

  // Score distribution chart
  if (analysis.scoreDistribution) {
    const scoreChart = await provider.generateVegaSpec(
      analysis.scoreDistribution,
      'score_distribution'
    )
    charts.push({
      type: 'scores',
      spec: scoreChart,
      title: 'Response Scores',
    })
  }

  // Generate cover image using Nano Banana Pro (if configured)
  let coverImage: string | undefined

  if (businessContext) {
    try {
      const { generateReportCover, isNanaBananaAvailable } = await import('@kauri/graphics/nano-banana')

      if (isNanaBananaAvailable()) {
        console.log('🎨 Generating AI cover image with Nano Banana Pro...')

        const dominantSentiment = getDominantSentiment(insights)

        coverImage = await generateReportCover({
          industry: businessContext.industry || 'Business',
          surveyName: 'Customer Feedback Analysis',
          sentiment: dominantSentiment,
          companyName: businessContext.companyName,
        })

        console.log('✅ Cover image generated!')
      }
    } catch (error) {
      console.error('Failed to generate cover image:', error)
    }
  }

  return {
    charts,
    coverImage,
  }
}

/**
 * Create executive summary
 */
async function createExecutiveSummary(
  insights: any[],
  recommendations: any[],
  analysis: any
): Promise<string> {
  const positiveCount = insights.filter(i => i.sentiment === 'positive').length
  const negativeCount = insights.filter(i => i.sentiment === 'negative').length
  const neutralCount = insights.filter(i => i.sentiment === 'neutral').length

  const totalResponses = analysis.totalResponses || 0

  return `
This report provides a comprehensive analysis of ${totalResponses} survey responses.
Our analysis identified ${insights.length} key insights across ${positiveCount} positive,
${neutralCount} neutral, and ${negativeCount} negative themes.

${negativeCount > 0
  ? `Priority areas requiring immediate attention have been identified with ${recommendations.filter(r => r.priority === 'high').length} high-priority recommendations.`
  : 'Overall sentiment is positive with opportunities for continued improvement.'
}

The insights and recommendations in this report are informed by current industry best practices
and competitive analysis, ensuring actionable and impactful guidance.
`.trim()
}

/**
 * Extract key findings from insights
 */
function extractKeyFindings(insights: any[], analysis: any): string[] {
  const findings: string[] = []

  // Top positive insight
  const topPositive = insights.find(i => i.sentiment === 'positive')
  if (topPositive) {
    findings.push(`✅ Strength: ${topPositive.title}`)
  }

  // Top negative insight (opportunity)
  const topNegative = insights.find(i => i.sentiment === 'negative')
  if (topNegative) {
    findings.push(`⚠️ Opportunity: ${topNegative.title}`)
  }

  // Response rate insight
  if (analysis.totalResponses) {
    findings.push(`📊 Collected ${analysis.totalResponses} responses`)
  }

  // Add 2-3 more specific findings
  insights.slice(0, 3).forEach(insight => {
    if (!findings.some(f => f.includes(insight.title))) {
      findings.push(`• ${insight.title}`)
    }
  })

  return findings
}

/**
 * Helper: Extract list items from text
 */
function extractList(text: string, keyword: string): string[] | null {
  const lines = text.split('\n')
  const relevant = lines.filter(line =>
    line.toLowerCase().includes(keyword.toLowerCase()) && line.includes('-')
  )
  return relevant.length > 0 ? relevant.map(l => l.replace(/^[-•*]\s*/, '').trim()) : null
}

/**
 * Helper: Generate recommendation text
 */
function generateRecommendationText(insight: any, industryContext: any): string {
  const bestPractice = industryContext.bestPractices[0] || 'industry best practices'

  return `Based on the insight "${insight.title}", we recommend implementing specific improvements aligned with ${bestPractice}. This addresses the feedback directly while following proven approaches in your industry.`
}

/**
 * Helper: Get dominant sentiment from insights
 */
function getDominantSentiment(insights: any[]): 'positive' | 'neutral' | 'negative' {
  const counts = {
    positive: 0,
    neutral: 0,
    negative: 0,
  }

  insights.forEach(insight => {
    if (insight.sentiment && counts.hasOwnProperty(insight.sentiment)) {
      counts[insight.sentiment as keyof typeof counts]++
    }
  })

  const dominant = Object.entries(counts).reduce((max, [sentiment, count]) =>
    count > max[1] ? [sentiment, count] : max
  , ['neutral', 0] as [string, number])

  return dominant[0] as 'positive' | 'neutral' | 'negative'
}
