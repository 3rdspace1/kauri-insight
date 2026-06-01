'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2 } from 'lucide-react'

interface ThankYouProps {
  surveyTitle: string
}

export function ThankYou({ surveyTitle }: ThankYouProps) {
  return (
    <Card className="w-full max-w-2xl mx-auto text-center glass shadow-xl border-white/20">
      <CardHeader>
        <div className="flex justify-center mb-4">
          <div className="rounded-full bg-green-100 p-3">
            <CheckCircle2 className="h-12 w-12 text-green-600" />
          </div>
        </div>
        <CardTitle className="text-2xl">Thank You!</CardTitle>
        <CardDescription>
          Your response to &quot;{surveyTitle}&quot; has been recorded.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground">
          We appreciate you taking the time to share your feedback. Your responses
          will help us improve and make better decisions.
        </p>
        <div className="pt-4">
          <Button
            variant="outline"
            onClick={() => {
              // Close window or redirect
              if (window.opener) {
                window.close()
              }
            }}
          >
            Close
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
