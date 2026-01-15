export interface SlackMessage {
  text: string
  blocks?: any[]
}

export async function sendSlackAlert(message: SlackMessage): Promise<void> {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL

  if (!webhookUrl) {
    console.log('📢 [Slack] No webhook configured, logging to console:')
    console.log(JSON.stringify(message, null, 2))
    return
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    })

    if (!response.ok) {
      throw new Error(`Slack API error: ${response.statusText}`)
    }

    console.log('✅ Slack alert sent successfully')
  } catch (error) {
    console.error('❌ Failed to send Slack alert:', error)
    console.log('Message was:', message)
  }
}

export function formatNegativeResponseAlert(
  surveyName: string,
  respondentName: string | null,
  score: number,
  comment: string | null
): SlackMessage {
  return {
    text: `⚠️ Low satisfaction score on "${surveyName}"`,
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '⚠️ Low Satisfaction Alert',
        },
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Survey:*\n${surveyName}`,
          },
          {
            type: 'mrkdwn',
            text: `*Respondent:*\n${respondentName || 'Anonymous'}`,
          },
          {
            type: 'mrkdwn',
            text: `*Score:*\n${score}/5 ⭐`,
          },
        ],
      },
      comment
        ? {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*Comment:*\n> ${comment}`,
            },
          }
        : null,
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: `This response requires follow-up action.`,
          },
        ],
      },
    ].filter(Boolean),
  }
}
