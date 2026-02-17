import { describe, it, expect } from 'vitest'
import type {
  SurveyStatus,
  SurveyType,
  QuestionKind,
  MembershipRole,
  ActionStatus,
  ActionKind,
  SourceKind,
  Sentiment,
  TriggerRule,
  AdaptiveRule,
  Evidence,
  VegaSpec,
  ApiResponse,
  InsightPayload,
  AnalysisResult,
  ReportSection,
  Report,
  DomainPack,
} from '../types'

describe('SurveyStatus type', () => {
  it('accepts valid survey status values', () => {
    const statuses: SurveyStatus[] = ['draft', 'active', 'paused', 'archived']
    expect(statuses).toHaveLength(4)
    expect(statuses).toContain('draft')
    expect(statuses).toContain('active')
    expect(statuses).toContain('paused')
    expect(statuses).toContain('archived')
  })
})

describe('SurveyType type', () => {
  it('accepts valid survey type values', () => {
    const types: SurveyType[] = ['appointment_follow_up', 'pulse_check', 'post_emergency', 'general']
    expect(types).toHaveLength(4)
    expect(types).toContain('general')
    expect(types).toContain('appointment_follow_up')
  })
})

describe('QuestionKind type', () => {
  it('accepts valid question kind values', () => {
    const kinds: QuestionKind[] = ['scale', 'text', 'choice']
    expect(kinds).toHaveLength(3)
  })
})

describe('MembershipRole type', () => {
  it('accepts valid membership role values', () => {
    const roles: MembershipRole[] = ['owner', 'staff', 'viewer']
    expect(roles).toHaveLength(3)
  })
})

describe('ActionStatus type', () => {
  it('accepts valid action status values', () => {
    const statuses: ActionStatus[] = ['open', 'doing', 'done']
    expect(statuses).toHaveLength(3)
  })
})

describe('ActionKind type', () => {
  it('accepts valid action kind values', () => {
    const kinds: ActionKind[] = ['alert', 'follow_up', 'review']
    expect(kinds).toHaveLength(3)
  })
})

describe('SourceKind type', () => {
  it('accepts valid source kind values', () => {
    const kinds: SourceKind[] = ['website', 'csv', 'manual']
    expect(kinds).toHaveLength(3)
  })
})

describe('Sentiment type', () => {
  it('accepts valid sentiment values', () => {
    const sentiments: Sentiment[] = ['positive', 'neutral', 'negative']
    expect(sentiments).toHaveLength(3)
  })
})

describe('TriggerRule interface', () => {
  it('conforms to range trigger rule', () => {
    const rule: TriggerRule = {
      type: 'range',
      min: 1,
      max: 5,
    }
    expect(rule.type).toBe('range')
    expect(rule.min).toBe(1)
    expect(rule.max).toBe(5)
  })

  it('conforms to keyword trigger rule', () => {
    const rule: TriggerRule = {
      type: 'keyword',
      keywords: ['urgent', 'complaint'],
    }
    expect(rule.type).toBe('keyword')
    expect(rule.keywords).toEqual(['urgent', 'complaint'])
  })

  it('conforms to choice trigger rule', () => {
    const rule: TriggerRule = {
      type: 'choice',
      choices: ['unsatisfied', 'very unsatisfied'],
    }
    expect(rule.type).toBe('choice')
    expect(rule.choices).toEqual(['unsatisfied', 'very unsatisfied'])
  })
})

describe('AdaptiveRule interface', () => {
  it('conforms to adaptive rule with probe and action', () => {
    const rule: AdaptiveRule = {
      trigger: { type: 'range', min: 1, max: 3 },
      probe: 'Can you tell us more about your experience?',
      action: 'Create follow-up task',
    }
    expect(rule.trigger.type).toBe('range')
    expect(rule.probe).toBeDefined()
    expect(rule.action).toBeDefined()
  })

  it('conforms to adaptive rule with trigger only', () => {
    const rule: AdaptiveRule = {
      trigger: { type: 'keyword', keywords: ['help'] },
    }
    expect(rule.trigger.type).toBe('keyword')
    expect(rule.probe).toBeUndefined()
    expect(rule.action).toBeUndefined()
  })
})

describe('Evidence interface', () => {
  it('conforms to evidence with all fields', () => {
    const evidence: Evidence = {
      text: 'The service was excellent',
      responseId: 'resp-123',
      sentiment: 'positive',
      confidence: 0.95,
    }
    expect(evidence.text).toBe('The service was excellent')
    expect(evidence.responseId).toBe('resp-123')
    expect(evidence.sentiment).toBe('positive')
    expect(evidence.confidence).toBe(0.95)
  })

  it('conforms to evidence with only required fields', () => {
    const evidence: Evidence = {
      text: 'Some feedback',
      responseId: 'resp-456',
    }
    expect(evidence.text).toBeDefined()
    expect(evidence.responseId).toBeDefined()
    expect(evidence.sentiment).toBeUndefined()
    expect(evidence.confidence).toBeUndefined()
  })
})

