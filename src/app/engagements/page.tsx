'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Target, Users } from 'lucide-react'
import Sidebar from '@/components/layout/sidebar'
import CommandPalette from '@/components/layout/command-palette'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Engagement {
  id: string
  name: string
  client: string
  status: string
  targets: string[]
  createdAt: string
  updatedAt: string
}

const statusColors: Record<string, string> = {
  active: 'bg-green-500/10 text-green-400 border-green-500/30',
  completed: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  on_hold: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
  cancelled: 'bg-red-500/10 text-red-400 border-red-500/30',
}

export default function EngagementsPage() {
  const router = useRouter()
  const [engagements, setEngagements] = useState<Engagement[]>([])
  const [loading, setLoading] = useState(true)

  const fetchEngagements = useCallback(async () => {
    try {
      const res = await fetch('/api/engagements')
      if (res.ok) {
        const data = await res.json()
        setEngagements(data)
      }
    } catch (error) {
      console.error('Failed to fetch engagements:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchEngagements()
  }, [fetchEngagements])

  const createEngagement = async () => {
    try {
      const res = await fetch('/api/engagements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'New Engagement',
          client: 'Client Name',
          status: 'active',
          targets: [],
        }),
      })
      if (res.ok) {
        const engagement = await res.json()
        router.push(`/engagements/${engagement.id}`)
      }
    } catch (error) {
      console.error('Failed to create engagement:', error)
    }
  }

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar />
      <main className="flex-1 overflow-auto p-6">
        <CommandPalette />
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Engagements</h1>
              <p className="text-sm text-muted-foreground mt-1">{engagements.length} engagements</p>
            </div>
            <Button onClick={createEngagement}>
              <Plus className="w-4 h-4 mr-2" />
              New Engagement
            </Button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-40 animate-pulse rounded-lg bg-muted" />
              ))}
            </div>
          ) : engagements.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                <Target className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">No engagements yet</p>
              <Button variant="outline" size="sm" className="mt-3" onClick={createEngagement}>
                <Plus className="w-4 h-4 mr-2" />
                Create your first engagement
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {engagements.map((engagement) => (
                <Card
                  key={engagement.id}
                  className="p-5 hover:shadow-card-hover hover:border-border/80 transition-all duration-200 cursor-pointer group"
                  onClick={() => router.push(`/engagements/${engagement.id}`)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold truncate flex-1 text-foreground">{engagement.name}</h3>
                    <Badge
                      variant="outline"
                      className={`ml-2 text-[11px] ${statusColors[engagement.status] || ''}`}
                    >
                      {engagement.status}
                    </Badge>
                  </div>

                  <div className="space-y-2 mb-3">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Users className="w-4 h-4 mr-2 text-muted-foreground/60" />
                      {engagement.client}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Target className="w-4 h-4 mr-2 text-muted-foreground/60" />
                      {engagement.targets?.length || 0} targets
                    </div>
                  </div>

                  <div className="text-[11px] text-muted-foreground pt-2 border-t border-border/50">
                    Updated {new Date(engagement.updatedAt).toLocaleDateString()}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
