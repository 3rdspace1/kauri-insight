import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { redirect } from 'next/navigation'
import { signOut } from 'next-auth/react'

export default async function SettingsPage() {
  const session = await getServerSession(authOptions)

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
        <Card>
          <CardHeader>
            <CardTitle>Organisation</CardTitle>
            <CardDescription>Your organisation details</CardDescription>
          </CardHeader>
          <CardContent>
            <div>
              <label className="text-sm font-medium">Organisation ID</label>
              <p className="text-sm text-muted-foreground">{session.tenantId}</p>
            </div>
            <div className="mt-2">
              <label className="text-sm font-medium">Role</label>
              <p className="text-sm text-muted-foreground">
                {session.role || 'Member'}
              </p>
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
