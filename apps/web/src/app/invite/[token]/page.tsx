'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { BarChart3, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function InviteAcceptPage({ params }: { params: { token: string } }) {
  const router = useRouter()
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [error, setError] = useState('')

  const handleAccept = async () => {
    setStatus('loading')
    setError('')

    try {
      const res = await fetch(`/api/teams/invites/${params.token}/accept`, {
        method: 'POST',
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to accept invitation')
      }

      setStatus('success')
      setTimeout(() => router.push('/dashboard'), 2000)
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
      setStatus('error')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link href="/" className="mx-auto mb-4 flex items-center gap-2 font-bold text-xl">
            <BarChart3 className="h-6 w-6 text-primary" />
            Kauri Insight
          </Link>

          {status === 'success' ? (
            <>
              <div className="mx-auto mb-2">
                <CheckCircle2 className="h-12 w-12 text-green-500" />
              </div>
              <CardTitle>You&apos;re in!</CardTitle>
              <CardDescription>
                Invitation accepted. Redirecting to your dashboard...
              </CardDescription>
            </>
          ) : (
            <>
              <CardTitle>Team Invitation</CardTitle>
              <CardDescription>
                You&apos;ve been invited to join an organisation on Kauri Insight.
              </CardDescription>
            </>
          )}
        </CardHeader>

        {status !== 'success' && (
          <CardContent className="space-y-4">
            {status === 'error' && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button
              className="w-full"
              onClick={handleAccept}
              disabled={status === 'loading'}
            >
              {status === 'loading' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {status === 'loading' ? 'Accepting...' : 'Accept Invitation'}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              You&apos;ll need to sign in first if you don&apos;t have an account.
            </p>
          </CardContent>
        )}
      </Card>
    </div>
  )
}
