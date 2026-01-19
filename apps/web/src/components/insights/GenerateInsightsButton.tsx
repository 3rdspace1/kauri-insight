'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Sparkles, Loader2 } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

interface GenerateInsightsButtonProps {
  surveyId: string
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg'
  showIcon?: boolean
}

export function GenerateInsightsButton({
  surveyId,
  variant = 'default',
  size = 'default',
  showIcon = true,
}: GenerateInsightsButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleGenerate = async () => {
    setIsGenerating(true)

    try {
      const res = await fetch('/api/insights/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ surveyId }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate insights')
      }

      toast({
        title: 'Success!',
        description: `Generated ${data.results?.length || 0} insights from survey responses.`,
      })

      // Refresh the page to show new insights
      router.refresh()
    } catch (error) {
      console.error('Error generating insights:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to generate insights',
        variant: 'destructive',
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Button
      onClick={handleGenerate}
      disabled={isGenerating}
      variant={variant}
      size={size}
    >
      {isGenerating ? (
        <Loader2 className={showIcon ? 'mr-2 h-4 w-4 animate-spin' : 'h-4 w-4 animate-spin'} />
      ) : showIcon ? (
        <Sparkles className="mr-2 h-4 w-4" />
      ) : null}
      {isGenerating ? 'Generating...' : 'Generate Insights'}
    </Button>
  )
}
