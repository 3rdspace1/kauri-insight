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
import { Plus, Trash2, Save, ArrowLeft, Brain, Sparkles } from 'lucide-react'
import Link from 'next/link'

type QuestionType = 'scale' | 'text' | 'choice' | 'multi_select' | 'rating'

interface LogicRule {
  id: string
  condition: 'equals' | 'not_equals' | 'greater_than' | 'less_than'
  value: string | number
  goTo: string // Target question ID
}

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
  logicJson?: {
    rules: LogicRule[]
  }
}

export default function NewSurveyPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [name, setName] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [language, setLanguage] = useState('en')
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
      logicJson: newQuestion.logicJson,
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
    if (!name) {
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
          name: name,
          type: 'general',
          status: 'draft',
          title: title || name,
          description,
          language,
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
            choices: question.type === 'choice' || question.type === 'multi_select' ? question.choices : undefined,
            logicJson: question.logicJson,
            orderIndex: index,
            id: question.id, // Pass client-side ID to use for branching
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
          <h1 className="text-3xl font-bold">{name || 'New Survey'}</h1>
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
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Survey Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Patient Satisfaction Survey"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="What is this survey about?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="de">German</SelectItem>
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
                <div className="flex gap-2">
                  <Input
                    id="questionText"
                    placeholder="e.g., How would you rate your overall experience?"
                    value={newQuestion.text || ''}
                    onChange={(e) => setNewQuestion({ ...newQuestion, text: e.target.value })}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="shrink-0"
                    title="Translate with AI"
                    onClick={async () => {
                      if (!newQuestion.text) return
                      try {
                        const res = await fetch('/api/translate', {
                          method: 'POST',
                          body: JSON.stringify({ text: newQuestion.text, targetLanguage: language })
                        })
                        const data = await res.json()
                        if (data.translatedText) {
                          setNewQuestion({ ...newQuestion, text: data.translatedText })
                        }
                      } catch (err) {
                        console.error('Translation failed')
                      }
                    }}
                  >
                    <Sparkles className="h-4 w-4 text-purple-500" />
                  </Button>
                </div>
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
                    <SelectItem value="rating">Rating (Star Rating)</SelectItem>
                    <SelectItem value="choice">Multiple Choice (Single)</SelectItem>
                    <SelectItem value="multi_select">Multiple Choice (Multiple)</SelectItem>
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

              {(newQuestion.type === 'choice' || newQuestion.type === 'multi_select') && (
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
                  onCheckedChange={(checked: boolean) =>
                    setNewQuestion({ ...newQuestion, required: checked })
                  }
                />
                <Label htmlFor="required" className="font-normal">
                  Required question
                </Label>
              </div>

              {/* Logic Builder */}
              {(newQuestion.type === 'choice' || newQuestion.type === 'scale' || newQuestion.type === 'rating') && (
                <div className="space-y-4 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-semibold">Branching Logic</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newRule: LogicRule = {
                          id: crypto.randomUUID(),
                          condition: 'equals',
                          value: '',
                          goTo: ''
                        }
                        setNewQuestion({
                          ...newQuestion,
                          logicJson: {
                            rules: [...(newQuestion.logicJson?.rules || []), newRule]
                          }
                        })
                      }}
                    >
                      <Plus className="h-3 w-3 mr-1" /> Add Rule
                    </Button>
                  </div>

                  {newQuestion.logicJson?.rules.map((rule, idx) => (
                    <div key={rule.id} className="grid grid-cols-12 gap-2 items-end bg-muted/30 p-3 rounded-lg border border-dashed">
                      <div className="col-span-3 space-y-1">
                        <Label className="text-[10px] uppercase text-muted-foreground">If Answer</Label>
                        <Select
                          value={rule.condition}
                          onValueChange={(val: any) => {
                            const rules = [...(newQuestion.logicJson?.rules || [])]
                            rules[idx].condition = val
                            setNewQuestion({ ...newQuestion, logicJson: { rules } })
                          }}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="equals">Equals</SelectItem>
                            <SelectItem value="not_equals">Not equals</SelectItem>
                            {newQuestion.type !== 'choice' && (
                              <>
                                <SelectItem value="greater_than">Greater than</SelectItem>
                                <SelectItem value="less_than">Less than</SelectItem>
                              </>
                            )}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="col-span-3 space-y-1">
                        <Label className="text-[10px] uppercase text-muted-foreground">Value</Label>
                        <Input
                          className="h-8 text-xs"
                          value={rule.value}
                          onChange={(e) => {
                            const rules = [...(newQuestion.logicJson?.rules || [])]
                            rules[idx].value = e.target.value
                            setNewQuestion({ ...newQuestion, logicJson: { rules } })
                          }}
                        />
                      </div>

                      <div className="col-span-5 space-y-1">
                        <Label className="text-[10px] uppercase text-muted-foreground">Go To</Label>
                        <Select
                          value={rule.goTo}
                          onValueChange={(val) => {
                            const rules = [...(newQuestion.logicJson?.rules || [])]
                            rules[idx].goTo = val
                            setNewQuestion({ ...newQuestion, logicJson: { rules } })
                          }}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="Next question" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="end">End of Survey</SelectItem>
                            {questions.filter(q => q.id !== newQuestion.id).map((q, i) => (
                              <SelectItem key={q.id} value={q.id}>
                                Q{i + 1}: {q.text.substring(0, 30)}...
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="col-span-1 pb-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-destructive"
                          onClick={() => {
                            const rules = newQuestion.logicJson?.rules.filter(r => r.id !== rule.id) || []
                            setNewQuestion({ ...newQuestion, logicJson: { rules } })
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  {(!newQuestion.logicJson?.rules || newQuestion.logicJson.rules.length === 0) && (
                    <p className="text-[10px] text-center text-muted-foreground italic">
                      No logic rules defined. This question will follow the default order.
                    </p>
                  )}
                </div>
              )}

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
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                          {index + 1}
                        </div>
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
                                {question.logicJson && question.logicJson.rules.length > 0 && (
                                  <span className="text-xs bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded">
                                    {question.logicJson.rules.length} logic rules
                                  </span>
                                )}
                              </div>
                              {question.type === 'scale' && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  Scale: {question.scaleMin || 1} - {question.scaleMax || 10}
                                </p>
                              )}
                              {(question.type === 'choice' || question.type === 'multi_select') && question.choices && (
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
                disabled={isSubmitting || !name || questions.length === 0}
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
