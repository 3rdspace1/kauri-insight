#!/usr/bin/env tsx

import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from '../packages/db/src/schema'
import { eq } from 'drizzle-orm'
import * as dotenv from 'dotenv'

dotenv.config()

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  console.error('❌ DATABASE_URL environment variable is not set')
  process.exit(1)
}

const NUM_RESPONSES = parseInt(process.argv[2] || '10', 10)

async function generateSyntheticResponses() {
  console.log(`🤖 Generating ${NUM_RESPONSES} synthetic responses...`)

  const client = postgres(connectionString!, { max: 1 })
  const db = drizzle(client, { schema })

  // Find the demo survey
  const survey = await db.query.surveys.findFirst({
    where: eq(schema.surveys.name, 'Appointment Follow Up'),
    with: {
      questions: true,
    },
  })

  if (!survey) {
    console.error('❌ Demo survey not found. Run pnpm db:seed first.')
    await client.end()
    process.exit(1)
  }

  console.log(`✅ Found survey: ${survey.name}`)

  // Get tenant to create profiles
  const tenant = await db.query.tenants.findFirst({
    where: eq(schema.tenants.id, survey.tenantId),
  })

  if (!tenant) {
    console.error('❌ Tenant not found')
    await client.end()
    process.exit(1)
  }

  const sampleComments = [
    'Very satisfied with the service!',
    'Professional and courteous staff.',
    'Had to wait a bit long, but overall good.',
    'Disappointed with the wait time.',
    'Excellent experience, will definitely return.',
    'Staff seemed rushed and unfriendly.',
    'Quick and efficient service.',
    'Could use improvement in communication.',
    'Outstanding! Exceeded my expectations.',
    'Average experience, nothing special.',
  ]

  for (let i = 0; i < NUM_RESPONSES; i++) {
    // Create profile
    const [profile] = await db
      .insert(schema.profiles)
      .values({
        tenantId: tenant.id,
        email: `respondent${Date.now()}-${i}@example.com`,
        name: `Respondent ${i + 1}`,
        consented: true,
      })
      .returning()

    // Create response
    const [response] = await db
      .insert(schema.responses)
      .values({
        surveyId: survey.id,
        profileId: profile.id,
        completedAt: new Date(),
      })
      .returning()

    // Generate scores (weighted towards positive)
    const satisfactionScore = Math.random() < 0.7 ? Math.floor(Math.random() * 2) + 4 : Math.floor(Math.random() * 3) + 1
    const npsScore = Math.random() < 0.6 ? Math.floor(Math.random() * 3) + 8 : Math.floor(Math.random() * 6) + 1
    const comment = sampleComments[Math.floor(Math.random() * sampleComments.length)]

    // Submit response items
    const items = []
    for (const question of survey.questions) {
      if (question.kind === 'scale' && question.order === 1) {
        items.push({
          responseId: response.id,
          questionId: question.id,
          valueNum: satisfactionScore,
        })
      } else if (question.kind === 'scale' && question.order === 2) {
        items.push({
          responseId: response.id,
          questionId: question.id,
          valueNum: npsScore,
        })
      } else if (question.kind === 'text') {
        items.push({
          responseId: response.id,
          questionId: question.id,
          valueText: comment,
        })
      }
    }

    await db.insert(schema.responseItems).values(items)

    console.log(`✅ Generated response ${i + 1}/${NUM_RESPONSES} (satisfaction: ${satisfactionScore}/5, NPS: ${npsScore}/10)`)
  }

  await client.end()
  console.log(`🎉 Successfully generated ${NUM_RESPONSES} synthetic responses!`)
  process.exit(0)
}

generateSyntheticResponses().catch((error) => {
  console.error('❌ Failed to generate synthetic responses')
  console.error(error)
  process.exit(1)
})
