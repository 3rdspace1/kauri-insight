'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { Rocket, Loader2 } from 'lucide-react'

export function PublishSurveyButton({ surveyId }: { surveyId: string }) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const { toast } = useToast()

    const handlePublish = async () => {
        setLoading(true)
        try {
            const res = await fetch(`/api/surveys/${surveyId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'active' }),
            })

            if (res.ok) {
                toast({
                    title: 'Survey Published!',
                    description: 'Your survey is now active and ready for responses.',
                })
                router.refresh()
            } else {
                throw new Error('Failed to publish survey')
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to publish survey. Please try again.',
                variant: 'destructive',
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Button onClick={handlePublish} disabled={loading} className="bg-green-600 hover:bg-green-700">
            {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
                <Rocket className="mr-2 h-4 w-4" />
            )}
            Publish Survey
        </Button>
    )
}
