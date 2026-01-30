import { NextResponse } from 'next/server'
import { db } from '@kauri/db/client'
import { responses, responseItems, surveys, insights as insightsTable } from '@kauri/db/schema'
import { eq, count, and } from 'drizzle-orm'
import { generateSurveyInsights } from '@kauri/ai/insights'
import type { InsightPayload } from '@kauri/shared/types'

export const dynamic = 'force-dynamic'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Verify response exists
    const response = await db.query.responses.findFirst({
      where: eq(responses.id, params.id),
      with: {
        survey: {
          with: {
            questions: true,
          },
        },
        items: true,
      },
    })

    if (!response) {
      return NextResponse.json(
        { error: 'Response not found' },
        { status: 404 }
      )
    }

    if (response.status === 'completed') {
      return NextResponse.json(
        { error: 'Response is already completed' },
        { status: 400 }
      )
    }

    // Validate all required questions are answered
    const requiredQuestions = response.survey.questions.filter(
      (q) => q.required
    )
    const answeredQuestionIds = response.items.map((item) => item.questionId)

    const missingRequired = requiredQuestions.filter(
      (q) => !answeredQuestionIds.includes(q.id)
    )

    if (missingRequired.length > 0) {
      return NextResponse.json(
        {
          error: 'Missing required questions',
          missingQuestions: missingRequired.map((q) => ({
            id: q.id,
            text: q.text,
          })),
        },
        { status: 400 }
      )
    }

    // Mark as completed
    const [updatedResponse] = await db
      .update(responses)
      .set({
        status: 'completed',
        completedAt: new Date(),
      })
      .where(eq(responses.id, params.id))
      .returning()

    // --- AI INSIGHTS TRIGGER ---
    // Count total completed responses for this survey
    const surveyId = response.surveyId
    const completedCountResult = await db
      .select({ count: count() })
      .from(responses)
      .where(
        and(
          eq(responses.surveyId, surveyId),
          eq(responses.status, 'completed')
        )
      )
    
    const completedCount = completedCountResult[0]?.count || 0

    // Trigger AI analysis every 5 responses
    if (completedCount > 0 && completedCount % 5 === 0) {
      console.log(`🤖 Auto-triggering AI analysis for survey ${surveyId} (Total: ${completedCount})`)
      
      try {
        // Fetch all responses with items for analysis
        const surveyResponses = await db.query.responses.findMany({
          where: eq(responses.surveyId, surveyId),
          with: {
            items: {
              with: {
                question: true,
              },
            },
          },
        })

        // Prepare payload for AI
        const payload: InsightPayload = {
          surveyId,
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
        const result = await generateSurveyInsights(payload)

        // Save insights to database
        for (const insight of result.insights) {
          await db
            .insert(insightsTable)
            .values({
              surveyId,
              title: insight.title,
              summary: insight.summary,
              sentiment: insight.sentiment,
              evidenceJson: insight.evidence,
            })
        }
        console.log(`✅ Auto-analysis complete for survey ${surveyId}`)
      } catch (aiError) {
        console.error('Failed to auto-trigger AI analysis:', aiError)
        // Don't fail the response completion if AI fails
      }
    }
    // --- END AI TRIGGER ---

    return NextResponse.json({
      success: true,
      response: updatedResponse,
      aiTriggered: completedCount % 5 === 0,
    })
  } catch (error) {
    console.error('Error completing response:', error)
    return NextResponse.json(
      { error: 'Failed to complete response' },
      { status: 500 }
    )
  }
}
