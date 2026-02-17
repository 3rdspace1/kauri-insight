import { describe, it, expect } from 'vitest'
import {
  createSurveySchema,
  updateSurveySchema,
  createQuestionSchema,
  submitResponseItemSchema,
  updateActionSchema,
  generateInsightsSchema,
} from '../validators'

describe('createSurveySchema', () => {
  it('accepts valid input with all fields', () => {
    const result = createSurveySchema.safeParse({
      name: 'Customer Satisfaction Survey',
      type: 'general',
      status: 'active',
      language: 'en',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.name).toBe('Customer Satisfaction Survey')
      expect(result.data.type).toBe('general')
      expect(result.data.status).toBe('active')
      expect(result.data.language).toBe('en')
    }
  })

  it('accepts valid input with only required fields (name)', () => {
    const result = createSurveySchema.safeParse({
      name: 'Minimal Survey',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.name).toBe('Minimal Survey')
      expect(result.data.status).toBe('draft') // default
      expect(result.data.language).toBe('en') // default
    }
  })

  it('rejects missing name', () => {
    const result = createSurveySchema.safeParse({
      type: 'general',
    })
    expect(result.success).toBe(false)
  })

  it('rejects empty name', () => {
    const result = createSurveySchema.safeParse({
      name: '',
    })
    expect(result.success).toBe(false)
  })

  it('rejects name exceeding max length', () => {
    const result = createSurveySchema.safeParse({
      name: 'a'.repeat(256),
    })
    expect(result.success).toBe(false)
  })

  it('accepts all valid type enum values', () => {
    const validTypes = ['appointment_follow_up', 'pulse_check', 'post_emergency', 'general']
    for (const type of validTypes) {
      const result = createSurveySchema.safeParse({ name: 'Test', type })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.type).toBe(type)
      }
    }
  })

  it('rejects invalid type enum value', () => {
    const result = createSurveySchema.safeParse({
      name: 'Test',
      type: 'invalid_type',
    })
    expect(result.success).toBe(false)
  })

  it('accepts all valid status enum values', () => {
    const validStatuses = ['draft', 'active', 'paused', 'archived']
    for (const status of validStatuses) {
      const result = createSurveySchema.safeParse({ name: 'Test', status })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.status).toBe(status)
      }
    }
  })

  it('rejects invalid status enum value', () => {
    const result = createSurveySchema.safeParse({
      name: 'Test',
      status: 'deleted',
    })
    expect(result.success).toBe(false)
  })

  it('rejects language shorter than 2 characters', () => {
    const result = createSurveySchema.safeParse({
      name: 'Test',
      language: 'e',
    })
    expect(result.success).toBe(false)
  })

  it('rejects language longer than 10 characters', () => {
    const result = createSurveySchema.safeParse({
      name: 'Test',
      language: 'en-US-extra1',
    })
    expect(result.success).toBe(false)
  })
})

describe('updateSurveySchema', () => {
  it('accepts partial updates with name only', () => {
    const result = updateSurveySchema.safeParse({
      name: 'Updated Name',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.name).toBe('Updated Name')
      expect(result.data.status).toBeUndefined()
      expect(result.data.language).toBeUndefined()
    }
  })

  it('accepts partial updates with status only', () => {
    const result = updateSurveySchema.safeParse({
      status: 'active',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.status).toBe('active')
    }
  })

  it('accepts empty object (all fields optional)', () => {
    const result = updateSurveySchema.safeParse({})
    expect(result.success).toBe(true)
  })

  it('accepts full update with all fields', () => {
    const result = updateSurveySchema.safeParse({
      name: 'New Name',
      status: 'paused',
      language: 'fr',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.name).toBe('New Name')
      expect(result.data.status).toBe('paused')
      expect(result.data.language).toBe('fr')
    }
  })

  it('rejects invalid status', () => {
    const result = updateSurveySchema.safeParse({
      status: 'deleted',
    })
    expect(result.success).toBe(false)
  })

  it('rejects empty name string', () => {
    const result = updateSurveySchema.safeParse({
      name: '',
    })
    expect(result.success).toBe(false)
  })
})

