import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

/**
 * Website Scraper API
 *
 * Extracts business information from a website using basic scraping
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { url } = body

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    // Validate URL
    let parsedUrl: URL
    try {
      parsedUrl = new URL(url)
    } catch {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
    }

    // Fetch website
    const response = await fetch(parsedUrl.toString(), {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; KauriInsight/1.0)',
      },
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch website' },
        { status: response.status }
      )
    }

    const html = await response.text()

    // Extract information using simple parsing
    const extractedData = extractBusinessInfo(html)

    return NextResponse.json({
      success: true,
      ...extractedData,
    })
  } catch (error) {
    console.error('Error scraping website:', error)
    return NextResponse.json(
      { error: 'Failed to scrape website' },
      { status: 500 }
    )
  }
}

/**
 * Extract business information from HTML
 */
function extractBusinessInfo(html: string): {
  description?: string
  industry?: string
  title?: string
} {
  const result: any = {}

  // Extract meta description
  const descriptionMatch = html.match(
    /<meta\s+(?:name|property)=["'](?:description|og:description)["']\s+content=["']([^"']+)["']/i
  )
  if (descriptionMatch) {
    result.description = descriptionMatch[1].trim()
  }

  // Extract title
  const titleMatch = html.match(/<title>([^<]+)<\/title>/i)
  if (titleMatch) {
    result.title = titleMatch[1].trim()
  }

  // Try to infer industry from common keywords
  const industryKeywords: Record<string, string[]> = {
    Healthcare: ['health', 'medical', 'clinic', 'hospital', 'patient', 'doctor'],
    Technology: ['software', 'tech', 'digital', 'app', 'platform', 'saas'],
    Finance: ['finance', 'banking', 'investment', 'trading', 'wealth'],
    Retail: ['shop', 'store', 'retail', 'ecommerce', 'products'],
    Education: ['education', 'learning', 'school', 'university', 'training'],
    Hospitality: ['hotel', 'restaurant', 'hospitality', 'travel', 'tourism'],
    'Real Estate': ['real estate', 'property', 'housing', 'rental'],
    Consulting: ['consulting', 'advisory', 'professional services'],
  }

  const lowerHtml = html.toLowerCase()
  for (const [industry, keywords] of Object.entries(industryKeywords)) {
    const matchCount = keywords.filter((keyword) => lowerHtml.includes(keyword)).length
    if (matchCount >= 2) {
      result.industry = industry
      break
    }
  }

  return result
}