describe('VegaSpec interface', () => {
  it('conforms to a basic vega-lite spec', () => {
    const spec: VegaSpec = {
      $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
      description: 'A bar chart',
      data: { values: [{ x: 1, y: 2 }] },
      mark: 'bar',
      encoding: {
        x: { field: 'x', type: 'quantitative' },
        y: { field: 'y', type: 'quantitative' },
      },
    }
    expect(spec.$schema).toContain('vega-lite')
    expect(spec.mark).toBe('bar')
    expect(spec.data.values).toHaveLength(1)
  })

  it('conforms to a layered vega-lite spec', () => {
    const spec: VegaSpec = {
      $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
      data: { values: [] },
      mark: 'point',
      layer: [
        { mark: 'line', encoding: {} },
        { mark: 'point', encoding: {} },
      ],
    }
    expect(spec.layer).toHaveLength(2)
  })
})

describe('ApiResponse interface', () => {
  it('conforms to a successful response', () => {
    const response: ApiResponse<{ id: string }> = {
      success: true,
      data: { id: '123' },
    }
    expect(response.success).toBe(true)
    expect(response.data?.id).toBe('123')
    expect(response.error).toBeUndefined()
  })

  it('conforms to an error response', () => {
    const response: ApiResponse = {
      success: false,
      error: 'Not found',
      message: 'The requested resource was not found',
    }
    expect(response.success).toBe(false)
    expect(response.error).toBe('Not found')
    expect(response.data).toBeUndefined()
  })
})

describe('InsightPayload interface', () => {
  it('conforms to insight payload with mixed response types', () => {
    const payload: InsightPayload = {
      surveyId: 'survey-123',
      responses: [
        {
          id: 'resp-1',
          items: [
            { questionId: 'q1', questionText: 'Rate us', valueNum: 5 },
            { questionId: 'q2', questionText: 'Comments', valueText: 'Loved it' },
            { questionId: 'q3', questionText: 'Choose service', valueChoice: 'Premium' },
          ],
        },
      ],
    }
    expect(payload.surveyId).toBe('survey-123')
    expect(payload.responses).toHaveLength(1)
    expect(payload.responses[0].items).toHaveLength(3)
    expect(payload.responses[0].items[0].valueNum).toBe(5)
    expect(payload.responses[0].items[1].valueText).toBe('Loved it')
    expect(payload.responses[0].items[2].valueChoice).toBe('Premium')
  })
})

describe('AnalysisResult interface', () => {
  it('conforms to analysis result structure', () => {
    const result: AnalysisResult = {
      sentiment: { positive: 60, neutral: 25, negative: 15 },
      themes: [
        { theme: 'Quality', count: 10, examples: ['Good quality', 'Excellent'] },
      ],
      outliers: [
        { responseId: 'resp-5', reason: 'Extremely negative' },
      ],
    }
    expect(result.sentiment.positive).toBe(60)
    expect(result.sentiment.neutral).toBe(25)
    expect(result.sentiment.negative).toBe(15)
    expect(result.themes).toHaveLength(1)
    expect(result.themes[0].examples).toHaveLength(2)
    expect(result.outliers).toHaveLength(1)
  })
})

describe('Report interface', () => {
  it('conforms to report structure', () => {
    const section: ReportSection = {
      heading: 'Key Findings',
      body: 'Overall sentiment is positive',
      metrics: { satisfaction: 4.2 },
      chartRefs: ['chart-1'],
    }
    const report: Report = {
      title: 'Q4 Survey Report',
      executiveSummary: 'A comprehensive look at Q4 results',
      sections: [section],
    }
    expect(report.title).toBe('Q4 Survey Report')
    expect(report.executiveSummary).toBeDefined()
    expect(report.sections).toHaveLength(1)
    expect(report.sections[0].heading).toBe('Key Findings')
    expect(report.sections[0].metrics?.satisfaction).toBe(4.2)
    expect(report.sections[0].chartRefs).toContain('chart-1')
  })

  it('conforms to report section with only required fields', () => {
    const section: ReportSection = {
      heading: 'Summary',
      body: 'Brief summary',
    }
    expect(section.heading).toBeDefined()
    expect(section.body).toBeDefined()
    expect(section.metrics).toBeUndefined()
    expect(section.chartRefs).toBeUndefined()
  })
})

describe('DomainPack interface', () => {
  it('conforms to domain pack structure', () => {
    const pack: DomainPack = {
      name: 'Healthcare Pack',
      description: 'Survey templates for healthcare providers',
      industry: 'healthcare',
      questions: [
        {
          text: 'Rate your visit',
          kind: 'scale',
          scaleMin: 1,
          scaleMax: 5,
          rules: [
            {
              trigger: { type: 'range', min: 1, max: 2 },
              probe: 'What went wrong?',
              action: 'Create follow-up',
            },
          ],
        },
        {
          text: 'Select department',
          kind: 'choice',
          choices: ['Emergency', 'Outpatient', 'Surgery'],
        },
      ],
      actions: [
        {
          kind: 'alert',
          title: 'Low satisfaction alert',
          triggerCondition: 'score < 3',
        },
      ],
    }
    expect(pack.name).toBe('Healthcare Pack')
    expect(pack.industry).toBe('healthcare')
    expect(pack.questions).toHaveLength(2)
    expect(pack.questions[0].rules).toHaveLength(1)
    expect(pack.actions).toHaveLength(1)
    expect(pack.actions[0].kind).toBe('alert')
  })
})
