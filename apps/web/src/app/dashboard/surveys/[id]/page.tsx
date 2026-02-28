import { auth } from '@/lib/auth'

import { db } from '@kauri/db/client'
import { surveys, questions, responses, responseItems, insights as insightsTable } from '@kauri/db/schema'
import { eq, count, desc } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, BarChart3, FileText, Share2, Brain, CheckCircle2, AlertTriangle, Info, ListTodo } from 'lucide-react'
import Link from 'next/link'
import { DeleteSurveyButton } from '@/components/surveys/DeleteSurveyButton'
import { PublishSurveyButton } from '@/components/surveys/PublishSurveyButton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { KanbanBoard } from '@/components/actions/KanbanBoard'

export default async function SurveyDetailPage({ params }: { params: { id: string } }) {
  const session = await auth()

  if (!session?.tenantId) {
    return notFound()
  }

  const survey = await db.query.surveys.findFirst({
    where: eq(surveys.id, params.id),
    with: {
      questions: true,
    },
  })

  if (!survey || survey.tenantId !== session.tenantId) {
    return notFound()
  }

  // Get response count
  const responseCount = await db
    .select({ count: count() })
    .from(responses)
    .where(eq(responses.surveyId, params.id))

  const totalResponses = responseCount[0]?.count || 0

  // Get completion stats
  const allResponses = await db.query.responses.findMany({
    where: eq(responses.surveyId, params.id),
    with: {
      items: true,
    },
  })

  const completedResponses = allResponses.filter(
    (r: any) => r.items.length === (survey.questions as any[]).length
  ).length

  const completionRate = totalResponses > 0
    ? Math.round((completedResponses / totalResponses) * 100)
    : 0

  // Get top insights
  const insights = await db.query.insights.findMany({
    where: eq(insightsTable.surveyId, params.id),
    limit: 3,
    orderBy: (insights: any, { desc }: any) => [desc(insights.createdAt)],
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/surveys">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{survey.name}</h1>
            <p className="text-muted-foreground">
              Status: {survey.status} • Version {survey.version}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {survey.status === 'draft' && (
            <PublishSurveyButton surveyId={params.id} />
          )}
          <DeleteSurveyButton surveyId={params.id} surveyName={survey.name} />
          <Button variant="outline">
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
          <Link href={`/dashboard/surveys/${params.id}/insights`}>
            <Button>
              <BarChart3 className="mr-2 h-4 w-4" />
              View Insights
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Responses</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalResponses}</div>
            <p className="text-xs text-muted-foreground">
              {completedResponses} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completionRate}%</div>
            <p className="text-xs text-muted-foreground">
              Of all responses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Questions</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(survey.questions as any[]).length}</div>
            <p className="text-xs text-muted-foreground">
              In this survey
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Insights Summary */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              AI Insights Summary
            </CardTitle>
            <CardDescription>
              Key findings from {totalResponses} responses
            </CardDescription>
          </div>
          <Link href={`/dashboard/surveys/${params.id}/insights`}>
            <Button variant="outline" size="sm">Full Analysis</Button>
          </Link>
        </CardHeader>
        <CardContent>
          {insights.length === 0 ? (
            <div className="py-4 text-center text-muted-foreground">
              {totalResponses < 5
                ? "Collect 5 responses to unlock AI insights automatically."
                : "No insights generated yet. Click 'View Insights' to trigger manual analysis."}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              {insights.map((insight: any) => (
                <div key={insight.id} className="rounded-lg bg-background p-4 shadow-sm border">
                  <div className="flex items-start gap-3">
                    {insight.sentiment === 'positive' && <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />}
                    {insight.sentiment === 'negative' && <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />}
                    {insight.sentiment === 'neutral' && <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />}
                    <div>
                      <h4 className="font-semibold text-sm line-clamp-1">{insight.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {insight.summary}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Survey Links & Content Tabs */}
      <Tabs defaultValue="questions" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
          <TabsTrigger value="questions" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Questions
          </TabsTrigger>
          <TabsTrigger value="actions" className="flex items-center gap-2">
            <ListTodo className="h-4 w-4" />
            Actions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="questions" className="space-y-6 pt-4">
          {/* Questions */}
          <Card>
            <CardHeader>
              <CardTitle>Questions</CardTitle>
              <CardDescription>
                Review the questions in this survey
              </CardDescription>
            </CardHeader>
            <CardContent>
              {(survey.questions as any[]).length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  No questions added yet
                </div>
              ) : (
                <div className="space-y-4">
                  {(survey.questions as any[]).map((question: any, index: number) => (
                    <div
                      key={question.id}
                      className="rounded-lg border p-4"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{question.text}</h4>
                          <div className="mt-1 flex gap-2 text-sm text-muted-foreground">
                            <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
                              {question.kind}
                            </span>
                            {question.kind === 'scale' && question.scaleMin && question.scaleMax && (
                              <span className="text-xs">
                                Scale: {question.scaleMin} - {question.scaleMax}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Survey Link */}
          <Card>
            <CardHeader>
              <CardTitle>Survey Link</CardTitle>
              <CardDescription>
                Share this link with respondents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <code className="flex-1 rounded bg-muted px-3 py-2 text-sm">
                  {typeof window !== 'undefined' ? window.location.origin : ''}/runtime/{params.id}
                </code>
                <Button variant="outline" size="sm">
                  Copy
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="actions" className="pt-4">
          <KanbanBoard surveyId={params.id} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
