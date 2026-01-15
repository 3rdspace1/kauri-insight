export interface GraphicOptions {
  prompt: string
  style?: 'business' | 'modern' | 'minimal'
  width?: number
  height?: number
}

export async function generateGraphic(options: GraphicOptions): Promise<string> {
  const apiKey = process.env.NANO_BANANA_API_KEY

  if (!apiKey) {
    console.log('🎨 [Nano Banana] No API key configured, using placeholder')
    return getPlaceholderGraphic(options.style || 'business')
  }

  try {
    console.log('🎨 Generating graphic with Nano Banana Pro...')

    // Note: This is a placeholder for the actual Nano Banana Pro API
    // Replace with actual API endpoint when available
    const response = await fetch('https://api.nanobanana.com/v1/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        prompt: options.prompt,
        style: options.style || 'business',
        width: options.width || 1200,
        height: options.height || 630,
      }),
    })

    if (!response.ok) {
      throw new Error(`Nano Banana API error: ${response.statusText}`)
    }

    const data = await response.json()
    const imageUrl = data.url

    console.log('✅ Graphic generated successfully')
    return imageUrl
  } catch (error) {
    console.error('❌ Failed to generate graphic:', error)
    console.log('Falling back to placeholder')
    return getPlaceholderGraphic(options.style || 'business')
  }
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
      <rect width="1200" height="630" fill="${color.bg}"/>
      <text x="600" y="315" font-family="Arial, sans-serif" font-size="48"
            fill="${color.fg}" text-anchor="middle">
        Kauri Insight
      </text>
      <text x="600" y="380" font-family="Arial, sans-serif" font-size="24"
            fill="${color.fg}" text-anchor="middle" opacity="0.8">
        ${style.charAt(0).toUpperCase() + style.slice(1)} Style Graphic
      </text>
    </svg>
  `

  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`
}
