import { auth } from '@/lib/auth'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { redirect } from 'next/navigation'
import { db } from '@kauri/db/client'
import { memberships, invitations } from '@kauri/db/schema'
import { eq } from 'drizzle-orm'
import { InviteMemberForm } from '@/components/teams/InviteMemberForm'
import { TeamMemberList } from '@/components/teams/TeamMemberList'

export default async function SettingsPage() {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and preferences
        </p>
      </div>

      {/* Account */}
      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>Your account information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Email</label>
            <p className="text-sm text-muted-foreground">{session.user?.email}</p>
          </div>
          <div>
            <label className="text-sm font-medium">Name</label>
            <p className="text-sm text-muted-foreground">
              {session.user?.name || 'Not set'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Organisation */}
      {session.tenantId && (
        <Card className="glass border-white/10 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Organisation & Team</CardTitle>
                <CardDescription>Manage your team members and roles</CardDescription>
              </div>
              {(session.role === 'admin' || session.role === 'owner') && (
                <InviteMemberForm />
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 rounded-lg bg-muted/30 border">
                <label className="text-xs font-semibold uppercase text-muted-foreground">Organisation ID</label>
                <p className="text-sm font-mono mt-1">{session.tenantId}</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/30 border">
                <label className="text-xs font-semibold uppercase text-muted-foreground">My Role</label>
                <div className="mt-1">
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary">
                    {session.role || 'Member'}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Active Members</h3>
              <TeamMemberList
                tenantId={session.tenantId}
                currentUserRole={session.role}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600">Danger Zone</CardTitle>
          <CardDescription>Irreversible actions</CardDescription>
        </CardHeader>
        <CardContent>
          <form action="/api/auth/signout" method="post">
            <Button type="submit" variant="destructive">
              Sign Out
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
