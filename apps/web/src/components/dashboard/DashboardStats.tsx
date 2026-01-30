'use client'

import { useRealtimeData } from '@/hooks/useRealtimeData'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Users, TrendingUp } from 'lucide-react'

interface Stats {
    surveyCount: number
    totalResponses: number
    insightsCount: number
}

export function DashboardStats({ initialData }: { initialData: Stats }) {
    const { data } = useRealtimeData<Stats>(
        async () => {
            const res = await fetch('/api/dashboard/stats')
            return res.json()
        },
        10000, // Poll every 10 seconds
        'stats'
    )

    const stats = data || initialData

    return (
        <div className="grid gap-4 md:grid-cols-3">
            <Card className="glass border-white/10 shadow-lg transition-all hover:shadow-xl hover:-translate-y-1">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Total Surveys</CardTitle>
                    <div className="p-2 rounded-full bg-blue-500/10 text-blue-500 shadow-inner">
                        <FileText className="h-4 w-4" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.surveyCount}</div>
                    <p className="text-xs text-muted-foreground">Active and draft surveys</p>
                </CardContent>
            </Card>

            <Card className="glass border-white/10 shadow-lg transition-all hover:shadow-xl hover:-translate-y-1">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Total Responses</CardTitle>
                    <div className="p-2 rounded-full bg-purple-500/10 text-purple-500 shadow-inner">
                        <Users className="h-4 w-4" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.totalResponses}</div>
                    <p className="text-xs text-muted-foreground">Across all surveys</p>
                </CardContent>
            </Card>

            <Card className="glass border-white/10 shadow-lg transition-all hover:shadow-xl hover:-translate-y-1">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Insights</CardTitle>
                    <div className="p-2 rounded-full bg-amber-500/10 text-amber-500 shadow-inner">
                        <TrendingUp className="h-4 w-4" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.insightsCount}</div>
                    <p className="text-xs text-muted-foreground">AI-generated insights</p>
                </CardContent>
            </Card>
        </div>
    )
}
