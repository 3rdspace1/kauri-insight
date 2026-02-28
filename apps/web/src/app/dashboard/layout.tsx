import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

import { BarChart3, FileText, Home, Settings } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  return (
    <div className="flex min-h-screen bg-slate-50/50 dark:bg-slate-950/50">
      {/* Sidebar */}
      <aside className="hidden w-64 border-r glass border-white/10 md:block">
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center border-b px-6">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl">
              <BarChart3 className="h-6 w-6 text-primary" />
              Kauri Insight
            </Link>
          </div>
          <nav className="flex-1 space-y-1 p-4">
            <Link href="/dashboard">
              <Button variant="ghost" className="w-full justify-start">
                <Home className="mr-2 h-4 w-4" />
                Dashboard
              </Button>
            </Link>
            <Link href="/dashboard/surveys">
              <Button variant="ghost" className="w-full justify-start">
                <FileText className="mr-2 h-4 w-4" />
                Surveys
              </Button>
            </Link>
            <Link href="/dashboard/settings">
              <Button variant="ghost" className="w-full justify-start">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
            </Link>
          </nav>
          <div className="border-t p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <span className="text-sm font-medium text-primary">
                  {session.user?.email?.[0].toUpperCase()}
                </span>
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-medium">{session.user?.name || 'User'}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {session.user?.email}
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1">
        <div className="container py-6">{children}</div>
      </main>
    </div>
  )
}
