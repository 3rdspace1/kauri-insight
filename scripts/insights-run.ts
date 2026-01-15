#!/usr/bin/env tsx

import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from '../packages/db/src/schema'
import { eq } from 'drizzle-orm'
import { generateSurveyInsights } from '../packages/ai/src/insights/orchestrator'
import type { InsightPayload } from '../packages/shared/src/types'
import * as dotenv from 'dotenv'

dotenv.config()

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  console.error('❌ DATABASE_URL environment variable is not set')
  process.exit(1)
}

async function runInsightsGeneration() {
  console.log('🔍 Running insights generation...')

  const client = postgres(connectionString!, { max: 1 })
  const db = drizzle(client, { schema })

  // Find the demo survey
  const survey = await db.query.surveys.findFirst({
    where: eq(schema.surveys.name, 'Appointment Follow Up'),
  })

  if (!survey) {
    console.error('❌ Demo survey not found. Run pnpm db:seed first.')
    await client.end()
    process.exit(1)
  }

  console.log(`✅ Found survey: ${survey.name}`)

  // Fetch all responses
  const surveyResponses = await db.query.responses.findMany({
    where: eq(schema.responses.surveyId, survey.id),
    with: {
      items: {
        with: {
          question: true,
        },
      },
    },
  })

  if (surveyResponses.length === 0) {
    console.error('❌ No responses found. Generate synthetic responses first:')
    console.error('   pnpm gen:synthetic')
    await client.end()
    process.exit(1)
  }

  console.log(`✅ Found ${surveyResponses.length} responses`)

  // Prepare payload
  const payload: InsightPayload = {
    surveyId: survey.id,
    responses: surveyResponses.map((r) => ({
      id: r.id,
      items: r.items.map((item) => ({
        questionId: item.questionId,
        questionText: item.question.text,
        valueText: item.valueText || undefined,
        valueNum: item.valueNum || undefined,
        valueChoice: item.valueChoice || undefined,
      })),
    })),
  }

  // Generate insights
  console.log('🧠 Generating insights with AI provider...')
  const result = await generateSurveyInsights(payload)

  console.log('\n📊 Analysis Results:')
  console.log(JSON.stringify(result.analysis, null, 2))

  console.log('\n💡 Generated Insights:')
  result.insights.forEach((insight, index) => {
    console.log(`\n${index + 1}. ${insight.title}`)
    console.log(`   Sentiment: ${insight.sentiment}`)
    console.log(`   Summary: ${insight.summary}`)
    console.log(`   Evidence count: ${insight.evidence.length}`)
  })

  // Save insights to database
  console.log('\n💾 Saving insights to database...')
  for (const insight of result.insights) {
    await db.insert(schema.insights).values({
      surveyId: survey.id,
      title: insight.title,
      summary: insight.summary,
      sentiment: insight.sentiment,
      evidenceJson: insight.evidence,
    })
  }

  console.log(`✅ Saved ${result.insights.length} insights to database`)

  await client.end()
  console.log('\n🎉 Insights generation complete!')
  process.exit(0)
}

runInsightsGeneration().catch((error) => {
  console.error('❌ Failed to generate insights')
  console.error(error)
  process.exit(1)
})
