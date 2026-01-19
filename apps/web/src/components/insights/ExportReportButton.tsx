'use client'

import { useState } from 'react'
import { Download, FileText, Presentation } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { useToast } from '@/components/ui/use-toast'

interface ExportReportButtonProps {
  surveyId: string
  surveyName: string
  insightCount: number
}

export function ExportReportButton({ surveyId, surveyName, insightCount }: ExportReportButtonProps) {
  const { toast } = useToast()
  const [isExporting, setIsExporting] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  const handleExport = async (format: 'pdf' | 'pptx') => {
    setIsExporting(true)

    try {
      const response = await fetch(`/api/reports/${surveyId}/export?format=${format}`, {
        method: 'POST',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Export failed')
      }

      // Download the file
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `survey-report-${surveyId}.${format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: 'Success!',
        description: `Report exported as ${format.toUpperCase()}`,
      })

      setIsOpen(false)
    } catch (error: any) {
      toast({
        title: 'Export Failed',
        description: error.message || 'Failed to export report',
        variant: 'destructive',
      })
    } finally {
      setIsExporting(false)
    }
  }

  if (insightCount === 0) {
    return (
      <Button variant="outline" disabled>
        <Download className="mr-2 h-4 w-4" />
        Export Report
      </Button>
    )
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Export Report</AlertDialogTitle>
          <AlertDialogDescription>
            Choose your preferred format to download a comprehensive report for{' '}
            <span className="font-semibold">&quot;{surveyName}&quot;</span>
            <br />
            <br />
            The report includes all {insightCount} insights, sentiment analysis, key metrics, and recommendations.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4">
          <Button
            onClick={() => handleExport('pdf')}
            disabled={isExporting}
            variant="outline"
            className="h-24 flex flex-col items-center justify-center gap-2"
          >
            <FileText className="h-8 w-8" />
            <span className="font-semibold">PDF Report</span>
            <span className="text-xs text-muted-foreground">
              Professional document
            </span>
          </Button>
          <Button
            onClick={() => handleExport('pptx')}
            disabled={isExporting}
            variant="outline"
            className="h-24 flex flex-col items-center justify-center gap-2"
          >
            <Presentation className="h-8 w-8" />
            <span className="font-semibold">PowerPoint</span>
            <span className="text-xs text-muted-foreground">
              Presentation slides
            </span>
          </Button>
        </div>
        {isExporting && (
          <p className="text-sm text-center text-muted-foreground">
            Generating report, please wait...
          </p>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isExporting}>Cancel</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
