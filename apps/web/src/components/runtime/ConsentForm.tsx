'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'

interface ConsentFormProps {
  surveyTitle: string
  onSubmit: (email: string) => void
}

export function ConsentForm({ surveyTitle, onSubmit }: ConsentFormProps) {
  const [email, setEmail] = useState('')
  const [consent, setConsent] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; consent?: string }>({})

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const newErrors: { email?: string; consent?: string } = {}

    if (!email) {
      newErrors.email = 'Email is required'
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!consent) {
      newErrors.consent = 'You must consent to participate'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    onSubmit(email)
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">{surveyTitle}</CardTitle>
        <CardDescription>
          We'd love to hear your feedback. This should take about 2-3 minutes.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Input */}
          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setErrors((prev) => ({ ...prev, email: undefined }))
              }}
              className={errors.email ? 'border-destructive' : ''}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email}</p>
            )}
          </div>

          {/* Consent Checkbox */}
          <div className="space-y-4">
            <div className="flex items-start space-x-2">
              <Checkbox
                id="consent"
                checked={consent}
                onCheckedChange={(checked) => {
                  setConsent(checked as boolean)
                  setErrors((prev) => ({ ...prev, consent: undefined }))
                }}
              />
              <div className="space-y-1 leading-none">
                <Label
                  htmlFor="consent"
                  className="text-sm font-normal cursor-pointer"
                >
                  I consent to participate in this survey and allow my responses to
                  be collected and analysed. *
                </Label>
              </div>
            </div>
            {errors.consent && (
              <p className="text-sm text-destructive">{errors.consent}</p>
            )}
          </div>

          {/* Privacy Notice */}
          <div className="text-xs text-muted-foreground bg-muted p-4 rounded-md">
            <p className="font-medium mb-2">Privacy Notice</p>
            <p>
              Your email will be used solely for survey purposes and will not be
              shared with third parties. You can request deletion of your data at
              any time by contacting us.
            </p>
          </div>

          {/* Submit Button */}
          <Button type="submit" className="w-full" size="lg">
            Start Survey
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
