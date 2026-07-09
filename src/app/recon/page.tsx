'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, Plus, Filter, Globe, Trash2 } from 'lucide-react'
import Sidebar from '@/components/layout/sidebar'
import CommandPalette from '@/components/layout/command-palette'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'

interface ReconItem {
  id: string
  type: string
  value: string
  notes: string
  engagementId: string
  createdAt: string
}

const reconTypes = [
  'subdomain', 'ip', 'url', 'port', 'technology', 'header', 'endpoint', 'parameter',
]

export default function ReconPage() {
  const [items, setItems] = useState<ReconItem[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [engagementFilter, setEngagementFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newType, setNewType] = useState('subdomain')
  const [newValue, setNewValue] = useState('')
  const [newNotes, setNewNotes] = useState('')
  const [newEngagement, setNewEngagement] = useState('')

  const fetchItems = useCallback(async () => {
    try {
      const res = await fetch('/api/recon')
      if (res.ok) {
        const data = await res.json()
        setItems(data)
      }
    } catch (error) {
      console.error('Failed to fetch recon data:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  const addItem = async () => {
    if (!newValue.trim()) return
    try {
      const res = await fetch('/api/recon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: newType,
          value: newValue,
          notes: newNotes,
          engagement_id: newEngagement,
        }),
      })
      if (res.ok) {
        const item = await res.json()
        setItems([item, ...items])
        setNewValue('')
        setNewNotes('')
        setShowAddForm(false)
      }
    } catch (error) {
      console.error('Failed to add recon item:', error)
    }
  }

  const deleteItem = async (id: string) => {
    try {
      const res = await fetch(`/api/recon/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setItems(items.filter((i) => i.id !== id))
      }
    } catch (error) {
      console.error('Failed to delete recon item:', error)
    }
  }

  const engagements = [...new Set(items.map((i) => i.engagementId).filter(Boolean))]

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.value?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.notes?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = !typeFilter || item.type === typeFilter
    const matchesEngagement = !engagementFilter || item.engagementId === engagementFilter
    return matchesSearch && matchesType && matchesEngagement
  })

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar />
      <main className="flex-1 overflow-auto p-6">
        <CommandPalette />
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Recon Workspace</h1>
              <p className="text-sm text-muted-foreground mt-1">{items.length} recon items</p>
            </div>
            <Button onClick={() => setShowAddForm(!showAddForm)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </div>

          {showAddForm && (
            <Card className="p-5 mb-6">
              <div className="grid grid-cols-4 gap-4 mb-4">
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  className="px-3 py-2 rounded-md border border-border bg-input text-sm text-foreground"
                >
                  {reconTypes.map((type) => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
                <Input
                  placeholder="Value"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                />
                <Input
                  placeholder="Engagement"
                  value={newEngagement}
                  onChange={(e) => setNewEngagement(e.target.value)}
                />
                <Button onClick={addItem}>Add</Button>
              </div>
              <Textarea
                placeholder="Notes"
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                className="min-h-[60px]"
              />
            </Card>
          )}

          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search recon data..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="pl-10 pr-3 py-2 rounded-md border border-border bg-input text-sm text-foreground"
              >
                <option value="">All Types</option>
                {reconTypes.map((type) => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            {engagements.length > 0 && (
              <select
                value={engagementFilter}
                onChange={(e) => setEngagementFilter(e.target.value)}
                className="px-3 py-2 rounded-md border border-border bg-input text-sm text-foreground"
              >
                <option value="">All Engagements</option>
                {engagements.map((eng) => (
                  <option key={eng} value={eng}>
                    {eng}
                  </option>
                ))}
              </select>
            )}
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-14 animate-pulse rounded-lg bg-muted" />
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                <Globe className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                {searchQuery || typeFilter || engagementFilter
                  ? 'No items match your filters'
                  : 'No recon data yet'}
              </p>
            </div>
          ) : (
            <div className="border border-border/50 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted/20">
                  <tr>
                    <th className="px-4 py-3 text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Type</th>
                    <th className="px-4 py-3 text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Value</th>
                    <th className="px-4 py-3 text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Notes</th>
                    <th className="px-4 py-3 text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Engagement</th>
                    <th className="px-4 py-3 text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-right text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item) => (
                    <tr key={item.id} className="border-t border-border/50 hover:bg-foreground/[0.02] transition-colors">
                      <td className="px-4 py-3">
                        <Badge variant="outline" className="text-[10px]">
                          <Globe className="w-3 h-3 mr-1" />
                          {item.type}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 font-mono text-sm">{item.value}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground max-w-xs truncate">
                        {item.notes}
                      </td>
                      <td className="px-4 py-3 text-sm">{item.engagementId}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={() => deleteItem(item.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5 text-danger" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
