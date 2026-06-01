/**
 * PDF generation in the visuals package is handled via Cloudflare Browser Rendering.
 * See apps/web/src/lib/pdf.ts for the edge-runtime implementation.
 *
 * This stub exists to satisfy any type imports from this module.
 */
export async function generatePDF(_htmlContent: string): Promise<never> {
  throw new Error(
    'generatePDF from @kauri/visuals is not supported in edge runtime. ' +
    'Use the generatePDF helper in apps/web/src/lib/pdf.ts instead.'
  )
}
