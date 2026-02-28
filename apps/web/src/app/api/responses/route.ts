import { NextResponse } from 'next/server'
import { db } from '@kauri/db/client'
import { responses, profiles, consents, surveys } from '@kauri/db/schema'
import { z } from 'zod'
import { eq } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

const createResponseSchema = z.object({
  surveyId: z.string().uuid(),
  email: z.string().email(),
  consentGiven: z.boolean().refine((val) => val === true, {
    message: 'Consent is required to participate',
  }),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validated = createResponseSchema.parse(body)

    // Get survey to obtain tenantId
    const survey = await db.query.surveys.findFirst({
      where: eq(surveys.id, validated.surveyId),
    })

    if (!survey) {
      return NextResponse.json(
        { error: 'Survey not found' },
        { status: 404 }
      )
    }

    // Check if profile exists for this tenant, create if not
    let profile = await db.query.profiles.findFirst({
      where: eq(profiles.email, validated.email),
    })

    if (!profile) {
      const [newProfile] = await db
        .insert(profiles)
        .values({
          id: crypto.randomUUID(),
          createdAt: Date.now() as any,
          email: validated.email,
          tenantId: survey.tenantId,
        })
        .returning()
      profile = newProfile
    }

    // Create consent record
    await db.insert(consents).values({
      id: crypto.randomUUID(),
      profileId: profile.id,
      surveyId: validated.surveyId,
      consentGiven: validated.consentGiven,
      consentText: 'I consent to participate in this survey and allow my responses to be collected and analysed.',
      consentedAt: Date.now() as any,
    })

    // Create response record
    const [response] = await db
      .insert(responses)
      .values({
        id: crypto.randomUUID(),
        createdAt: Date.now() as any,
        surveyId: validated.surveyId,
        profileId: profile.id,
        status: 'in_progress',
      })
      .returning()

    return NextResponse.json({
      success: true,
      response: {
        id: response.id,
        surveyId: response.surveyId,
        status: response.status,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating response:', error)
    return NextResponse.json(
      { error: 'Failed to create response' },
      { status: 500 }
    )
  }
}
