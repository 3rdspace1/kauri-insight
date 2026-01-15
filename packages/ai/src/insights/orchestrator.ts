import { getAIProvider } from '../provider'
import type { InsightPayload } from '@kauri/shared/types'

export async function generateSurveyInsights(payload: InsightPayload) {
  const provider = getAIProvider()

  console.log(`📊 Analysing ${payload.responses.length} responses...`)

  // Step 1: Analyse responses
  const analysis = await provider.analyseResponses(payload)

  console.log('✅ Analysis complete:', analysis)

  // Step 2: Generate insights
  const insights = await provider.generateInsights(payload, analysis)

  console.log(`✅ Generated ${insights.length} insights`)

  return {
    analysis,
    insights,
  }
}

export async function generateReport(surveyId: string, insights: any[], metrics: any) {
  const provider = getAIProvider()

  console.log(`📄 Generating report for survey ${surveyId}...`)

  const report = await provider.draftReport(insights, metrics)

  console.log('✅ Report generated')

  return report
}
