'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { Building2, Globe, Palette, Sparkles } from 'lucide-react'

const businessContextSchema = z.object({
  name: z.string().min(1, 'Company name is required'),
  industry: z.string().min(1, 'Industry is required'),
  website: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  description: z.string().min(20, 'Description must be at least 20 characters').max(500),
  logo: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid hex color'),
})

type BusinessContextFormData = z.infer<typeof businessContextSchema>

interface BusinessContextFormProps {
  tenantId: string
  initialData: BusinessContextFormData
}

const INDUSTRIES = [
  'Healthcare',
  'Education',
  'Retail',
  'Technology',
  'Finance',
  'Hospitality',
  'Real Estate',
  'Manufacturing',
  'Consulting',
  'Non-Profit',
  'Government',
  'Other',
]

export function BusinessContextForm({ tenantId, initialData }: BusinessContextFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isScraping, setIsScraping] = useState(false)

  const form = useForm<BusinessContextFormData>({
    resolver: zodResolver(businessContextSchema),
    defaultValues: initialData,
  })

  const onSubmit = async (data: BusinessContextFormData) => {
    setIsLoading(true)

    try {
      const response = await fetch('/api/settings/business', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to update business context')
      }

      toast({
        title: 'Success!',
        description: 'Business context updated successfully',
      })

      router.refresh()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update business context',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleScrapeWebsite = async () => {
    const website = form.getValues('website')

    if (!website) {
      toast({
        title: 'Error',
        description: 'Please enter a website URL first',
        variant: 'destructive',
      })
      return
    }

    setIsScraping(true)

    try {
      const response = await fetch('/api/settings/scrape-website', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: website }),
      })

      if (!response.ok) {
        throw new Error('Failed to scrape website')
      }

      const data = await response.json()

      // Auto-fill fields with scraped data
      if (data.description && !form.getValues('description')) {
        form.setValue('description', data.description)
      }

      if (data.industry && !form.getValues('industry')) {
        form.setValue('industry', data.industry)
      }

      toast({
        title: 'Success!',
        description: 'Website information extracted. Review and save.',
      })
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to scrape website',
        variant: 'destructive',
      })
    } finally {
      setIsScraping(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Company Information
            </CardTitle>
            <CardDescription>
              Basic information about your organization
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Acme Corp" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="industry"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Industry</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your industry" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {INDUSTRIES.map((industry) => (
                        <SelectItem key={industry} value={industry}>
                          {industry}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Used to provide industry-specific benchmarks and trends
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your company, products, and services..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Help AI understand your business context for better recommendations
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Web Presence
            </CardTitle>
            <CardDescription>
              Your website and online presence
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website URL</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input placeholder="https://example.com" {...field} />
                    </FormControl>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleScrapeWebsite}
                      disabled={isScraping || !field.value}
                    >
                      <Sparkles className="mr-2 h-4 w-4" />
                      {isScraping ? 'Scraping...' : 'Auto-Fill'}
                    </Button>
                  </div>
                  <FormDescription>
                    Click Auto-Fill to extract business information from your website
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="logo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Logo URL (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/logo.png" {...field} />
                  </FormControl>
                  <FormDescription>
                    Used in exported reports and presentations
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Branding
            </CardTitle>
            <CardDescription>
              Customize how your reports look
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="primaryColor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Primary Color</FormLabel>
                  <div className="flex gap-3 items-center">
                    <FormControl>
                      <Input
                        type="color"
                        className="w-20 h-10 cursor-pointer"
                        {...field}
                      />
                    </FormControl>
                    <FormControl>
                      <Input
                        placeholder="#667eea"
                        className="flex-1"
                        {...field}
                      />
                    </FormControl>
                  </div>
                  <FormDescription>
                    Used for charts, headers, and accents in reports
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Button type="submit" disabled={isLoading} size="lg">
          {isLoading ? 'Saving...' : 'Save Business Context'}
        </Button>
      </form>
    </Form>
  )
}
