import type {
  InsightPayload,
  AnalysisResult,
  Report,
  VegaSpec,
  Evidence,
} from '@kauri/shared/types'

export interface AIProvider {
  analyseResponses(payload: InsightPayload): Promise<AnalysisResult>
  generateInsights(
    payload: InsightPayload,
    analysis: AnalysisResult
  ): Promise<
    Array<{
      title: string
      summary: string
      sentiment: 'positive' | 'neutral' | 'negative'
      evidence: Evidence[]
    }>
  >
  draftReport(insights: any[], metrics: any): Promise<Report>
  summariseForSlides(report: Report): Promise<any[]>
  generateVegaSpec(data: any, chartType: string): Promise<VegaSpec>
}

// Factory function
export function getAIProvider(): AIProvider {
  const apiKey = process.env.MODELSLAB_API_KEY

  if (apiKey) {
    return new ModelslabProvider(apiKey)
  }

  console.warn('⚠️  MODELSLAB_API_KEY not set, using mock AI provider')
  return new MockProvider()
}

// Modelslab Provider
class ModelslabProvider implements AIProvider {
  private apiKey: string
  private baseUrl = 'https://modelslab.com/api/v6'

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  private async callModelslab(
    model: string,
    prompt: string,
    options: any = {}
  ): Promise<any> {
    const response = await fetch(`${this.baseUrl}/llm/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: options.temperature ?? 0.3,
        max_tokens: options.maxTokens ?? 1000,
        ...options,
      }),
    })

    if (!response.ok) {
      throw new Error(`Modelslab API error: ${response.statusText}`)
    }

    const data = await response.json()
    return data.choices?.[0]?.message?.content || ''
  }

  async analyseResponses(payload: InsightPayload): Promise<AnalysisResult> {
    const prompt = `You are an expert survey analyst. Analyse these survey responses and provide:
1. Sentiment distribution (percentage positive, neutral, negative)
2. Key themes (3-5 themes with examples)
3. Outliers (unusual responses that need attention)

Survey responses:
${JSON.stringify(payload.responses, null, 2)}

Return ONLY valid JSON in this exact format:
{
  "sentiment": { "positive": 0, "neutral": 0, "negative": 0 },
  "themes": [{ "theme": "", "count": 0, "examples": [] }],
  "outliers": [{ "responseId": "", "reason": "" }]
}`

    try {
      const result = await this.callModelslab('mixtral-8x7b-instruct', prompt, {
        temperature: 0.2,
        maxTokens: 1500,
      })

      return JSON.parse(result)
    } catch (error) {
      console.error('Modelslab analysis error:', error)
      throw error
    }
  }

  async generateInsights(
    payload: InsightPayload,
    analysis: AnalysisResult
  ): Promise<any[]> {
    const prompt = `Based on this survey analysis, generate 3-5 actionable insights.
Each insight should have:
- title (concise, action-oriented)
- summary (2-3 sentences explaining the finding and its implications)
- sentiment (positive, neutral, or negative)
- evidence (array of relevant response excerpts)

Analysis:
${JSON.stringify(analysis, null, 2)}

Return ONLY valid JSON array of insights.`

    try {
      const result = await this.callModelslab('llama-3.1-70b-instruct', prompt, {
        temperature: 0.3,
        maxTokens: 2000,
      })

      return JSON.parse(result)
    } catch (error) {
      console.error('Modelslab insights error:', error)
      throw error
    }
  }

  async draftReport(insights: any[], metrics: any): Promise<Report> {
    const prompt = `Create an executive report from these insights and metrics.
Include:
- Title
- Executive summary (3-4 sentences)
- 3-4 sections with headings, body text, and relevant metrics

Insights:
${JSON.stringify(insights, null, 2)}

Metrics:
${JSON.stringify(metrics, null, 2)}

Return ONLY valid JSON.`

    try {
      const result = await this.callModelslab('llama-3.1-70b-instruct', prompt, {
        temperature: 0.4,
        maxTokens: 3000,
      })

      return JSON.parse(result)
    } catch (error) {
      console.error('Modelslab report error:', error)
      throw error
    }
  }

  async summariseForSlides(report: Report): Promise<any[]> {
    const prompt = `Convert this report into 4-5 PowerPoint slides.
Each slide should have:
- heading
- bulletPoints (3-5 key points)
- notes (speaker notes)

Report:
${JSON.stringify(report, null, 2)}

Return ONLY valid JSON array of slides.`

    try {
      const result = await this.callModelslab('mixtral-8x7b-instruct', prompt, {
        temperature: 0.3,
        maxTokens: 1500,
      })

      return JSON.parse(result)
    } catch (error) {
      console.error('Modelslab slides error:', error)
      throw error
    }
  }

  async generateVegaSpec(data: any, chartType: string): Promise<VegaSpec> {
    const prompt = `Generate a Vega-Lite JSON specification for a ${chartType} chart.
Data: ${JSON.stringify(data)}

Requirements:
- Use the provided data
- Include proper axes labels
- Use a professional colour scheme
- Make it responsive

Return ONLY the Vega-Lite JSON spec, no markdown or explanation.`

    try {
      const result = await this.callModelslab('qwen2.5-32b-instruct', prompt, {
        temperature: 0.2,
        maxTokens: 1000,
      })

      return JSON.parse(result)
    } catch (error) {
      console.error('Modelslab Vega spec error:', error)
      throw error
    }
  }
}

// Mock Provider (fallback when no API key)
class MockProvider implements AIProvider {
  async analyseResponses(payload: InsightPayload): Promise<AnalysisResult> {
    console.log('🤖 Using mock analysis')

    const totalResponses = payload.responses.length
    const numValues = payload.responses.flatMap((r) =>
      r.items.map((i) => i.valueNum).filter((v) => v !== undefined)
    )

    const avgScore = numValues.length
      ? numValues.reduce((a, b) => a + (b || 0), 0) / numValues.length
      : 0

    const sentiment =
      avgScore >= 4
        ? { positive: 70, neutral: 20, negative: 10 }
        : avgScore >= 3
          ? { positive: 30, neutral: 50, negative: 20 }
          : { positive: 10, neutral: 30, negative: 60 }

    const textResponses = payload.responses.flatMap((r) =>
      r.items.filter((i) => i.valueText).map((i) => i.valueText!)
    )

    return {
      sentiment,
      themes: [
        {
          theme: 'Service Quality',
          count: Math.floor(totalResponses * 0.6),
          examples: textResponses.slice(0, 2),
        },
        {
          theme: 'Wait Times',
          count: Math.floor(totalResponses * 0.3),
          examples: textResponses.slice(2, 4),
        },
      ],
      outliers:
        avgScore < 3
          ? [
              {
                responseId: payload.responses[0]?.id || 'unknown',
                reason: 'Significantly below average satisfaction',
              },
            ]
          : [],
    }
  }

  async generateInsights(
    payload: InsightPayload,
    analysis: AnalysisResult
  ): Promise<any[]> {
    console.log('🤖 Using mock insights')

    return [
      {
        title: 'Overall satisfaction is trending positive',
        summary:
          'Based on the responses received, the majority of respondents are satisfied with the service. However, there are opportunities to improve wait times and staff availability.',
        sentiment: 'positive' as const,
        evidence: analysis.themes[0]?.examples.map((text) => ({
          text,
          responseId: payload.responses[0]?.id || 'unknown',
          sentiment: 'positive' as const,
        })) || [],
      },
      {
        title: 'Wait times remain a concern',
        summary:
          'Several respondents mentioned long wait times as a pain point. This is an area that requires immediate attention to improve the overall experience.',
        sentiment: 'negative' as const,
        evidence: analysis.themes[1]?.examples.map((text) => ({
          text,
          responseId: payload.responses[1]?.id || 'unknown',
          sentiment: 'negative' as const,
        })) || [],
      },
    ]
  }

  async draftReport(insights: any[], metrics: any): Promise<Report> {
    console.log('🤖 Using mock report')

    return {
      title: 'Survey Analysis Report',
      executiveSummary:
        'This report summarises feedback from recent survey responses. Overall sentiment is positive, with key areas for improvement identified in service delivery and response times.',
      sections: [
        {
          heading: 'Key Findings',
          body: 'Respondents generally expressed satisfaction with the service, though several areas require attention.',
          metrics: { totalResponses: metrics.totalResponses || 0 },
        },
        {
          heading: 'Recommendations',
          body: 'Focus on reducing wait times and improving staff availability during peak periods.',
          metrics: {},
        },
      ],
    }
  }

  async summariseForSlides(report: Report): Promise<any[]> {
    console.log('🤖 Using mock slides')

    return [
      {
        heading: report.title,
        bulletPoints: ['Overview of survey results', 'Key metrics and trends'],
        notes: report.executiveSummary,
      },
      ...report.sections.map((section) => ({
        heading: section.heading,
        bulletPoints: [section.body.substring(0, 100)],
        notes: section.body,
      })),
    ]
  }

  async generateVegaSpec(data: any, chartType: string): Promise<VegaSpec> {
    console.log('🤖 Using mock Vega spec')

    if (chartType === 'line') {
      return {
        $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
        description: 'Response trend over time',
        data: { values: data },
        mark: 'line',
        encoding: {
          x: { field: 'date', type: 'temporal', title: 'Date' },
          y: { field: 'count', type: 'quantitative', title: 'Responses' },
        },
      }
    }

    return {
      $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
      description: 'Sentiment distribution',
      data: { values: data },
      mark: 'arc',
      encoding: {
        theta: { field: 'value', type: 'quantitative' },
        color: { field: 'category', type: 'nominal' },
      },
    }
  }
}
