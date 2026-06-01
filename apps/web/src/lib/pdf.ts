import puppeteer from '@cloudflare/puppeteer'
import { getRequestContext } from '@cloudflare/next-on-pages'

/**
 * Generate a PDF from a URL using Cloudflare Browser Rendering.
 * Requires the `browser` binding to be configured in wrangler.toml.
 */
export async function generatePDF(url: string): Promise<Uint8Array> {
  const { env } = getRequestContext()
  const browser = await puppeteer.launch((env as any).BROWSER)

  try {
    const page = await browser.newPage()

    await page.goto(url, { waitUntil: 'networkidle0' })

    await page.addStyleTag({
      content: `
        @page { size: A4; margin: 20mm; }
        body { -webkit-print-color-adjust: exact; }
        .no-print { display: none !important; }
      `,
    })

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '20mm', bottom: '20mm', left: '20mm', right: '20mm' },
    })

    return pdf
  } finally {
    await browser.close()
  }
}
