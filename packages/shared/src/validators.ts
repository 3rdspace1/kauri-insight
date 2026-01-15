import { z } from 'zod'

// Survey validators
export const createSurveySchema = z.object({
  name: z.string().min(1).max(255),
  type: z.enum(['appointment_follow_up', 'pulse_check', 'post_emergency', 'general']).optional(),
  status: z.enum(['draft', 'active', 'paused', 'archived']).default('draft'),
})

export const updateSurveySchema = z.object({
  name: z.string().min(1).max(255).optional(),
  status: z.enum(['draft', 'active', 'paused', 'archived']).optional(),
})

// Question validators
export const createQuestionSchema = z.object({
  surveyId: z.string().uuid(),
  kind: z.enum(['scale', 'text', 'choice']),
  text: z.string().min(1),
  scaleMin: z.number().int().optional(),
  scaleMax: z.number().int().optional(),
  choicesJson: z.array(z.string()).optional(),
  order: z.number().int().default(0),
})

// Response validators
export const submitResponseItemSchema = z.object({
  questionId: z.string().uuid(),
  valueText: z.string().optional(),
  valueNum: z.number().int().optional(),
  valueChoice: z.string().optional(),
})

// Action validators
export const updateActionSchema = z.object({
  status: z.enum(['open', 'doing', 'done']),
})

// Source validators
export const createSourceSchema = z.object({
  kind: z.enum(['website', 'csv', 'manual']),
  locator: z.string().min(1),
  contentJson: z.any().optional(),
})

// Insight validators
export const generateInsightsSchema = z.object({
  surveyId: z.string().uuid(),
})

// Report validators
export const exportReportSchema = z.object({
  surveyId: z.string().uuid(),
  format: z.enum(['pdf', 'pptx']),
})
