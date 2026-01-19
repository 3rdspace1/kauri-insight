import { NextResponse } from 'next/server'
import { db } from '@kauri/db/client'
import { responses, profiles, consents } from '@kauri/db/schema'
import { z } from 'zod'
import { eq } from 'drizzle-orm'

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

    // Check if profile exists, create if not
    let profile = await db.query.profiles.findFirst({
      where: eq(profiles.email, validated.email),
    })

    if (!profile) {
      const [newProfile] = await db
        .insert(profiles)
        .values({
          email: validated.email,
        })
        .returning()
      profile = newProfile
    }

    // Create consent record
    await db.insert(consents).values({
      profileId: profile.id,
      surveyId: validated.surveyId,
      consentGiven: validated.consentGiven,
      consentText: 'I consent to participate in this survey and allow my responses to be collected and analysed.',
      consentedAt: new Date(),
    })

    // Create response record
    const [response] = await db
      .insert(responses)
      .values({
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
