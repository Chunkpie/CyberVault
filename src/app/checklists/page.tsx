'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, ChevronDown, ChevronRight, Trash2 } from 'lucide-react'
import Sidebar from '@/components/layout/sidebar'
import CommandPalette from '@/components/layout/command-palette'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface ChecklistItem {
  id: string
  text: string
  checked: boolean
}

interface Checklist {
  id: string
  title: string
  items: ChecklistItem[]
  createdAt: string
  updatedAt: string
}

export default function ChecklistsPage() {
  const [checklists, setChecklists] = useState<Checklist[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [newItemText, setNewItemText] = useState('')
  const [newTitle, setNewTitle] = useState('')
  const [showNewForm, setShowNewForm] = useState(false)

  const fetchChecklists = useCallback(async () => {
    try {
      const res = await fetch('/api/checklists')
      if (res.ok) {
        const data = await res.json()
        setChecklists(data)
      }
    } catch (error) {
      console.error('Failed to fetch checklists:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchChecklists()
  }, [fetchChecklists])

  const createChecklist = async () => {
    if (!newTitle.trim()) return
    try {
      const res = await fetch('/api/checklists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle, items: [] }),
      })
      if (res.ok) {
        const checklist = await res.json()
        setChecklists([checklist, ...checklists])
        setNewTitle('')
        setShowNewForm(false)
        setExpandedId(checklist.id)
      }
    } catch (error) {
      console.error('Failed to create checklist:', error)
    }
  }

  const toggleItem = async (checklistId: string, itemId: string, checked: boolean) => {
    const checklist = checklists.find((c) => c.id === checklistId)
    if (!checklist) return
    const updatedItems = checklist.items.map((item) =>
      item.id === itemId ? { ...item, checked: !checked } : item
    )
    try {
      const res = await fetch(`/api/checklists/${checklistId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: updatedItems }),
      })
      if (res.ok) {
        setChecklists(checklists.map((c) =>
          c.id === checklistId ? { ...c, items: updatedItems } : c
        ))
      }
    } catch (error) {
      console.error('Failed to toggle item:', error)
    }
  }

  const addItem = async (checklistId: string) => {
    if (!newItemText.trim()) return
    const checklist = checklists.find((c) => c.id === checklistId)
    if (!checklist) return
    const newItem = {
      id: Date.now().toString(),
      text: newItemText,
      checked: false,
    }
    const updatedItems = [...checklist.items, newItem]
    try {
      const res = await fetch(`/api/checklists/${checklistId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: updatedItems }),
      })
      if (res.ok) {
        setChecklists(checklists.map((c) =>
          c.id === checklistId ? { ...c, items: updatedItems } : c
        ))
        setNewItemText('')
      }
    } catch (error) {
      console.error('Failed to add item:', error)
    }
  }

  const deleteChecklist = async (id: string) => {
    try {
      const res = await fetch(`/api/checklists/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setChecklists(checklists.filter((c) => c.id !== id))
      }
    } catch (error) {
      console.error('Failed to delete checklist:', error)
    }
  }

  const getProgress = (items: ChecklistItem[]) => {
    if (items.length === 0) return 0
    return Math.round((items.filter((i) => i.checked).length / items.length) * 100)
  }

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar />
      <main className="flex-1 overflow-auto p-6">
        <CommandPalette />
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Checklists</h1>
              <p className="text-sm text-muted-foreground mt-1">{checklists.length} checklists</p>
            </div>
            <Button onClick={() => setShowNewForm(!showNewForm)}>
              <Plus className="w-4 h-4 mr-2" />
              New Checklist
            </Button>
          </div>

          {showNewForm && (
            <Card className="p-5 mb-6">
              <div className="flex gap-4">
                <Input
                  placeholder="Checklist title"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && createChecklist()}
                  className="flex-1"
                />
                <Button onClick={createChecklist}>Create</Button>
              </div>
            </Card>
          )}

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 animate-pulse rounded-lg bg-muted" />
              ))}
            </div>
          ) : checklists.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                <Plus className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">No checklists yet</p>
              <Button variant="outline" size="sm" className="mt-3" onClick={() => setShowNewForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create your first checklist
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {checklists.map((checklist) => {
                const isExpanded = expandedId === checklist.id
                const progress = getProgress(checklist.items)
                const completed = checklist.items.filter((i) => i.checked).length
                return (
                  <Card key={checklist.id} className="overflow-hidden">
                    <div
                      className="p-4 flex items-center gap-3 cursor-pointer hover:bg-foreground/[0.02] transition-colors"
                      onClick={() => setExpandedId(isExpanded ? null : checklist.id)}
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 shrink-0 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="w-4 h-4 shrink-0 text-muted-foreground" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-sm">{checklist.title}</h3>
                          <Badge variant="secondary" className="text-[10px]">
                            {completed}/{checklist.items.length}
                          </Badge>
                        </div>
                        <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-foreground/30 transition-all duration-300 rounded-full"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteChecklist(checklist.id)
                        }}
                      >
                        <Trash2 className="w-3.5 h-3.5 text-danger" />
                      </Button>
                    </div>

                    {isExpanded && (
                      <div className="px-4 pb-4 border-t border-border/50 pt-4">
                        <div className="space-y-2 mb-4">
                          {checklist.items.map((item) => (
                            <label
                              key={item.id}
                              className="flex items-center gap-3 cursor-pointer group"
                            >
                              <input
                                type="checkbox"
                                checked={item.checked}
                                onChange={() => toggleItem(checklist.id, item.id, item.checked)}
                                className="w-4 h-4 rounded border-border bg-input accent-foreground"
                              />
                              <span
                                className={`text-sm flex-1 transition-colors ${
                                  item.checked
                                    ? 'line-through text-muted-foreground'
                                    : 'text-foreground'
                                }`}
                              >
                                {item.text}
                              </span>
                            </label>
                          ))}
                        </div>

                        <div className="flex gap-2">
                          <Input
                            placeholder="Add item..."
                            value={newItemText}
                            onChange={(e) => setNewItemText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') addItem(checklist.id)
                            }}
                            className="flex-1"
                          />
                          <Button
                            size="sm"
                            onClick={() => addItem(checklist.id)}
                            disabled={!newItemText.trim()}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
