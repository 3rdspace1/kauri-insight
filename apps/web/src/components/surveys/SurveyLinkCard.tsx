'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CopyLinkButton } from './CopyLinkButton'

interface SurveyLinkCardProps {
  surveyId: string
}

export function SurveyLinkCard({ surveyId }: SurveyLinkCardProps) {
  const [origin, setOrigin] = useState('')

  useEffect(() => {
    setOrigin(window.location.origin)
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Survey Link</CardTitle>
        <CardDescription>Share this link with respondents</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2">
          <code className="flex-1 rounded bg-muted px-3 py-2 text-sm break-all">
            {origin}/runtime/{surveyId}
          </code>
          <CopyLinkButton surveyId={surveyId} />
        </div>
      </CardContent>
    </Card>
  )
}
