import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'
import * as dotenv from 'dotenv'

dotenv.config({ path: '../../.env' })

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set')
}

async function seed() {
  console.log('🌱 Seeding database...')

  const client = postgres(connectionString!, { max: 1 })
  const db = drizzle(client, { schema })

  // Create demo user
  const [demoUser] = await db
    .insert(schema.users)
    .values({
      email: 'demo@example.com',
      name: 'Demo User',
    })
    .returning()

  console.log('✅ Created demo user:', demoUser.email)

  // Create demo tenant
  const [demoTenant] = await db
    .insert(schema.tenants)
    .values({
      name: 'Demo Organisation',
      slug: 'demo-org',
    })
    .returning()

  console.log('✅ Created demo tenant:', demoTenant.name)

  // Create membership
  await db.insert(schema.memberships).values({
    tenantId: demoTenant.id,
    userId: demoUser.id,
    role: 'owner',
  })

  console.log('✅ Created membership')

  // Create demo survey
  const [demoSurvey] = await db
    .insert(schema.surveys)
    .values({
      tenantId: demoTenant.id,
      name: 'Appointment Follow Up',
      status: 'active',
      type: 'appointment_follow_up',
    })
    .returning()

  console.log('✅ Created demo survey:', demoSurvey.name)

  // Create questions
  const [q1] = await db
    .insert(schema.questions)
    .values({
      surveyId: demoSurvey.id,
      kind: 'scale',
      text: 'How satisfied were you with your appointment?',
      scaleMin: 1,
      scaleMax: 5,
      order: 1,
    })
    .returning()

  const [q2] = await db
    .insert(schema.questions)
    .values({
      surveyId: demoSurvey.id,
      kind: 'scale',
      text: 'How likely are you to recommend us to a friend or colleague?',
      scaleMin: 0,
      scaleMax: 10,
      order: 2,
    })
    .returning()

  const [q3] = await db
    .insert(schema.questions)
    .values({
      surveyId: demoSurvey.id,
      kind: 'text',
      text: 'Is there anything else you would like to share?',
      order: 3,
    })
    .returning()

  console.log('✅ Created 3 questions')

  // Create adaptive rule for low satisfaction
  await db.insert(schema.questionRules).values({
    surveyId: demoSurvey.id,
    questionId: q1.id,
    rulesJson: {
      trigger: {
        type: 'range',
        min: 1,
        max: 3,
      },
      probe: 'What could we have done better?',
      action: 'alert_low_satisfaction',
    },
  })

  console.log('✅ Created adaptive rule for low satisfaction')

  // Create a few sample profiles
  const [profile1] = await db
    .insert(schema.profiles)
    .values({
      tenantId: demoTenant.id,
      email: 'respondent1@example.com',
      name: 'Alice Johnson',
      consented: true,
    })
    .returning()

  const [profile2] = await db
    .insert(schema.profiles)
    .values({
      tenantId: demoTenant.id,
      email: 'respondent2@example.com',
      name: 'Bob Smith',
      consented: true,
    })
    .returning()

  console.log('✅ Created sample profiles')

  // Create sample responses
  const [response1] = await db
    .insert(schema.responses)
    .values({
      surveyId: demoSurvey.id,
      profileId: profile1.id,
      completedAt: new Date(),
    })
    .returning()

  await db.insert(schema.responseItems).values([
    {
      responseId: response1.id,
      questionId: q1.id,
      valueNum: 5,
    },
    {
      responseId: response1.id,
      questionId: q2.id,
      valueNum: 9,
    },
    {
      responseId: response1.id,
      questionId: q3.id,
      valueText: 'Great service, very professional!',
    },
  ])

  const [response2] = await db
    .insert(schema.responses)
    .values({
      surveyId: demoSurvey.id,
      profileId: profile2.id,
      completedAt: new Date(),
    })
    .returning()

  await db.insert(schema.responseItems).values([
    {
      responseId: response2.id,
      questionId: q1.id,
      valueNum: 2,
    },
    {
      responseId: response2.id,
      questionId: q2.id,
      valueNum: 3,
    },
    {
      responseId: response2.id,
      questionId: q3.id,
      valueText: 'Had to wait too long, and staff seemed rushed.',
    },
  ])

  console.log('✅ Created sample responses')

  // Create sample insight
  await db.insert(schema.insights).values({
    surveyId: demoSurvey.id,
    title: 'Mixed satisfaction scores',
    summary:
      'While some respondents are very satisfied, there are concerns about wait times and staff availability that need attention.',
    sentiment: 'neutral',
    evidenceJson: [
      {
        text: 'Had to wait too long, and staff seemed rushed.',
        responseId: response2.id,
        sentiment: 'negative',
      },
      {
        text: 'Great service, very professional!',
        responseId: response1.id,
        sentiment: 'positive',
      },
    ],
  })

  console.log('✅ Created sample insight')

  // Create sample action
  await db.insert(schema.actions).values({
    surveyId: demoSurvey.id,
    kind: 'follow_up',
    status: 'open',
    title: 'Follow up with Bob Smith regarding wait time concerns',
    payloadJson: {
      responseId: response2.id,
      priority: 'high',
    },
  })

  console.log('✅ Created sample action')

  await client.end()
  console.log('🎉 Seeding completed!')
  process.exit(0)
}

seed().catch((error) => {
  console.error('❌ Seeding failed')
  console.error(error)
  process.exit(1)
})
