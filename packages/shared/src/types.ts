// Survey types
export type SurveyStatus = 'draft' | 'active' | 'paused' | 'archived'
export type SurveyType = 'appointment_follow_up' | 'pulse_check' | 'post_emergency' | 'general'
export type QuestionKind = 'scale' | 'text' | 'choice'
export type MembershipRole = 'owner' | 'staff' | 'viewer'
export type ActionStatus = 'open' | 'doing' | 'done'
export type ActionKind = 'alert' | 'follow_up' | 'review'
export type SourceKind = 'website' | 'csv' | 'manual'
export type Sentiment = 'positive' | 'neutral' | 'negative'

// Rule types
export interface TriggerRule {
  type: 'range' | 'keyword' | 'choice'
  min?: number
  max?: number
  keywords?: string[]
  choices?: string[]
}

export interface AdaptiveRule {
  trigger: TriggerRule
  probe?: string
  action?: string
}

// Evidence types
export interface Evidence {
  text: string
  responseId: string
  sentiment?: Sentiment
  confidence?: number
}

// Chart types
export interface VegaSpec {
  $schema: string
  description?: string
  data: any
  mark: any
  encoding?: any
  layer?: any[]
  [key: string]: any
}

// API response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Insight types
export interface InsightPayload {
  surveyId: string
  responses: Array<{
    id: string
    items: Array<{
      questionId: string
      questionText: string
      valueText?: string
      valueNum?: number
      valueChoice?: string
    }>
  }>
}

export interface AnalysisResult {
  sentiment: {
    positive: number
    neutral: number
    negative: number
  }
  themes: Array<{
    theme: string
    count: number
    examples: string[]
  }>
  outliers: Array<{
    responseId: string
    reason: string
  }>
}

// Report types
export interface ReportSection {
  heading: string
  body: string
  metrics?: Record<string, any>
  chartRefs?: string[]
}

export interface Report {
  title: string
  executiveSummary: string
  sections: ReportSection[]
}

// Domain pack types
export interface DomainPack {
  name: string
  description: string
  industry: string
  questions: Array<{
    text: string
    kind: QuestionKind
    scaleMin?: number
    scaleMax?: number
    choices?: string[]
    rules?: AdaptiveRule[]
  }>
  actions: Array<{
    kind: ActionKind
    title: string
    triggerCondition: string
  }>
}
