export const runtime = 'edge'

'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { ConsentForm } from '@/components/runtime/ConsentForm'
import { QuestionCard } from '@/components/runtime/QuestionCard'
import { ProgressBar } from '@/components/runtime/ProgressBar'
import { ThankYou } from '@/components/runtime/ThankYou'
import { Loader2, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

interface LogicRule {
  id: string
  condition: 'equals' | 'not_equals' | 'greater_than' | 'less_than'
  value: string | number
  goTo: string // Target question ID or 'end'
}

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
  orderIndex: number
  logicJson?: {
    rules: LogicRule[]
  } | null
}

interface Survey {
  id: string
  title: string
  description: string | null
  questions: Question[]
}

type Stage = 'loading' | 'consent' | 'questions' | 'complete' | 'error'

export default function RuntimeSurveyPage() {
  const params = useParams()
  const surveyId = params.surveyId as string

  const [stage, setStage] = useState<Stage>('loading')
  const [survey, setSurvey] = useState<Survey | null>(null)
  const [responseId, setResponseId] = useState<string | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [navigationStack, setNavigationStack] = useState<number[]>([0])
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [showError, setShowError] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load survey
  useEffect(() => {
    const loadSurvey = async () => {
      try {
        const res = await fetch(`/api/runtime/${surveyId}`)
        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || 'Failed to load survey')
        }
        const data = await res.json()
        setSurvey(data)
        setStage('consent')
      } catch (err) {
        console.error('Error loading survey:', err)
        setError(err instanceof Error ? err.message : 'Failed to load survey')
        setStage('error')
      }
    }

    loadSurvey()
  }, [surveyId])

  // Handle consent submission
  const handleConsentSubmit = async (email: string) => {
    try {
      const res = await fetch('/api/responses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          surveyId,
          email,
          consentGiven: true,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to start survey')
      }

      const data = await res.json()
      setResponseId(data.response.id)
      setStage('questions')
    } catch (err) {
      console.error('Error starting survey:', err)
      setError(err instanceof Error ? err.message : 'Failed to start survey')
      setStage('error')
    }
  }

  // Handle answer change
  const handleAnswerChange = (questionId: string, value: number | string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }))
    setShowError(false)
  }

  // Save answer to API
  const saveAnswer = async (questionId: string, value: any) => {
    if (!responseId) return

    const question = survey?.questions.find((q) => q.id === questionId)
    if (!question) return

    try {
      const payload: any = { questionId }

      if (question.type === 'scale' || question.type === 'rating') {
        payload.valueScale = value
      } else if (question.type === 'text') {
        payload.valueText = value
      } else if (question.type === 'choice') {
        payload.valueChoice = value
      } else if (question.type === 'multi_select') {
        payload.valueChoice = Array.isArray(value) ? value.join(',') : value
      }

      const res = await fetch(`/api/responses/${responseId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        throw new Error('Failed to save answer')
      }
    } catch (err) {
      console.error('Error saving answer:', err)
      // Don't block progression on save error - let them continue
    }
  }

  const evaluateLogic = (question: Question, answer: any): string | null => {
    if (!question.logicJson || !question.logicJson.rules) return null

    for (const rule of question.logicJson.rules) {
      let isMatch = false
      const ruleValue = rule.value.toString()
      const answerValue = (answer ?? '').toString()

      switch (rule.condition) {
        case 'equals':
          isMatch = answerValue === ruleValue
          break
        case 'not_equals':
          isMatch = answerValue !== ruleValue
          break
        case 'greater_than':
          isMatch = Number(answerValue) > Number(ruleValue)
          break
        case 'less_than':
          isMatch = Number(answerValue) < Number(ruleValue)
          break
      }

      if (isMatch) return rule.goTo
    }

    return null
  }

  // Handle next question
  const handleNext = async () => {
    if (!survey) return

    const currentQuestion = survey.questions[currentQuestionIndex]
    const answer = answers[currentQuestion.id]

    // Validate required
    const isEmpty = answer === undefined || answer === '' || (Array.isArray(answer) && answer.length === 0)
    if (currentQuestion.required && isEmpty) {
      setShowError(true)
      return
    }

    // Save answer
    if (answer !== undefined && answer !== '') {
      await saveAnswer(currentQuestion.id, answer)
    }

    // Evaluate Branching Logic
    const goTo = evaluateLogic(currentQuestion, answer)

    if (goTo === 'end') {
      await completeResponse()
      return
    }

    let nextIndex = -1
    if (goTo) {
      nextIndex = survey.questions.findIndex((q: any) => q.id === goTo)
    }

    // Fallback to next in list if no logic or target not found
    if (nextIndex === -1) {
      if (currentQuestionIndex === survey.questions.length - 1) {
        await completeResponse()
        return
      }
      nextIndex = currentQuestionIndex + 1
    }

    setNavigationStack(prev => [...prev, nextIndex])
    setCurrentQuestionIndex(nextIndex)
    setShowError(false)
  }

  // Handle previous question
  const handlePrevious = () => {
    if (navigationStack.length > 1) {
      const newStack = [...navigationStack]
      newStack.pop() // Remove current
      const previousIndex = newStack[newStack.length - 1]
      setNavigationStack(newStack)
      setCurrentQuestionIndex(previousIndex)
      setShowError(false)
    }
  }

  // Complete response
  const completeResponse = async () => {
    if (!responseId) return

    try {
      const res = await fetch(`/api/responses/${responseId}/complete`, {
        method: 'POST',
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to complete survey')
      }

      setStage('complete')
    } catch (err) {
      console.error('Error completing survey:', err)
      setError(err instanceof Error ? err.message : 'Failed to complete survey')
      setStage('error')
    }
  }

  // Render based on stage
  if (stage === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-muted-foreground">Loading survey...</p>
        </div>
      </div>
    )
  }

  if (stage === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Alert variant="destructive" className="max-w-2xl">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error || 'Something went wrong'}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (stage === 'consent' && survey) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <ConsentForm surveyTitle={survey.title} onSubmit={handleConsentSubmit} />
      </div>
    )
  }

  if (stage === 'questions' && survey) {
    const currentQuestion = survey.questions[currentQuestionIndex]

    return (
      <div className="min-h-screen flex items-center justify-center bg-background/50 backdrop-blur-sm p-4">
        <div className="w-full max-w-4xl">
          <ProgressBar
            current={currentQuestionIndex + 1}
            total={survey.questions.length}
          />
          <QuestionCard
            question={currentQuestion}
            value={answers[currentQuestion.id]}
            onChange={(value) => handleAnswerChange(currentQuestion.id, value)}
            onNext={handleNext}
            onPrevious={handlePrevious}
            isFirst={currentQuestionIndex === 0}
            isLast={currentQuestionIndex === survey.questions.length - 1}
            showError={showError}
          />
        </div>
      </div>
    )
  }

  if (stage === 'complete' && survey) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <ThankYou surveyTitle={survey.title} />
      </div>
    )
  }

  return null
}