describe('createQuestionSchema', () => {
  const validUuid = '550e8400-e29b-41d4-a716-446655440000'

  it('accepts valid scale question', () => {
    const result = createQuestionSchema.safeParse({
      surveyId: validUuid,
      kind: 'scale',
      text: 'Rate our service',
      scaleMin: 1,
      scaleMax: 10,
      order: 1,
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.kind).toBe('scale')
      expect(result.data.scaleMin).toBe(1)
      expect(result.data.scaleMax).toBe(10)
    }
  })

  it('accepts valid text question', () => {
    const result = createQuestionSchema.safeParse({
      surveyId: validUuid,
      kind: 'text',
      text: 'Tell us about your experience',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.kind).toBe('text')
      expect(result.data.order).toBe(0) // default
    }
  })

  it('accepts valid choice question', () => {
    const result = createQuestionSchema.safeParse({
      surveyId: validUuid,
      kind: 'choice',
      text: 'Which service did you use?',
      choicesJson: ['Service A', 'Service B', 'Service C'],
      order: 2,
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.kind).toBe('choice')
      expect(result.data.choicesJson).toEqual(['Service A', 'Service B', 'Service C'])
    }
  })

  it('rejects missing surveyId', () => {
    const result = createQuestionSchema.safeParse({
      kind: 'text',
      text: 'Question text',
    })
    expect(result.success).toBe(false)
  })

  it('rejects invalid surveyId (not a UUID)', () => {
    const result = createQuestionSchema.safeParse({
      surveyId: 'not-a-uuid',
      kind: 'text',
      text: 'Question text',
    })
    expect(result.success).toBe(false)
  })

  it('rejects missing kind', () => {
    const result = createQuestionSchema.safeParse({
      surveyId: validUuid,
      text: 'Question text',
    })
    expect(result.success).toBe(false)
  })

  it('rejects invalid kind', () => {
    const result = createQuestionSchema.safeParse({
      surveyId: validUuid,
      kind: 'rating',
      text: 'Question text',
    })
    expect(result.success).toBe(false)
  })

  it('rejects missing text', () => {
    const result = createQuestionSchema.safeParse({
      surveyId: validUuid,
      kind: 'text',
    })
    expect(result.success).toBe(false)
  })

  it('rejects empty text', () => {
    const result = createQuestionSchema.safeParse({
      surveyId: validUuid,
      kind: 'text',
      text: '',
    })
    expect(result.success).toBe(false)
  })

  it('rejects non-integer scaleMin', () => {
    const result = createQuestionSchema.safeParse({
      surveyId: validUuid,
      kind: 'scale',
      text: 'Rate us',
      scaleMin: 1.5,
      scaleMax: 10,
    })
    expect(result.success).toBe(false)
  })

  it('rejects non-integer order', () => {
    const result = createQuestionSchema.safeParse({
      surveyId: validUuid,
      kind: 'text',
      text: 'Question',
      order: 1.5,
    })
    expect(result.success).toBe(false)
  })
})

describe('submitResponseItemSchema', () => {
  const validUuid = '550e8400-e29b-41d4-a716-446655440000'

  it('accepts valid text response', () => {
    const result = submitResponseItemSchema.safeParse({
      questionId: validUuid,
      valueText: 'Great experience overall',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.valueText).toBe('Great experience overall')
      expect(result.data.valueNum).toBeUndefined()
      expect(result.data.valueChoice).toBeUndefined()
    }
  })

  it('accepts valid numeric response', () => {
    const result = submitResponseItemSchema.safeParse({
      questionId: validUuid,
      valueNum: 8,
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.valueNum).toBe(8)
    }
  })

  it('accepts valid choice response', () => {
    const result = submitResponseItemSchema.safeParse({
      questionId: validUuid,
      valueChoice: 'Service A',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.valueChoice).toBe('Service A')
    }
  })

  it('accepts response with multiple value types', () => {
    const result = submitResponseItemSchema.safeParse({
      questionId: validUuid,
      valueText: 'Additional comments',
      valueNum: 5,
    })
    expect(result.success).toBe(true)
  })

  it('rejects missing questionId', () => {
    const result = submitResponseItemSchema.safeParse({
      valueText: 'Some text',
    })
    expect(result.success).toBe(false)
  })

  it('rejects invalid questionId (not a UUID)', () => {
    const result = submitResponseItemSchema.safeParse({
      questionId: 'invalid',
      valueText: 'Some text',
    })
    expect(result.success).toBe(false)
  })

  it('rejects non-integer valueNum', () => {
    const result = submitResponseItemSchema.safeParse({
      questionId: validUuid,
      valueNum: 3.14,
    })
    expect(result.success).toBe(false)
  })

  it('accepts questionId only (all value fields optional)', () => {
    const result = submitResponseItemSchema.safeParse({
      questionId: validUuid,
    })
    expect(result.success).toBe(true)
  })
})

describe('updateActionSchema', () => {
  it('accepts valid status "open"', () => {
    const result = updateActionSchema.safeParse({ status: 'open' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.status).toBe('open')
    }
  })

  it('accepts valid status "doing"', () => {
    const result = updateActionSchema.safeParse({ status: 'doing' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.status).toBe('doing')
    }
  })

  it('accepts valid status "done"', () => {
    const result = updateActionSchema.safeParse({ status: 'done' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.status).toBe('done')
    }
  })

  it('rejects invalid status', () => {
    const result = updateActionSchema.safeParse({ status: 'cancelled' })
    expect(result.success).toBe(false)
  })

  it('rejects missing status', () => {
    const result = updateActionSchema.safeParse({})
    expect(result.success).toBe(false)
  })

  it('rejects non-string status', () => {
    const result = updateActionSchema.safeParse({ status: 1 })
    expect(result.success).toBe(false)
  })
})

describe('generateInsightsSchema', () => {
  it('accepts valid UUID for surveyId', () => {
    const result = generateInsightsSchema.safeParse({
      surveyId: '550e8400-e29b-41d4-a716-446655440000',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.surveyId).toBe('550e8400-e29b-41d4-a716-446655440000')
    }
  })

  it('accepts another valid UUID format', () => {
    const result = generateInsightsSchema.safeParse({
      surveyId: '123e4567-e89b-12d3-a456-426614174000',
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid UUID', () => {
    const result = generateInsightsSchema.safeParse({
      surveyId: 'not-a-valid-uuid',
    })
    expect(result.success).toBe(false)
  })

  it('rejects empty string', () => {
    const result = generateInsightsSchema.safeParse({
      surveyId: '',
    })
    expect(result.success).toBe(false)
  })

  it('rejects missing surveyId', () => {
    const result = generateInsightsSchema.safeParse({})
    expect(result.success).toBe(false)
  })

  it('rejects numeric surveyId', () => {
    const result = generateInsightsSchema.safeParse({
      surveyId: 12345,
    })
    expect(result.success).toBe(false)
  })
})
