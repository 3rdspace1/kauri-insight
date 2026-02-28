import { drizzle } from 'drizzle-orm/libsql'
import { createClient } from '@libsql/client'
import * as schema from './schema'
import * as dotenv from 'dotenv'

dotenv.config({ path: '../../.env' })

const dbUrl = process.env.LOCAL_DB_PATH || process.env.DATABASE_URL || 'file:local.db'
const authToken = process.env.DATABASE_AUTH_TOKEN

async function seed() {
  console.log('🌱 Seeding database on:', dbUrl)

  const client = createClient({
    url: dbUrl,
    authToken: authToken,
  })

  // We have to cast the client to any because the types in the seed script
  // don't perfectly match the factory function export, but that's fine for the seed script
  const db = drizzle(client, { schema })

  // Helper to generate UUIDs since SQLite doesn't do it automatically
  const uuid = () => crypto.randomUUID()
  const now = () => new Date()

  // Create demo user
  const [demoUser] = await db
    .insert(schema.users)
    .values({
      id: uuid(),
      email: 'demo@example.com',
      name: 'Demo User',
      createdAt: now(),
    } as any)
    .returning()

  console.log('✅ Created demo user:', demoUser.email)

  // Create demo tenant
  const [demoTenant] = await db
    .insert(schema.tenants)
    .values({
      id: uuid(),
      name: 'Demo Organisation',
      slug: 'demo-org',
      createdAt: now(),
    } as any)
    .returning()

  console.log('✅ Created demo tenant:', demoTenant.name)

  // Create membership
  await db.insert(schema.memberships).values({
    id: uuid(),
    tenantId: demoTenant.id,
    userId: demoUser.id,
    role: 'owner',
    createdAt: now(),
  } as any)

  console.log('✅ Created membership')

  // Create demo survey
  const [demoSurvey] = await db
    .insert(schema.surveys)
    .values({
      id: uuid(),
      tenantId: demoTenant.id,
      name: 'Appointment Follow Up',
      title: 'Appointment Follow Up',
      status: 'active',
      type: 'appointment_follow_up',
      createdAt: now(),
    } as any)
    .returning()

  console.log('✅ Created demo survey:', demoSurvey.name)

  // Create questions
  const [q1] = await db
    .insert(schema.questions)
    .values({
      id: uuid(),
      surveyId: demoSurvey.id,
      kind: 'scale',
      text: 'How satisfied were you with your appointment?',
      type: 'scale',
      scaleMin: 1,
      scaleMax: 5,
      orderIndex: 1,
      createdAt: now(),
    } as any)
    .returning()

  const [q2] = await db
    .insert(schema.questions)
    .values({
      id: uuid(),
      surveyId: demoSurvey.id,
      kind: 'scale',
      text: 'How likely are you to recommend us to a friend or colleague?',
      type: 'scale',
      scaleMin: 0,
      scaleMax: 10,
      orderIndex: 2,
      createdAt: now(),
    } as any)
    .returning()

  const [q3] = await db
    .insert(schema.questions)
    .values({
      id: uuid(),
      surveyId: demoSurvey.id,
      kind: 'text',
      text: 'Is there anything else you would like to share?',
      type: 'text',
      orderIndex: 3,
      createdAt: now(),
    } as any)
    .returning()

  console.log('✅ Created 3 questions')

  // Create adaptive rule for low satisfaction
  await db.insert(schema.questionRules).values({
    id: uuid(),
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
    createdAt: now(),
  } as any)

  console.log('✅ Created adaptive rule for low satisfaction')

  // Create a few sample profiles
  const [profile1] = await db
    .insert(schema.profiles)
    .values({
      id: uuid(),
      tenantId: demoTenant.id,
      email: 'respondent1@example.com',
      name: 'Alice Johnson',
      consented: true,
      createdAt: now(),
    } as any)
    .returning()

  const [profile2] = await db
    .insert(schema.profiles)
    .values({
      id: uuid(),
      tenantId: demoTenant.id,
      email: 'respondent2@example.com',
      name: 'Bob Smith',
      consented: true,
      createdAt: now(),
    } as any)
    .returning()

  console.log('✅ Created sample profiles')

  // Create sample responses
  const [response1] = await db
    .insert(schema.responses)
    .values({
      id: uuid(),
      surveyId: demoSurvey.id,
      profileId: profile1.id,
      completedAt: now(),
      createdAt: now(),
    } as any)
    .returning()

  await db.insert(schema.responseItems).values([
    {
      id: uuid(),
      responseId: response1.id,
      questionId: q1.id,
      valueNum: 5,
      createdAt: now(),
    },
    {
      id: uuid(),
      responseId: response1.id,
      questionId: q2.id,
      valueNum: 9,
      createdAt: now(),
    },
    {
      id: uuid(),
      responseId: response1.id,
      questionId: q3.id,
      valueText: 'Great service, very professional!',
      createdAt: now(),
    },
  ] as any)

  const [response2] = await db
    .insert(schema.responses)
    .values({
      id: uuid(),
      surveyId: demoSurvey.id,
      profileId: profile2.id,
      completedAt: now(),
      createdAt: now(),
    } as any)
    .returning()

  await db.insert(schema.responseItems).values([
    {
      id: uuid(),
      responseId: response2.id,
      questionId: q1.id,
      valueNum: 2,
      createdAt: now(),
    },
    {
      id: uuid(),
      responseId: response2.id,
      questionId: q2.id,
      valueNum: 3,
      createdAt: now(),
    },
    {
      id: uuid(),
      responseId: response2.id,
      questionId: q3.id,
      valueText: 'Had to wait too long, and staff seemed rushed.',
      createdAt: now(),
    },
  ] as any)

  console.log('✅ Created sample responses')

  // Create sample insight
  await db.insert(schema.insights).values({
    id: uuid(),
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
    createdAt: now(),
  } as any)

  console.log('✅ Created sample insight')

  // Create sample action
  await db.insert(schema.actions).values({
    id: uuid(),
    surveyId: demoSurvey.id,
    kind: 'follow_up',
    status: 'open',
    title: 'Follow up with Bob Smith regarding wait time concerns',
    payloadJson: {
      responseId: response2.id,
      priority: 'high',
    },
    createdAt: now(),
  } as any)

  console.log('✅ Created sample action')

  console.log('🎉 Seeding completed!')
  process.exit(0)
}

seed().catch((error) => {
  console.error('❌ Seeding failed')
  console.error(error)
  process.exit(1)
})
