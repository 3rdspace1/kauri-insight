export const runtime = 'edge'

import { auth } from '@/lib/auth'

import { db } from '@kauri/db/client'
import { surveys, responses, insights as insightsTable } from '@kauri/db/schema'
import { eq, count } from 'drizzle-orm'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BarChart3, FileText, TrendingUp, Users, Activity } from 'lucide-react'
import Link from 'next/link'
import { DashboardStats } from '@/components/dashboard/DashboardStats'
import { LatestActivity } from '@/components/dashboard/LatestActivity'

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.tenantId) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Welcome to Kauri Insight</h1>
          <p className="text-muted-foreground">
            Get started by creating your first survey
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>No organisation found</CardTitle>
            <CardDescription>
              You need to be part of an organisation to use Kauri Insight
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Contact your administrator or create a new organisation to get started.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Fetch survey stats
  const tenantSurveys = await db.query.surveys.findMany({
    where: eq(surveys.tenantId, session.tenantId),
    limit: 10,
  })

  const surveyCount = tenantSurveys.length

  // Calculate total responses
  let totalResponses = 0
  for (const survey of tenantSurveys) {
    const result = await db
      .select({ count: count() })
      .from(responses)
      .where(eq(responses.surveyId, survey.id))
    totalResponses += result[0]?.count || 0
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your surveys and insights
        </p>
      </div>

      <DashboardStats initialData={{
        surveyCount,
        totalResponses,
        insightsCount: await db
          .select({ count: count() })
          .from(insightsTable)
          .innerJoin(surveys, eq(insightsTable.surveyId, surveys.id))
          .where(eq(surveys.tenantId, session.tenantId))
          .then((res: any) => res[0]?.count || 0)
      }} />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Surveys */}
        <div className="lg:col-span-2">
          <Card className="glass border-white/10 shadow-lg h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Surveys</CardTitle>
                  <CardDescription>Your latest survey activity</CardDescription>
                </div>
                <Link href="/dashboard/surveys">
                  <Button>View All</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {surveyCount === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <BarChart3 className="mb-4 h-12 w-12 text-muted-foreground" />
                  <h3 className="mb-2 text-lg font-semibold">No surveys yet</h3>
                  <p className="mb-4 text-sm text-muted-foreground">
                    Create your first survey to start collecting responses
                  </p>
                  <Link href="/dashboard/surveys">
                    <Button>Create Survey</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {tenantSurveys.slice(0, 5).map((survey: any) => (
                    <div
                      key={survey.id}
                      className="flex items-center justify-between border-b border-white/5 pb-4 last:border-0 last:pb-0"
                    >
                      <div>
                        <h4 className="font-medium">{survey.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Status: {survey.status}
                        </p>
                      </div>
                      <Link href={`/dashboard/surveys/${survey.id}`}>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Pulse Feed */}
        <div className="lg:col-span-1">
          <LatestActivity />
        </div>
      </div>
    </div>
  )
}
