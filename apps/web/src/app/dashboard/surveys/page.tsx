import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@kauri/db/client'
import { surveys } from '@kauri/db/schema'
import { eq } from 'drizzle-orm'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, BarChart3 } from 'lucide-react'
import Link from 'next/link'

export default async function SurveysPage() {
  const session = await getServerSession(authOptions)

  if (!session?.tenantId) {
    return (
      <div>
        <h1 className="text-3xl font-bold">Surveys</h1>
        <p className="text-muted-foreground">You need to be part of an organisation</p>
      </div>
    )
  }

  const tenantSurveys = await db.query.surveys.findMany({
    where: eq(surveys.tenantId, session.tenantId),
    orderBy: (surveys, { desc }) => [desc(surveys.createdAt)],
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Surveys</h1>
          <p className="text-muted-foreground">
            Manage your surveys and view responses
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Survey
        </Button>
      </div>

      {tenantSurveys.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <BarChart3 className="mb-4 h-16 w-16 text-muted-foreground" />
            <h3 className="mb-2 text-xl font-semibold">No surveys yet</h3>
            <p className="mb-6 max-w-md text-muted-foreground">
              Create your first adaptive survey to start collecting intelligent feedback
              from your users.
            </p>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Survey
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tenantSurveys.map((survey) => (
            <Card key={survey.id} className="hover:border-primary transition-colors">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="line-clamp-1">{survey.name}</CardTitle>
                    <CardDescription className="mt-1">
                      Type: {survey.type || 'Standard'}
                    </CardDescription>
                  </div>
                  <div className="rounded-full bg-muted px-2 py-1 text-xs font-medium">
                    {survey.status}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm text-muted-foreground">
                    Version {survey.version}
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/dashboard/surveys/${survey.id}`} className="flex-1">
                      <Button variant="outline" className="w-full" size="sm">
                        View Details
                      </Button>
                    </Link>
                    <Link href={`/dashboard/surveys/${survey.id}/insights`} className="flex-1">
                      <Button variant="outline" className="w-full" size="sm">
                        Insights
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
