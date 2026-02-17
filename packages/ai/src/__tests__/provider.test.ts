import { describe, it, expect, beforeAll, vi } from 'vitest'
import type { InsightPayload, AnalysisResult, Report } from '@kauri/shared/types'
import { getAIProvider, type AIProvider } from '../provider'

const testPayload: InsightPayload = {
  surveyId: 'test-survey-id',
  responses: [
    {
      id: 'resp-1',
      items: [
        { questionId: 'q1', questionText: 'How was the service?', valueNum: 4 },
        { questionId: 'q2', questionText: 'Any comments?', valueText: 'Great experience' },
      ],
    },
    {
      id: 'resp-2',
      items: [
        { questionId: 'q1', questionText: 'How was the service?', valueNum: 2 },
        { questionId: 'q2', questionText: 'Any comments?', valueText: 'Too long wait' },
      ],
    },
  ],
}

describe('MockProvider (via getAIProvider)', () => {
  let provider: AIProvider

  beforeAll(() => {
    // Ensure no API key is set so we get the MockProvider
    delete process.env.MODELSLAB_API_KEY
    // Suppress console.warn from the factory
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(console, 'log').mockImplementation(() => {})
    provider = getAIProvider()
  })

  it('returns a MockProvider when MODELSLAB_API_KEY is not set', () => {
    expect(provider).toBeDefined()
    // The provider should have all methods of the AIProvider interface
    expect(typeof provider.analyseResponses).toBe('function')
    expect(typeof provider.generateInsights).toBe('function')
    expect(typeof provider.draftReport).toBe('function')
    expect(typeof provider.summariseForSlides).toBe('function')
    expect(typeof provider.generateVegaSpec).toBe('function')
  })

  describe('analyseResponses', () => {
    it('returns correct structure with valid sentiment distributions', async () => {
      const result = await provider.analyseResponses(testPayload)

      // Check top-level structure
      expect(result).toHaveProperty('sentiment')
      expect(result).toHaveProperty('themes')
      expect(result).toHaveProperty('outliers')

      // Check sentiment distribution
      expect(result.sentiment).toHaveProperty('positive')
      expect(result.sentiment).toHaveProperty('neutral')
      expect(result.sentiment).toHaveProperty('negative')
      expect(typeof result.sentiment.positive).toBe('number')
      expect(typeof result.sentiment.neutral).toBe('number')
      expect(typeof result.sentiment.negative).toBe('number')

      // Sentiment values should be non-negative
      expect(result.sentiment.positive).toBeGreaterThanOrEqual(0)
      expect(result.sentiment.neutral).toBeGreaterThanOrEqual(0)
      expect(result.sentiment.negative).toBeGreaterThanOrEqual(0)

      // Sentiment values should sum to 100
      const total = result.sentiment.positive + result.sentiment.neutral + result.sentiment.negative
      expect(total).toBe(100)
    })

    it('returns themes with expected structure', async () => {
      const result = await provider.analyseResponses(testPayload)

      expect(Array.isArray(result.themes)).toBe(true)
      expect(result.themes.length).toBeGreaterThan(0)

      for (const theme of result.themes) {
        expect(theme).toHaveProperty('theme')
        expect(theme).toHaveProperty('count')
        expect(theme).toHaveProperty('examples')
        expect(typeof theme.theme).toBe('string')
        expect(typeof theme.count).toBe('number')
        expect(Array.isArray(theme.examples)).toBe(true)
      }
    })

    it('returns outliers as an array', async () => {
      const result = await provider.analyseResponses(testPayload)

      expect(Array.isArray(result.outliers)).toBe(true)
      for (const outlier of result.outliers) {
        expect(outlier).toHaveProperty('responseId')
        expect(outlier).toHaveProperty('reason')
        expect(typeof outlier.responseId).toBe('string')
        expect(typeof outlier.reason).toBe('string')
      }
    })

    it('adjusts sentiment based on average score', async () => {
      // Our test data has scores [4, 2], avg = 3, so middle tier
      const result = await provider.analyseResponses(testPayload)
      expect(result.sentiment.positive).toBe(30)
      expect(result.sentiment.neutral).toBe(50)
      expect(result.sentiment.negative).toBe(20)
    })

    it('returns high positive sentiment for high scores', async () => {
      const highScorePayload: InsightPayload = {
        surveyId: 'high-survey',
        responses: [
          {
            id: 'resp-h1',
            items: [{ questionId: 'q1', questionText: 'Rate us', valueNum: 5 }],
          },
          {
            id: 'resp-h2',
            items: [{ questionId: 'q1', questionText: 'Rate us', valueNum: 5 }],
          },
        ],
      }
      const result = await provider.analyseResponses(highScorePayload)
      expect(result.sentiment.positive).toBe(70)
      expect(result.sentiment.neutral).toBe(20)
      expect(result.sentiment.negative).toBe(10)
    })

    it('returns high negative sentiment for low scores', async () => {
      const lowScorePayload: InsightPayload = {
        surveyId: 'low-survey',
        responses: [
          {
            id: 'resp-l1',
            items: [{ questionId: 'q1', questionText: 'Rate us', valueNum: 1 }],
          },
          {
            id: 'resp-l2',
            items: [{ questionId: 'q1', questionText: 'Rate us', valueNum: 2 }],
          },
        ],
      }
      const result = await provider.analyseResponses(lowScorePayload)
      expect(result.sentiment.positive).toBe(10)
      expect(result.sentiment.neutral).toBe(30)
      expect(result.sentiment.negative).toBe(60)
    })
  })

  describe('generateInsights', () => {
    it('returns array of insights with required fields', async () => {
      const analysis = await provider.analyseResponses(testPayload)
      const insights = await provider.generateInsights(testPayload, analysis)

      expect(Array.isArray(insights)).toBe(true)
      expect(insights.length).toBeGreaterThan(0)

      for (const insight of insights) {
        expect(insight).toHaveProperty('title')
        expect(insight).toHaveProperty('summary')
        expect(insight).toHaveProperty('sentiment')
        expect(insight).toHaveProperty('evidence')

        expect(typeof insight.title).toBe('string')
        expect(insight.title.length).toBeGreaterThan(0)
        expect(typeof insight.summary).toBe('string')
        expect(insight.summary.length).toBeGreaterThan(0)
        expect(['positive', 'neutral', 'negative']).toContain(insight.sentiment)
        expect(Array.isArray(insight.evidence)).toBe(true)
      }
    })

    it('returns evidence items with correct structure', async () => {
      const analysis = await provider.analyseResponses(testPayload)
      const insights = await provider.generateInsights(testPayload, analysis)

      for (const insight of insights) {
        for (const evidence of insight.evidence) {
          expect(evidence).toHaveProperty('text')
          expect(evidence).toHaveProperty('responseId')
          expect(evidence).toHaveProperty('sentiment')
          expect(typeof evidence.text).toBe('string')
          expect(typeof evidence.responseId).toBe('string')
        }
      }
    })
  })

  describe('draftReport', () => {
    it('returns report with title, executiveSummary, and sections', async () => {
      const insights = [
        { title: 'Test insight', summary: 'Summary', sentiment: 'positive' },
      ]
      const metrics = { totalResponses: 50 }

      const report = await provider.draftReport(insights, metrics)

      expect(report).toHaveProperty('title')
      expect(report).toHaveProperty('executiveSummary')
      expect(report).toHaveProperty('sections')

      expect(typeof report.title).toBe('string')
      expect(report.title.length).toBeGreaterThan(0)
      expect(typeof report.executiveSummary).toBe('string')
      expect(report.executiveSummary.length).toBeGreaterThan(0)
      expect(Array.isArray(report.sections)).toBe(true)
      expect(report.sections.length).toBeGreaterThan(0)
    })

    it('report sections have heading and body', async () => {
      const report = await provider.draftReport([], { totalResponses: 10 })

      for (const section of report.sections) {
        expect(section).toHaveProperty('heading')
        expect(section).toHaveProperty('body')
        expect(typeof section.heading).toBe('string')
        expect(typeof section.body).toBe('string')
      }
    })

    it('passes metrics through to report sections', async () => {
      const report = await provider.draftReport([], { totalResponses: 42 })

      // The mock provider embeds totalResponses in the first section metrics
      const firstSection = report.sections[0]
      expect(firstSection.metrics).toBeDefined()
      expect(firstSection.metrics?.totalResponses).toBe(42)
    })
  })

  describe('summariseForSlides', () => {
    it('returns array of slides', async () => {
      const report: Report = {
        title: 'Test Report',
        executiveSummary: 'Summary of findings',
        sections: [
          { heading: 'Section 1', body: 'Content of section 1' },
          { heading: 'Section 2', body: 'Content of section 2' },
        ],
      }

      const slides = await provider.summariseForSlides(report)

      expect(Array.isArray(slides)).toBe(true)
      expect(slides.length).toBeGreaterThan(0)
    })

    it('slides have heading, bulletPoints, and notes', async () => {
      const report: Report = {
        title: 'Test Report',
        executiveSummary: 'Summary of findings',
        sections: [
          { heading: 'Finding 1', body: 'Detailed content about finding 1' },
        ],
      }

      const slides = await provider.summariseForSlides(report)

      for (const slide of slides) {
        expect(slide).toHaveProperty('heading')
        expect(slide).toHaveProperty('bulletPoints')
        expect(slide).toHaveProperty('notes')
        expect(typeof slide.heading).toBe('string')
        expect(Array.isArray(slide.bulletPoints)).toBe(true)
        expect(typeof slide.notes).toBe('string')
      }
    })

    it('first slide uses report title', async () => {
      const report: Report = {
        title: 'Q4 Survey Analysis',
        executiveSummary: 'Key insights from Q4',
        sections: [{ heading: 'Findings', body: 'Details' }],
      }

      const slides = await provider.summariseForSlides(report)

      expect(slides[0].heading).toBe('Q4 Survey Analysis')
      expect(slides[0].notes).toBe('Key insights from Q4')
    })

    it('creates slides for each report section', async () => {
      const report: Report = {
        title: 'Report',
        executiveSummary: 'Summary',
        sections: [
          { heading: 'Section A', body: 'Body A' },
          { heading: 'Section B', body: 'Body B' },
          { heading: 'Section C', body: 'Body C' },
        ],
      }

      const slides = await provider.summariseForSlides(report)

      // Should have 1 title slide + 3 section slides
      expect(slides).toHaveLength(4)
      expect(slides[1].heading).toBe('Section A')
      expect(slides[2].heading).toBe('Section B')
      expect(slides[3].heading).toBe('Section C')
    })
  })

  describe('generateVegaSpec', () => {
    it('returns valid vega-lite spec for line chart type', async () => {
      const data = [
        { date: '2024-01-01', count: 10 },
        { date: '2024-01-02', count: 15 },
        { date: '2024-01-03', count: 8 },
      ]

      const spec = await provider.generateVegaSpec(data, 'line')

      expect(spec).toHaveProperty('$schema')
      expect(spec.$schema).toContain('vega-lite')
      expect(spec).toHaveProperty('data')
      expect(spec).toHaveProperty('mark')
      expect(spec.mark).toBe('line')
      expect(spec).toHaveProperty('encoding')
      expect(spec.data.values).toEqual(data)
    })

    it('returns valid vega-lite spec for pie chart type', async () => {
      const data = [
        { category: 'Positive', value: 60 },
        { category: 'Neutral', value: 25 },
        { category: 'Negative', value: 15 },
      ]

      const spec = await provider.generateVegaSpec(data, 'pie')

      expect(spec).toHaveProperty('$schema')
      expect(spec.$schema).toContain('vega-lite')
      expect(spec).toHaveProperty('data')
      expect(spec).toHaveProperty('mark')
      expect(spec.mark).toBe('arc') // pie charts use 'arc' mark in vega-lite
      expect(spec).toHaveProperty('encoding')
      expect(spec.data.values).toEqual(data)
    })

    it('line chart spec has temporal x-axis and quantitative y-axis', async () => {
      const data = [{ date: '2024-01-01', count: 10 }]

      const spec = await provider.generateVegaSpec(data, 'line')

      expect(spec.encoding.x.field).toBe('date')
      expect(spec.encoding.x.type).toBe('temporal')
      expect(spec.encoding.y.field).toBe('count')
      expect(spec.encoding.y.type).toBe('quantitative')
    })

    it('pie chart spec has theta and color encoding', async () => {
      const data = [{ category: 'A', value: 50 }]

      const spec = await provider.generateVegaSpec(data, 'pie')

      expect(spec.encoding.theta.field).toBe('value')
      expect(spec.encoding.theta.type).toBe('quantitative')
      expect(spec.encoding.color.field).toBe('category')
      expect(spec.encoding.color.type).toBe('nominal')
    })

    it('includes description in the spec', async () => {
      const lineSpec = await provider.generateVegaSpec([], 'line')
      const pieSpec = await provider.generateVegaSpec([], 'pie')

      expect(lineSpec.description).toBeDefined()
      expect(typeof lineSpec.description).toBe('string')
      expect(pieSpec.description).toBeDefined()
      expect(typeof pieSpec.description).toBe('string')
    })
  })
})
