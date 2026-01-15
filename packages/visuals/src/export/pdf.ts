import { chromium } from 'playwright'

export async function generatePDF(htmlContent: string): Promise<Buffer> {
  console.log('📄 Generating PDF...')

  const browser = await chromium.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  try {
    const context = await browser.newContext()
    const page = await context.newPage()

    await page.setContent(htmlContent, { waitUntil: 'networkidle' })

    const pdf = await page.pdf({
      format: 'A4',
      margin: {
        top: '1cm',
        right: '1.5cm',
        bottom: '1cm',
        left: '1.5cm',
      },
      printBackground: true,
    })

    console.log('✅ PDF generated successfully')
    return Buffer.from(pdf)
  } finally {
    await browser.close()
  }
}
