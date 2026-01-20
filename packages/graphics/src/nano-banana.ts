/**
 * Nano Banana Pro Integration via ModelsLab API
 *
 * Generates high-quality visual assets using the Nano Banana model
 * https://modelslab.com/
 */

const MODELSLAB_API_KEY = process.env.MODELSLAB_API_KEY || ''
const MODELSLAB_API_URL = 'https://modelslab.com/api/v6/images/text2img'

export interface GraphicOptions {
  prompt: string
  style?: 'business' | 'modern' | 'minimal'
  width?: number
  height?: number
  negativePrompt?: string
}

interface ModelsLabResponse {
  status: string
  generationTime: number
  id: number
  output: string[]
  meta?: any
}

export async function generateGraphic(options: GraphicOptions): Promise<string> {
  if (!MODELSLAB_API_KEY) {
    console.log('🎨 [Nano Banana] No API key configured, using placeholder')
    return getPlaceholderGraphic(options.style || 'business')
  }

  try {
    console.log('🎨 Generating graphic with Nano Banana Pro via ModelsLab...')

    const response = await fetch(MODELSLAB_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        key: MODELSLAB_API_KEY,
        model_id: 'nano-banana',
        prompt: enhancePrompt(options.prompt, options.style || 'business'),
        negative_prompt:
          options.negativePrompt ||
          'text, words, letters, people, faces, logos, ugly, blurry, distorted, low quality, watermark',
        width: options.width || 1200,
        height: options.height || 630,
        samples: 1,
        num_inference_steps: 30,
        safety_checker: false,
        enhance_prompt: 'yes',
        guidance_scale: 7.5,
        webhook: null,
        track_id: null,
      }),
    })

    if (!response.ok) {
      throw new Error(`ModelsLab API error: ${response.statusText}`)
    }

    const data: ModelsLabResponse = await response.json()

    if (data.status === 'success' && data.output.length > 0) {
      console.log(`✅ Graphic generated in ${data.generationTime}s`)
      return data.output[0]
    }

    throw new Error('No output from ModelsLab API')
  } catch (error) {
    console.error('❌ Failed to generate graphic:', error)
    console.log('Falling back to placeholder')
    return getPlaceholderGraphic(options.style || 'business')
  }
}

/**
 * Generate cover image for a report
 */
export async function generateReportCover(options: {
  industry: string
  surveyName: string
  sentiment: 'positive' | 'neutral' | 'negative'
  companyName?: string
  primaryColor?: string
}): Promise<string> {
  const sentimentMood =
    options.sentiment === 'positive'
      ? 'optimistic, bright, uplifting, energetic'
      : options.sentiment === 'negative'
      ? 'serious, focused, professional, concerned'
      : 'balanced, calm, neutral, stable'

  const prompt = `
Professional business report cover design for ${options.industry} industry.
Survey: "${options.surveyName}".
${options.companyName ? `Company: ${options.companyName}.` : ''}
Mood: ${sentimentMood}.
Style: Modern, clean, corporate, abstract.
Elements: data visualization, charts, gradients, geometric shapes.
Colors: ${options.primaryColor || 'blue, purple'} palette.
High quality, 4k, professional, sharp, clean composition.
  `.trim()

  return generateGraphic({
    prompt,
    negativePrompt:
      'text, words, letters, people, faces, logos, photos, realistic, ugly, blurry',
    width: 1920,
    height: 1080,
  })
}

/**
 * Generate infographic visual
 */
export async function generateInfographic(options: {
  topic: string
  style?: string
}): Promise<string> {
  const prompt = `
Professional infographic illustration about ${options.topic}.
Style: ${options.style || 'modern, minimal, clean'}, flat design, vector art style.
Elements: icons, charts, data points, visual hierarchy.
Color palette: professional business colors with gradients.
High quality, sharp, clear, 4k, balanced composition.
  `.trim()

  return generateGraphic({
    prompt,
    negativePrompt: 'text, words, people, faces, photo, realistic, blurry, messy',
    width: 1024,
    height: 1024,
  })
}

/**
 * Generate visual metaphor for an insight
 */
export async function generateInsightVisual(options: {
  insightTitle: string
  sentiment: 'positive' | 'neutral' | 'negative'
  industry: string
}): Promise<string> {
  const sentimentColors =
    options.sentiment === 'positive'
      ? 'green, blue, bright, vibrant'
      : options.sentiment === 'negative'
      ? 'orange, red, warm, alert'
      : 'blue, gray, neutral, balanced'

  const prompt = `
Abstract visual metaphor representing "${options.insightTitle}" in ${options.industry} industry.
Style: professional, modern, clean, minimal.
Color palette: ${sentimentColors}.
Elements: data, analytics, business intelligence, insights, abstract shapes.
Mood: professional, clear, focused.
High quality, 4k, sharp, clean composition.
  `.trim()

  return generateGraphic({
    prompt,
    negativePrompt: 'text, words, people, faces, ugly, blurry, cluttered',
    width: 1024,
    height: 768,
  })
}

/**
 * Enhance prompt based on style
 */
function enhancePrompt(basePrompt: string, style: string): string {
  const styleEnhancements = {
    business: 'professional, corporate, clean, modern',
    modern: 'contemporary, sleek, minimalist, sophisticated',
    minimal: 'simple, clean, elegant, understated',
  }

  const enhancement = styleEnhancements[style as keyof typeof styleEnhancements] || styleEnhancements.business

  return `${basePrompt}. Style: ${enhancement}. High quality, 4k, professional.`
}

/**
 * Check if Nano Banana is configured
 */
export function isNanaBananaAvailable(): boolean {
  return !!MODELSLAB_API_KEY
}

function getPlaceholderGraphic(style: string): string {
  // Return a data URL with a simple SVG placeholder
  const colors = {
    business: { bg: '#2563eb', fg: '#ffffff' },
    modern: { bg: '#8b5cf6', fg: '#ffffff' },
    minimal: { bg: '#64748b', fg: '#ffffff' },
  }

  const color = colors[style as keyof typeof colors] || colors.business

  const svg = `
    <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${color.bg};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${color.bg}dd;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="1200" height="630" fill="url(#grad)"/>
      <circle cx="200" cy="150" r="80" fill="${color.fg}" opacity="0.1"/>
      <circle cx="1000" cy="480" r="120" fill="${color.fg}" opacity="0.1"/>
      <text x="600" y="280" font-family="Arial, sans-serif" font-size="56" font-weight="bold"
            fill="${color.fg}" text-anchor="middle">
        Kauri Insight
      </text>
      <text x="600" y="360" font-family="Arial, sans-serif" font-size="28"
            fill="${color.fg}" text-anchor="middle" opacity="0.9">
        Professional Survey Analytics
      </text>
    </svg>
  `

  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`
}
