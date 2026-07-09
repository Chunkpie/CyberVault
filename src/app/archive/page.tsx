'use client'

import { useState, useEffect, useCallback } from 'react'
import { Archive, RotateCcw, Trash2, FileText } from 'lucide-react'
import Sidebar from '@/components/layout/sidebar'
import CommandPalette from '@/components/layout/command-palette'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface ArchivedItem {
  id: string
  type: string
  title: string
  data: Record<string, unknown>
  archivedAt: string
}

const typeColors: Record<string, string> = {
  note: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  payload: 'bg-green-500/10 text-green-400 border-green-500/30',
  recon: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  report: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
  cve: 'bg-red-500/10 text-red-400 border-red-500/30',
  bookmark: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
  tool: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
  checklist: 'bg-pink-500/10 text-pink-400 border-pink-500/30',
  template: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
  screenshot: 'bg-teal-500/10 text-teal-400 border-teal-500/30',
  vulnerability: 'bg-red-500/10 text-red-400 border-red-500/30',
  engagement: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
}

export default function ArchivePage() {
  const [items, setItems] = useState<ArchivedItem[]>([])
  const [loading, setLoading] = useState(true)

  const fetchArchived = useCallback(async () => {
    try {
      const res = await fetch('/api/archive')
      if (res.ok) {
        const data = await res.json()
        setItems(data)
      }
    } catch (error) {
      console.error('Failed to fetch archived items:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchArchived()
  }, [fetchArchived])

  const restoreItem = async (id: string, type: string) => {
    try {
      const res = await fetch(`/api/archive/${id}/restore`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      })
      if (res.ok) {
        setItems(items.filter((i) => i.id !== id))
      }
    } catch (error) {
      console.error('Failed to restore item:', error)
    }
  }

  const deleteItem = async (id: string) => {
    try {
      const res = await fetch(`/api/archive/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setItems(items.filter((i) => i.id !== id))
      }
    } catch (error) {
      console.error('Failed to delete archived item:', error)
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
              <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                <Archive className="w-5 h-5" />
                Archive
              </h1>
              <p className="text-sm text-muted-foreground mt-1">{items.length} archived items</p>
            </div>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                <Archive className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">No archived items</p>
            </div>
          ) : (
            <div className="space-y-2">
              {items.map((item) => (
                <Card key={item.id} className="p-4 hover:border-border/80 transition-all duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-sm">{item.title}</h3>
                          <Badge
                            variant="outline"
                            className={`text-[10px] capitalize ${typeColors[item.type] || ''}`}
                          >
                            {item.type}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                          Archived {new Date(item.archivedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => restoreItem(item.id, item.type)}
                      >
                        <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                        Restore
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => deleteItem(item.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5 text-danger" />
                      </Button>
                    </div>
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
