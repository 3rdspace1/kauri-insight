'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MoreHorizontal, Trash2, Mail, CheckCircle2, Clock } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useToast } from '@/components/ui/use-toast'

interface Member {
    id: string
    role: string
    user: {
        id: string
        name: string | null
        email: string
        image: string | null
    }
}

interface Invitation {
    id: string
    email: string
    role: string
    status: string
    createdAt: string
}

export function TeamMemberList({ tenantId, currentUserRole }: { tenantId: string, currentUserRole?: string }) {
    const [members, setMembers] = useState<Member[]>([])
    const [invitations, setInvitations] = useState<Invitation[]>([])
    const [loading, setLoading] = useState(true)
    const { toast } = useToast()

    const fetchData = async () => {
        try {
            // In a real app, these would be separate API routes
            const res = await fetch(`/api/teams/members`)
            if (res.ok) {
                const data = await res.json()
                setMembers(data.members || [])
                setInvitations(data.invitations || [])
            }
        } catch (err) {
            console.error('Error fetching team:', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    if (loading) {
        return <div className="text-center py-4 text-muted-foreground text-sm">Loading team...</div>
    }

    return (
        <div className="space-y-6">
            <div className="space-y-3">
                {members.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/5">
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary">
                                {member.user.email[0].toUpperCase()}
                            </div>
                            <div>
                                <p className="text-sm font-medium">{member.user.name || member.user.email}</p>
                                <p className="text-xs text-muted-foreground">{member.user.email}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-xs font-medium uppercase text-muted-foreground bg-muted px-2 py-0.5 rounded">
                                {member.role}
                            </span>
                            {(currentUserRole === 'admin' || currentUserRole === 'owner') && (
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {invitations.length > 0 && (
                <div className="space-y-3 pt-4 border-t">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase flex items-center">
                        <Clock className="h-3 w-3 mr-2" /> Pending Invitations
                    </h3>
                    {invitations.map((invite) => (
                        <div key={invite.id} className="flex items-center justify-between p-3 rounded-lg border border-dashed bg-amber-500/5">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600">
                                    <Mail className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium">{invite.email}</p>
                                    <p className="text-[10px] text-muted-foreground">Invited on {new Date(invite.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-xs font-medium uppercase text-amber-600">
                                    {invite.role}
                                </span>
                                <span className="text-[10px] bg-amber-500/20 text-amber-700 px-2 py-0.5 rounded-full font-bold">
                                    PENDING
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
