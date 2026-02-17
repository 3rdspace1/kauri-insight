'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { CheckCircle2 } from 'lucide-react'

interface ThankYouProps {
  surveyTitle: string
}

export function ThankYou({ surveyTitle }: ThankYouProps) {
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4">
          <CheckCircle2 className="h-16 w-16 text-green-500" />
        </div>
        <CardTitle className="text-2xl">Thank You!</CardTitle>
        <CardDescription>
          Your response to &ldquo;{surveyTitle}&rdquo; has been recorded.
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <p className="text-muted-foreground">
          We appreciate you taking the time to share your feedback with us. Your
          insights help us improve our services.
        </p>
        <p className="text-sm text-muted-foreground">
          You can now close this window.
        </p>
      </CardContent>
    </Card>
  )
}
