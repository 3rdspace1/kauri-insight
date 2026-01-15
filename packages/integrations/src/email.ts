export interface EmailMessage {
  to: string
  subject: string
  text?: string
  html?: string
}

export async function sendEmail(message: EmailMessage): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY

  if (!apiKey) {
    console.log('📧 [Email] No Resend API key configured, logging to console:')
    console.log(JSON.stringify(message, null, 2))
    return
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: process.env.NEXTAUTH_EMAIL_FROM || 'noreply@example.com',
        ...message,
      }),
    })

    if (!response.ok) {
      throw new Error(`Resend API error: ${response.statusText}`)
    }

    console.log('✅ Email sent successfully to:', message.to)
  } catch (error) {
    console.error('❌ Failed to send email:', error)
    console.log('Message was:', message)
  }
}

export function createMagicLinkEmail(email: string, url: string): EmailMessage {
  return {
    to: email,
    subject: 'Sign in to Kauri Insight',
    text: `Sign in to Kauri Insight by clicking this link:\n\n${url}\n\nThis link will expire in 24 hours.`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Sign in to Kauri Insight</h2>
        <p>Click the button below to sign in to your account:</p>
        <a href="${url}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">
          Sign In
        </a>
        <p style="color: #666; font-size: 14px;">
          This link will expire in 24 hours. If you didn't request this email, you can safely ignore it.
        </p>
      </div>
    `,
  }
}
