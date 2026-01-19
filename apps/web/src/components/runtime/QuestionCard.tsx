'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

interface Question {
  id: string
  text: string
  type: 'scale' | 'text' | 'choice'
  required: boolean
  scaleMin?: number | null
  scaleMax?: number | null
  scaleMinLabel?: string | null
  scaleMaxLabel?: string | null
  choices?: string[] | null
}

interface QuestionCardProps {
  question: Question
  value?: number | string | null
  onChange: (value: number | string) => void
  onNext: () => void
  onPrevious?: () => void
  isFirst: boolean
  isLast: boolean
  showError: boolean
}

export function QuestionCard({
  question,
  value,
  onChange,
  onNext,
  onPrevious,
  isFirst,
  isLast,
  showError,
}: QuestionCardProps) {
  const [localValue, setLocalValue] = useState<number | string | null>(value || null)

  const handleChange = (newValue: number | string) => {
    setLocalValue(newValue)
    onChange(newValue)
  }

  const canProceed = !question.required || (localValue !== null && localValue !== '')

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-xl font-medium">
          {question.text}
          {question.required && <span className="text-destructive ml-1">*</span>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Scale Question */}
        {question.type === 'scale' && (
          <div className="space-y-4">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{question.scaleMinLabel || question.scaleMin}</span>
              <span>{question.scaleMaxLabel || question.scaleMax}</span>
            </div>
            <Slider
              min={question.scaleMin || 1}
              max={question.scaleMax || 10}
              step={1}
              value={[localValue as number || question.scaleMin || 1]}
              onValueChange={(values) => handleChange(values[0])}
              className="w-full"
            />
            <div className="text-center">
              <div className="text-4xl font-bold text-primary">
                {localValue || question.scaleMin || 1}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Selected value
              </div>
            </div>
          </div>
        )}

        {/* Text Question */}
        {question.type === 'text' && (
          <div className="space-y-2">
            <Textarea
              placeholder="Type your answer here..."
              value={(localValue as string) || ''}
              onChange={(e) => handleChange(e.target.value)}
              rows={5}
              className="resize-none"
            />
            <div className="text-xs text-muted-foreground text-right">
              {((localValue as string) || '').length} characters
            </div>
          </div>
        )}

        {/* Choice Question */}
        {question.type === 'choice' && question.choices && (
          <RadioGroup
            value={(localValue as string) || ''}
            onValueChange={handleChange}
          >
            <div className="space-y-3">
              {question.choices.map((choice, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={choice} id={`choice-${index}`} />
                  <Label
                    htmlFor={`choice-${index}`}
                    className="text-base font-normal cursor-pointer"
                  >
                    {choice}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        )}

        {/* Error Message */}
        {showError && !canProceed && (
          <div className="text-sm text-destructive">
            This question is required. Please provide an answer.
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-4">
          <Button
            variant="outline"
            onClick={onPrevious}
            disabled={isFirst}
          >
            Previous
          </Button>
          <Button
            onClick={onNext}
            disabled={!canProceed}
            className={cn(!canProceed && 'opacity-50 cursor-not-allowed')}
          >
            {isLast ? 'Submit' : 'Next'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
