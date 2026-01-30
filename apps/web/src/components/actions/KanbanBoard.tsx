'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Loader2, CheckCircle2, Circle, Clock, ArrowRight } from 'lucide-react'
import { toast } from '@/components/ui/use-toast'

interface Action {
    id: string
    title: string
    kind: string
    status: 'open' | 'doing' | 'done'
    createdAt: string
}

export function KanbanBoard({ surveyId }: { surveyId: string }) {
    const [actions, setActions] = useState<Action[]>([])
    const [loading, setLoading] = useState(true)

    const fetchActions = async () => {
        try {
            const res = await fetch(`/api/surveys/${surveyId}/actions`)
            const data = await res.json()
            if (data.success) {
                setActions(data.data)
            }
        } catch (error) {
            console.error('Failed to fetch actions:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchActions()
    }, [surveyId])

    const updateStatus = async (actionId: string, newStatus: Action['status']) => {
        try {
            const res = await fetch(`/api/actions/${actionId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            })

            if (res.ok) {
                setActions(actions.map(a => a.id === actionId ? { ...a, status: newStatus } : a))
                toast({
                    title: 'Status updated',
                    description: `Action moved to ${newStatus}`,
                })
            } else {
                throw new Error('Failed to update status')
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to update action status',
                variant: 'destructive',
            })
        }
    }

    if (loading) {
        return (
            <div className="flex h-48 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    const columns: { title: string, status: Action['status'], icon: any, color: string }[] = [
        { title: 'To Do', status: 'open', icon: Circle, color: 'text-gray-500' },
        { title: 'In Progress', status: 'doing', icon: Clock, color: 'text-blue-500' },
        { title: 'Done', status: 'done', icon: CheckCircle2, color: 'text-green-500' },
    ]

    return (
        <div className="grid gap-4 md:grid-cols-3">
            {columns.map((column) => (
                <div key={column.status} className="flex flex-col gap-4">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="flex items-center gap-2 font-semibold">
                            <column.icon className={`h-4 w-4 ${column.color}`} />
                            {column.title}
                            <Badge variant="secondary" className="ml-2 font-normal">
                                {actions.filter(a => a.status === column.status).length}
                            </Badge>
                        </h3>
                    </div>

                    <div className="flex flex-1 flex-col gap-3 rounded-lg bg-muted/30 p-2 min-h-[300px]">
                        {actions
                            .filter((action) => action.status === column.status)
                            .map((action) => (
                                <Card key={action.id} className="shadow-sm">
                                    <CardHeader className="p-4">
                                        <div className="flex items-start justify-between gap-2">
                                            <CardTitle className="text-sm font-bold line-clamp-2">
                                                {action.title}
                                            </CardTitle>
                                        </div>
                                        <CardDescription className="text-xs">
                                            {action.kind.charAt(0).toUpperCase() + action.kind.slice(1)} • {new Date(action.createdAt).toLocaleDateString()}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-4 pt-0">
                                        <div className="flex justify-end gap-1">
                                            {action.status === 'open' && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-7 text-xs"
                                                    onClick={() => updateStatus(action.id, 'doing')}
                                                >
                                                    Start <ArrowRight className="ml-1 h-3 w-3" />
                                                </Button>
                                            )}
                                            {action.status === 'doing' && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-7 text-xs text-green-600"
                                                    onClick={() => updateStatus(action.id, 'done')}
                                                >
                                                    Complete <CheckCircle2 className="ml-1 h-3 w-3" />
                                                </Button>
                                            )}
                                            {action.status === 'done' && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-7 text-xs"
                                                    onClick={() => updateStatus(action.id, 'doing')}
                                                >
                                                    Reopen
                                                </Button>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}

                        {actions.filter(a => a.status === column.status).length === 0 && (
                            <div className="flex h-24 items-center justify-center rounded-md border border-dashed text-xs text-muted-foreground">
                                No items
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    )
}
