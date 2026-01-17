import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@kauri/db/client'
import { surveys, insights as insightsTable, responses } from '@kauri/db/schema'
import { eq, count } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Brain, Download, Sparkles, TrendingUp } from 'lucide-react'
import Link from 'next/link'

export default async function InsightsPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session?.tenantId) {
    return notFound()
  }

  const survey = await db.query.surveys.findFirst({
    where: eq(surveys.id, params.id),
  })

  if (!survey || survey.tenantId !== session.tenantId) {
    return notFound()
  }

  // Get insights
  const insights = await db.query.insights.findMany({
    where: eq(insightsTable.surveyId, params.id),
    orderBy: (insights, { desc }) => [desc(insights.createdAt)],
  })

  // Get response count
  const responseCount = await db
    .select({ count: count() })
    .from(responses)
    .where(eq(responses.surveyId, params.id))

  const totalResponses = responseCount[0]?.count || 0

  // Calculate sentiment breakdown
  const sentimentCounts = {
    positive: insights.filter((i) => i.sentiment === 'positive').length,
    neutral: insights.filter((i) => i.sentiment === 'neutral').length,
    negative: insights.filter((i) => i.sentiment === 'negative').length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/dashboard/surveys/${params.id}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Survey
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Insights</h1>
            <p className="text-muted-foreground">{survey.name}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
          <Button>
            <Sparkles className="mr-2 h-4 w-4" />
            Generate Insights
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Insights</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{insights.length}</div>
            <p className="text-xs text-muted-foreground">AI-generated</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Positive</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {sentimentCounts.positive}
            </div>
            <p className="text-xs text-muted-foreground">Insights</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Neutral</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sentimentCounts.neutral}</div>
            <p className="text-xs text-muted-foreground">Insights</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Negative</CardTitle>
            <TrendingUp className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {sentimentCounts.negative}
            </div>
            <p className="text-xs text-muted-foreground">Insights</p>
          </CardContent>
        </Card>
      </div>

      {/* Insights List */}
      {totalResponses === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Brain className="mb-4 h-16 w-16 text-muted-foreground" />
            <h3 className="mb-2 text-xl font-semibold">No responses yet</h3>
            <p className="mb-6 max-w-md text-muted-foreground">
              Collect some responses first, then generate insights to see AI-powered
              analysis of your survey data.
            </p>
          </CardContent>
        </Card>
      ) : insights.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Sparkles className="mb-4 h-16 w-16 text-muted-foreground" />
            <h3 className="mb-2 text-xl font-semibold">No insights generated yet</h3>
            <p className="mb-6 max-w-md text-muted-foreground">
              You have {totalResponses} response{totalResponses !== 1 ? 's' : ''}. Click
              "Generate Insights" to analyse them with AI.
            </p>
            <Button>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate Insights Now
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {insights.map((insight) => (
            <Card
              key={insight.id}
              className={`${
                insight.sentiment === 'positive'
                  ? 'border-l-4 border-l-green-500'
                  : insight.sentiment === 'negative'
                  ? 'border-l-4 border-l-red-500'
                  : 'border-l-4 border-l-gray-300'
              }`}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{insight.title}</CardTitle>
                    <div className="mt-1 flex gap-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          insight.sentiment === 'positive'
                            ? 'bg-green-100 text-green-700'
                            : insight.sentiment === 'negative'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {insight.sentiment}
                      </span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{insight.summary}</p>
                {insight.evidenceJson && (
                  <div className="mt-4">
                    <h4 className="mb-2 text-sm font-semibold">Evidence:</h4>
                    <div className="space-y-2">
                      {Array.isArray(insight.evidenceJson) &&
                        insight.evidenceJson.slice(0, 3).map((evidence: any, idx: number) => (
                          <div
                            key={idx}
                            className="rounded-lg bg-muted p-3 text-sm"
                          >
                            "{evidence.text || evidence}"
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
