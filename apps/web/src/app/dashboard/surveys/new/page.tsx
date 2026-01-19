'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/components/ui/use-toast'
import { ArrowLeft, Plus, Trash2, GripVertical } from 'lucide-react'
import Link from 'next/link'

type QuestionType = 'scale' | 'text' | 'choice'

interface Question {
  id: string
  text: string
  type: QuestionType
  required: boolean
  scaleMin?: number
  scaleMax?: number
  scaleMinLabel?: string
  scaleMaxLabel?: string
  choices?: string[]
}

export default function NewSurveyPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [surveyName, setSurveyName] = useState('')
  const [surveyDescription, setSurveyDescription] = useState('')
  const [surveyType, setSurveyType] = useState<string>('general')
  const [questions, setQuestions] = useState<Question[]>([])
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null)

  // Form state for new question
  const [newQuestion, setNewQuestion] = useState<Partial<Question>>({
    text: '',
    type: 'text',
    required: true,
  })

  const addQuestion = () => {
    if (!newQuestion.text) {
      toast({
        title: 'Error',
        description: 'Question text is required',
        variant: 'destructive',
      })
      return
    }

    const question: Question = {
      id: crypto.randomUUID(),
      text: newQuestion.text,
      type: newQuestion.type || 'text',
      required: newQuestion.required ?? true,
      scaleMin: newQuestion.scaleMin,
      scaleMax: newQuestion.scaleMax,
      scaleMinLabel: newQuestion.scaleMinLabel,
      scaleMaxLabel: newQuestion.scaleMaxLabel,
      choices: newQuestion.choices,
    }

    if (editingQuestionId) {
      // Update existing question
      setQuestions(questions.map(q => q.id === editingQuestionId ? question : q))
      setEditingQuestionId(null)
    } else {
      // Add new question
      setQuestions([...questions, question])
    }

    // Reset form
    setNewQuestion({
      text: '',
      type: 'text',
      required: true,
    })
  }

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id))
  }

  const editQuestion = (question: Question) => {
    setNewQuestion(question)
    setEditingQuestionId(question.id)
  }

  const handleSubmit = async () => {
    if (!surveyName) {
      toast({
        title: 'Error',
        description: 'Survey name is required',
        variant: 'destructive',
      })
      return
    }

    if (questions.length === 0) {
      toast({
        title: 'Error',
        description: 'Add at least one question',
        variant: 'destructive',
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Create survey
      const surveyRes = await fetch('/api/surveys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: surveyName,
          type: surveyType,
          status: 'draft',
        }),
      })

      if (!surveyRes.ok) {
        throw new Error('Failed to create survey')
      }

      const { data: survey } = await surveyRes.json()

      // Create questions
      for (const [index, question] of questions.entries()) {
        const questionRes = await fetch(`/api/surveys/${survey.id}/questions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            kind: question.type,
            text: question.text,
            type: question.type,
            required: question.required,
            scaleMin: question.type === 'scale' ? (question.scaleMin || 1) : undefined,
            scaleMax: question.type === 'scale' ? (question.scaleMax || 10) : undefined,
            scaleMinLabel: question.scaleMinLabel,
            scaleMaxLabel: question.scaleMaxLabel,
            choices: question.type === 'choice' ? question.choices : undefined,
            orderIndex: index,
          }),
        })

        if (!questionRes.ok) {
          throw new Error(`Failed to create question: ${question.text}`)
        }
      }

      toast({
        title: 'Success!',
        description: 'Survey created successfully',
      })

      router.push(`/dashboard/surveys/${survey.id}`)
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create survey',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/surveys">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Surveys
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Create New Survey</h1>
          <p className="text-muted-foreground">Build your survey step by step</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Column: Survey Details */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Survey Details</CardTitle>
              <CardDescription>Basic information about your survey</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Survey Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Patient Satisfaction Survey"
                  value={surveyName}
                  onChange={(e) => setSurveyName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="What is this survey about?"
                  value={surveyDescription}
                  onChange={(e) => setSurveyDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Survey Type</Label>
                <Select value={surveyType} onValueChange={setSurveyType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="appointment_follow_up">Appointment Follow-up</SelectItem>
                    <SelectItem value="pulse_check">Pulse Check</SelectItem>
                    <SelectItem value="post_emergency">Post Emergency</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Add Question</CardTitle>
              <CardDescription>
                {editingQuestionId ? 'Edit the question below' : 'Create a new question'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="questionText">Question Text *</Label>
                <Textarea
                  id="questionText"
                  placeholder="e.g., How would you rate your overall experience?"
                  value={newQuestion.text || ''}
                  onChange={(e) => setNewQuestion({ ...newQuestion, text: e.target.value })}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="questionType">Question Type</Label>
                <Select
                  value={newQuestion.type || 'text'}
                  onValueChange={(value) =>
                    setNewQuestion({ ...newQuestion, type: value as QuestionType })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text (Open-ended)</SelectItem>
                    <SelectItem value="scale">Scale (1-10 Slider)</SelectItem>
                    <SelectItem value="choice">Multiple Choice</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {newQuestion.type === 'scale' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="scaleMin">Min Value</Label>
                    <Input
                      id="scaleMin"
                      type="number"
                      value={newQuestion.scaleMin || 1}
                      onChange={(e) =>
                        setNewQuestion({ ...newQuestion, scaleMin: parseInt(e.target.value) })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="scaleMax">Max Value</Label>
                    <Input
                      id="scaleMax"
                      type="number"
                      value={newQuestion.scaleMax || 10}
                      onChange={(e) =>
                        setNewQuestion({ ...newQuestion, scaleMax: parseInt(e.target.value) })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="scaleMinLabel">Min Label</Label>
                    <Input
                      id="scaleMinLabel"
                      placeholder="e.g., Not satisfied"
                      value={newQuestion.scaleMinLabel || ''}
                      onChange={(e) =>
                        setNewQuestion({ ...newQuestion, scaleMinLabel: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="scaleMaxLabel">Max Label</Label>
                    <Input
                      id="scaleMaxLabel"
                      placeholder="e.g., Very satisfied"
                      value={newQuestion.scaleMaxLabel || ''}
                      onChange={(e) =>
                        setNewQuestion({ ...newQuestion, scaleMaxLabel: e.target.value })
                      }
                    />
                  </div>
                </div>
              )}

              {newQuestion.type === 'choice' && (
                <div className="space-y-2">
                  <Label htmlFor="choices">Choices (one per line)</Label>
                  <Textarea
                    id="choices"
                    placeholder="Option 1&#10;Option 2&#10;Option 3"
                    value={newQuestion.choices?.join('\n') || ''}
                    onChange={(e) =>
                      setNewQuestion({
                        ...newQuestion,
                        choices: e.target.value.split('\n').filter(Boolean),
                      })
                    }
                    rows={4}
                  />
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="required"
                  checked={newQuestion.required ?? true}
                  onCheckedChange={(checked) =>
                    setNewQuestion({ ...newQuestion, required: checked as boolean })
                  }
                />
                <Label htmlFor="required" className="font-normal">
                  Required question
                </Label>
              </div>

              <Button onClick={addQuestion} className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                {editingQuestionId ? 'Update Question' : 'Add Question'}
              </Button>

              {editingQuestionId && (
                <Button
                  onClick={() => {
                    setEditingQuestionId(null)
                    setNewQuestion({ text: '', type: 'text', required: true })
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Cancel Edit
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Question List */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Questions ({questions.length})</CardTitle>
              <CardDescription>Preview and manage your survey questions</CardDescription>
            </CardHeader>
            <CardContent>
              {questions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No questions yet. Add your first question to get started.
                </div>
              ) : (
                <div className="space-y-3">
                  {questions.map((question, index) => (
                    <Card key={question.id} className="p-4">
                      <div className="flex items-start gap-3">
                        <GripVertical className="h-5 w-5 text-muted-foreground mt-1 cursor-move" />
                        <div className="flex-1 space-y-1">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="font-medium">
                                {index + 1}. {question.text}
                              </p>
                              <div className="flex gap-2 mt-1">
                                <span className="text-xs bg-muted px-2 py-0.5 rounded">
                                  {question.type}
                                </span>
                                {question.required && (
                                  <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                                    Required
                                  </span>
                                )}
                              </div>
                              {question.type === 'scale' && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  Scale: {question.scaleMin || 1} - {question.scaleMax || 10}
                                </p>
                              )}
                              {question.type === 'choice' && question.choices && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  {question.choices.length} choices
                                </p>
                              )}
                            </div>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => editQuestion(question)}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeQuestion(question.id)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !surveyName || questions.length === 0}
                className="w-full"
                size="lg"
              >
                {isSubmitting ? 'Creating Survey...' : 'Create Survey'}
              </Button>
              <p className="text-xs text-muted-foreground text-center mt-2">
                Survey will be created as a draft. You can activate it later.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
