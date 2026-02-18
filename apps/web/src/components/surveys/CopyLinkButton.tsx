'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Check, Copy, Share2 } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

interface CopyLinkButtonProps {
  surveyId: string
  variant?: 'copy' | 'share'
}

export function CopyLinkButton({ surveyId, variant = 'copy' }: CopyLinkButtonProps) {
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  const handleCopy = async () => {
    const url = `${window.location.origin}/runtime/${surveyId}`

    try {
      if (variant === 'share' && navigator.share) {
        await navigator.share({
          title: 'Take our survey',
          url,
        })
        return
      }

      await navigator.clipboard.writeText(url)
      setCopied(true)
      toast({ title: 'Link copied', description: 'Survey link copied to clipboard.' })
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for older browsers
      const input = document.createElement('input')
      input.value = url
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
      setCopied(true)
      toast({ title: 'Link copied', description: 'Survey link copied to clipboard.' })
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (variant === 'share') {
    return (
      <Button variant="outline" onClick={handleCopy}>
        <Share2 className="mr-2 h-4 w-4" />
        Share
      </Button>
    )
  }

  return (
    <Button variant="outline" size="sm" onClick={handleCopy}>
      {copied ? <Check className="mr-1 h-3 w-3" /> : <Copy className="mr-1 h-3 w-3" />}
      {copied ? 'Copied' : 'Copy'}
    </Button>
  )
}
