import { chromium } from 'playwright'

export async function generatePDF(url: string): Promise<Buffer> {
    let browser
    try {
        browser = await chromium.launch({
            headless: true,
        })
        const context = await browser.newContext()
        const page = await context.newPage()

        // Auth bypass: In production, you'd use a temporary signed token
        // For this demo, we'll assume the page is accessible via a secret URL or it's a public report view
        await page.goto(url, { waitUntil: 'networkidle' })

        // Add some print-specific styles
        await page.addStyleTag({
            content: `
        @page { size: A4; margin: 20mm; }
        body { -webkit-print-color-adjust: exact; }
        .no-print { display: none !important; }
      `
        })

        const pdf = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
                top: '20mm',
                bottom: '20mm',
                left: '20mm',
                right: '20mm',
            }
        })

        return pdf
    } finally {
        if (browser) {
            await browser.close()
        }
    }
}
