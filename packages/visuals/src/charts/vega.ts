import type { VegaSpec } from '@kauri/shared/types'

export function createTrendChart(data: Array<{ date: string; count: number }>): VegaSpec {
  return {
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    description: 'Response trend over time',
    data: { values: data },
    mark: {
      type: 'line',
      point: true,
      tooltip: true,
    },
    encoding: {
      x: {
        field: 'date',
        type: 'temporal',
        title: 'Date',
        axis: { format: '%d %b' },
      },
      y: {
        field: 'count',
        type: 'quantitative',
        title: 'Responses',
      },
      color: {
        value: '#2563eb',
      },
    },
    width: 600,
    height: 300,
  }
}

export function createSentimentChart(data: Array<{ category: string; value: number }>): VegaSpec {
  return {
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    description: 'Sentiment distribution',
    data: { values: data },
    mark: { type: 'arc', tooltip: true },
    encoding: {
      theta: {
        field: 'value',
        type: 'quantitative',
        stack: true,
      },
      color: {
        field: 'category',
        type: 'nominal',
        scale: {
          domain: ['positive', 'neutral', 'negative'],
          range: ['#10b981', '#f59e0b', '#ef4444'],
        },
        legend: { title: 'Sentiment' },
      },
    },
    view: { stroke: null },
    width: 300,
    height: 300,
  }
}

export function createScoreDistribution(
  data: Array<{ score: number; count: number }>
): VegaSpec {
  return {
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    description: 'Score distribution',
    data: { values: data },
    mark: { type: 'bar', tooltip: true },
    encoding: {
      x: {
        field: 'score',
        type: 'ordinal',
        title: 'Score',
      },
      y: {
        field: 'count',
        type: 'quantitative',
        title: 'Count',
      },
      color: {
        field: 'score',
        type: 'ordinal',
        scale: {
          scheme: 'blues',
        },
        legend: null,
      },
    },
    width: 500,
    height: 300,
  }
}
