'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Question {
  id: string
  text: string
  type: 'scale' | 'text' | 'choice' | 'multi_select' | 'rating'
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
  const [localValue, setLocalValue] = useState<any>(value || (question.type === 'multi_select' ? [] : null))

  const handleChange = (newValue: any) => {
    setLocalValue(newValue)
    onChange(newValue)
  }

  const handleMultiSelectChange = (choice: string, checked: boolean) => {
    const currentValues = Array.isArray(localValue) ? localValue : []
    const nextValues = checked
      ? [...currentValues, choice]
      : currentValues.filter((v: string) => v !== choice)
    handleChange(nextValues)
  }

  const canProceed = !question.required || (
    question.type === 'multi_select'
      ? (Array.isArray(localValue) && localValue.length > 0)
      : (localValue !== null && localValue !== '')
  )

  return (
    <Card className="w-full max-w-2xl mx-auto glass shadow-xl border-white/20">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
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
              onValueChange={(values: number[]) => handleChange(values[0])}
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
                <div key={index} className="flex items-center space-x-3 rounded-lg border p-3 hover:bg-accent cursor-pointer transition-colors"
                  onClick={() => handleChange(choice)}
                >
                  <RadioGroupItem value={choice} id={`choice-${index}`} />
                  <Label
                    htmlFor={`choice-${index}`}
                    className="text-base font-normal cursor-pointer flex-1"
                  >
                    {choice}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        )}

        {/* Multi-Select Question */}
        {question.type === 'multi_select' && question.choices && (
          <div className="space-y-3">
            {question.choices.map((choice, index) => (
              <div key={index} className="flex items-center space-x-3 rounded-lg border p-3 hover:bg-accent cursor-pointer transition-colors"
                onClick={() => handleMultiSelectChange(choice, !(Array.isArray(localValue) && localValue.includes(choice)))}
              >
                <Checkbox
                  id={`choice-${index}`}
                  checked={Array.isArray(localValue) && localValue.includes(choice)}
                  onCheckedChange={(checked: boolean) => handleMultiSelectChange(choice, !!checked)}
                  onClick={(e: React.MouseEvent) => e.stopPropagation()}
                />
                <Label
                  htmlFor={`choice-${index}`}
                  className="text-base font-normal cursor-pointer flex-1"
                >
                  {choice}
                </Label>
              </div>
            ))}
          </div>
        )}

        {/* Rating Question */}
        {question.type === 'rating' && (
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className="focus:outline-none transition-transform active:scale-90"
                onClick={() => handleChange(star)}
              >
                <Star
                  className={cn(
                    "h-12 w-12",
                    localValue >= star ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                  )}
                />
              </button>
            ))}
          </div>
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
