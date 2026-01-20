import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { db } from '@kauri/db/client'
import { tenants } from '@kauri/db/schema'
import { eq } from 'drizzle-orm'
import { BusinessContextForm } from '@/components/settings/BusinessContextForm'

export default async function BusinessSettingsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.tenantId) {
    redirect('/login')
  }

  // Fetch tenant data
  const tenant = await db.query.tenants.findFirst({
    where: eq(tenants.id, session.tenantId),
  })

  if (!tenant) {
    redirect('/login')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Business Context</h1>
        <p className="text-muted-foreground mt-2">
          Configure your business information to power AI-driven insights and industry-aware recommendations.
        </p>
      </div>

      <BusinessContextForm
        tenantId={tenant.id}
        initialData={{
          name: tenant.name,
          industry: tenant.industry || '',
          website: tenant.website || '',
          description: tenant.description || '',
          logo: tenant.logo || '',
          primaryColor: tenant.primaryColor || '#667eea',
        }}
      />

      <div className="rounded-lg border bg-muted/50 p-6">
        <h3 className="font-semibold mb-2">🤖 How This Powers Your Reports</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>✅ Industry-specific trends and benchmarks in reports</li>
          <li>✅ Competitive analysis based on your sector</li>
          <li>✅ Contextual recommendations aligned with best practices</li>
          <li>✅ Branded reports with your logo and colors</li>
          <li>✅ AI-generated visuals relevant to your business</li>
        </ul>
      </div>
    </div>
  )
}
