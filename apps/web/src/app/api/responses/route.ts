export const runtime = 'edge'

import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { responses, profiles, consents } from '@kauri/db/schema'
import { eq } from 'drizzle-orm'
import { createSuccessResponse, createErrorResponse, ApiError } from '@kauri/shared/middleware'

// POST /api/responses - Create a new response (from runtime survey)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { surveyId, email, consentGiven } = body

    if (!surveyId) {
      throw new ApiError(400, 'surveyId is required')
    }

    const survey = await db.query.surveys.findFirst({
      where: eq(responses.surveyId, surveyId),
    })

    // Check survey exists
    const surveyCheck = await db.query.surveys.findFirst({
      where: eq(responses.surveyId, surveyId),
      with: { questions: true },
    })

    if (!surveyCheck) {
      throw new ApiError(404, 'Survey not found')
    }

    // Create or find profile
    let profileId: string | null = null
    if (email) {
      const existingProfile = await db.query.profiles.findFirst({
        where: eq(profiles.email, email),
      })

      if (existingProfile) {
        profileId = existingProfile.id
      } else {
        const [newProfile] = await db
          .insert(profiles)
          .values({
            id: crypto.randomUUID(),
            tenantId: surveyCheck.tenantId,
            email,
            consented: consentGiven || false,
            createdAt: new Date(),
          })
          .returning()
        profileId = newProfile.id
      }

      // Record consent
      if (consentGiven && profileId) {
        await db.insert(consents).values({
          id: crypto.randomUUID(),
          profileId,
          surveyId,
          consentGiven: true,
          consentText: 'I consent to participate in this survey',
          consentedAt: new Date(),
        })
      }
    }

    // Create response record
    const [response] = await db
      .insert(responses)
      .values({
        id: crypto.randomUUID(),
        surveyId,
        profileId,
        status: 'in_progress',
        createdAt: new Date(),
      })
      .returning()

    return createSuccessResponse({ response }, 201)
  } catch (error) {
    return createErrorResponse(error)
  }
}
