'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { FileDown, Loader2, Sparkles } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

interface ExportReportButtonProps {
  surveyId: string
  surveyName: string
  insightCount: number
}

export function ExportReportButton({ surveyId, surveyName, insightCount }: ExportReportButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const { toast } = useToast()

  const handleExport = async () => {
    if (insightCount === 0) {
      toast({
        title: 'No insights yet',
        description: 'Generate some insights first to create an executive report.',
        variant: 'destructive',
      })
      return
    }

    setIsGenerating(true)
    try {
      // 1. Generate/Fetch the report
      const res = await fetch(`/api/surveys/${surveyId}/reports`, {
        method: 'POST',
      })

      if (!res.ok) throw new Error('Failed to generate report')
      const { report } = await res.json()

      // 2. Trigger PDF download
      toast({
        title: 'Generating PDF...',
        description: 'This may take a few seconds as we prepare your executive summary.',
      })

      // We open this in a new tab to trigger the download
      window.open(`/api/reports/${report.id}/export`, '_blank')

    } catch (err) {
      console.error('Export error:', err)
      toast({
        title: 'Export Failed',
        description: 'There was an error generating your PDF report.',
        variant: 'destructive',
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Button
      onClick={handleExport}
      disabled={isGenerating}
      variant="outline"
      className="bg-primary/5 border-primary/20 hover:bg-primary/10"
    >
      {isGenerating ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Preparing Report...
        </>
      ) : (
        <>
          <FileDown className="mr-2 h-4 w-4" />
          Export Executive PDF
        </>
      )}
    </Button>
  )
}
