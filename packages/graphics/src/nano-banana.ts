/**
 * Nano Banana Pro Integration via ModelsLab API v7
 *
 * Generates high-quality visual assets using the Nano Banana Pro model
 * with expert-crafted prompts and 4K resolution support
 * https://modelslab.com/
 */

import {
  generateNanaBananaPrompt,
  EXPERT_PRESETS,
  type EnhancedPromptOptions,
} from './prompt-engine'

const MODELSLAB_API_KEY = process.env.MODELSLAB_API_KEY || ''
const MODELSLAB_API_URL = 'https://modelslab.com/api/v7/images/text-to-image'

export interface GraphicOptions {
  prompt: string
  style?: 'business' | 'modern' | 'minimal'
  width?: number
  height?: number
  negativePrompt?: string
}

interface ModelsLabV7Response {
  status: string
  message?: string
  output?: string[]
  meta?: {
    prompt: string
    model_id: string
    aspect_ratio: string
    seed: number
  }
}

export async function generateGraphic(options: GraphicOptions): Promise<string> {
  if (!MODELSLAB_API_KEY) {
    console.log('🎨 [Nano Banana Pro] No API key configured, using elegant placeholder')
    return getPlaceholderGraphic(options.style || 'business')
  }

  try {
    console.log('🎨 Generating 4K visual with Nano Banana Pro via ModelsLab v7...')

    // Use v7 API with aspect ratio instead of width/height
    const aspectRatio = calculateAspectRatio(
      options.width || 1200,
      options.height || 630
    )

    const response = await fetch(MODELSLAB_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        key: MODELSLAB_API_KEY,
        model_id: 'nano-banana-pro',
        prompt: enhancePrompt(options.prompt, options.style || 'business'),
        negative_prompt:
          options.negativePrompt ||
          'text, words, letters, numbers, people, faces, logos, ugly, blurry, distorted, low quality, watermark, amateur, unprofessional',
        aspect_ratio: aspectRatio,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`ModelsLab API v7 error: ${response.statusText} - ${errorText}`)
    }

    const data: ModelsLabV7Response = await response.json()

    if (data.status === 'success' && data.output && data.output.length > 0) {
      console.log(`✅ 4K visual generated successfully with Nano Banana Pro`)
      console.log(`📊 Metadata: ${data.meta?.model_id}, Aspect: ${data.meta?.aspect_ratio}`)
      return data.output[0]
    }

    throw new Error(data.message || 'No output from ModelsLab API v7')
  } catch (error) {
    console.error('❌ Failed to generate graphic:', error)
    console.log('Falling back to elegant SVG placeholder')
    return getPlaceholderGraphic(options.style || 'business')
  }
}

/**
 * Calculate aspect ratio for v7 API
 */
function calculateAspectRatio(width: number, height: number): string {
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b))
  const divisor = gcd(width, height)
  const ratioW = width / divisor
  const ratioH = height / divisor

  // Map to common aspect ratios
  const ratio = ratioW / ratioH

  if (Math.abs(ratio - 1) < 0.1) return '1:1' // Square
  if (Math.abs(ratio - 16 / 9) < 0.1) return '16:9' // Widescreen
  if (Math.abs(ratio - 4 / 3) < 0.1) return '4:3' // Standard
  if (Math.abs(ratio - 3 / 2) < 0.1) return '3:2' // Classic photo
  if (Math.abs(ratio - 21 / 9) < 0.1) return '21:9' // Ultra-wide

  // Default to closest
  return ratio > 1.5 ? '16:9' : '1:1'
}

/**
 * Generate cover image for a report using expert prompting
 */
export async function generateReportCover(options: {
  industry: string
  surveyName: string
  sentiment: 'positive' | 'neutral' | 'negative'
  companyName?: string
  primaryColor?: string
}): Promise<string> {
  console.log(`🎨 Generating expert-crafted cover for ${options.industry} survey...`)

  // Use expert prompting engine for maximum quality
  const { prompt, negativePrompt } = generateNanaBananaPrompt(
    `Breathtaking survey report cover: "${options.surveyName}"${options.companyName ? ` for ${options.companyName}` : ''}`,
    {
      context: {
        industry: options.industry,
        sentiment: options.sentiment,
        dataType: 'categorical',
        purpose: 'executive',
        audience: 'executive',
      },
      brandColors: options.primaryColor ? [options.primaryColor] : undefined,
      emphasizeDataIntegrity: true,
    }
  )

  return generateGraphic({
    prompt,
    negativePrompt,
    width: 1920,
    height: 1080,
  })
}

/**
 * Generate infographic visual using expert prompting
 */
export async function generateInfographic(options: {
  topic: string
  industry: string
  style?: string
}): Promise<string> {
  console.log(`🎨 Generating expert infographic about ${options.topic}...`)

  const { prompt, negativePrompt } = generateNanaBananaPrompt(
    `Professional data infographic: ${options.topic}`,
    {
      context: {
        industry: options.industry,
        sentiment: 'neutral',
        dataType: 'categorical',
        purpose: 'analytical',
        audience: 'technical',
      },
      customElements: ['data points', 'statistical indicators', 'metric visualizations', 'information hierarchy'],
    }
  )

  return generateGraphic({
    prompt,
    negativePrompt,
    width: 1024,
    height: 1024,
  })
}

/**
 * Generate visual metaphor for an insight using expert prompting
 */
export async function generateInsightVisual(options: {
  insightTitle: string
  sentiment: 'positive' | 'neutral' | 'negative'
  industry: string
}): Promise<string> {
  console.log(`🎨 Generating expert visual metaphor for insight...`)

  const { prompt, negativePrompt } = generateNanaBananaPrompt(
    `Abstract visual metaphor: "${options.insightTitle}"`,
    {
      context: {
        industry: options.industry,
        sentiment: options.sentiment,
        dataType: 'qualitative',
        purpose: 'storytelling',
        audience: 'general',
      },
      customElements: ['data visualization', 'insight indicators', 'analytical forms'],
    }
  )

  return generateGraphic({
    prompt,
    negativePrompt,
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
