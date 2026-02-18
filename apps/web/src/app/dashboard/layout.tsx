import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { Sidebar } from '@/components/dashboard/Sidebar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  return (
    <div className="flex min-h-screen bg-slate-50/50 dark:bg-slate-950/50">
      <Sidebar
        user={{
          name: session.user?.name,
          email: session.user?.email,
        }}
      />

      {/* Main content — pt-14 on mobile for the fixed header */}
      <main className="flex-1 pt-14 md:pt-0">
        <div className="container py-6">{children}</div>
      </main>
    </div>
  )
}
