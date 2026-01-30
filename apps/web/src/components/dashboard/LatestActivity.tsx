'use client'

import { useRealtimeData } from '@/hooks/useRealtimeData'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Activity, MessageSquare, CheckCircle, AlertCircle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface ActivityItem {
    id: string
    type: 'response' | 'insight' | 'action'
    text: string
    timestamp: string
    surveyName: string
}

export function LatestActivity() {
    const { data: activity } = useRealtimeData<ActivityItem[]>(
        async () => {
            const res = await fetch('/api/dashboard/activity')
            return res.json()
        },
        15000,
        'activity'
    )

    return (
        <Card className="glass border-white/10 shadow-lg">
            <CardHeader>
                <div className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" />
                    <div>
                        <CardTitle>Pulse Feed</CardTitle>
                        <CardDescription>Live activity from your surveys</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {!activity || activity.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No recent activity</p>
                ) : (
                    <div className="space-y-4">
                        {activity.map((item) => (
                            <div key={item.id} className="flex gap-3 items-start p-2 rounded-lg hover:bg-muted/30 transition-colors">
                                <div className={`mt-1 p-1.5 rounded-full ${item.type === 'response' ? 'bg-blue-500/10 text-blue-500' :
                                        item.type === 'insight' ? 'bg-amber-500/10 text-amber-500' :
                                            'bg-purple-500/10 text-purple-500'
                                    }`}>
                                    {item.type === 'response' && <MessageSquare className="h-3 w-3" />}
                                    {item.type === 'insight' && <CheckCircle className="h-3 w-3" />}
                                    {item.type === 'action' && <AlertCircle className="h-3 w-3" />}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm">
                                        <span className="font-semibold">{item.surveyName}</span>: {item.text}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground">
                                        {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
