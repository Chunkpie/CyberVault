'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, Copy, Check, Code, Filter, Plus, Trash2, X } from 'lucide-react'
import Sidebar from '@/components/layout/sidebar'
import CommandPalette from '@/components/layout/command-palette'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'

interface Payload {
  id: string
  title: string
  content: string
  category: string
  description: string
  createdAt: string
  updatedAt: string
}

const categories = [
  'xss', 'sqli', 'ssti', 'xxe', 'lfi', 'rfi', 'ssrf', 'csrf',
  'deserialization', 'rce', 'jwt', 'oauth', 'graphql', 'cloud',
  'windows', 'linux', 'ad', 'reverse-shells', 'custom',
]

export default function PayloadsPage() {
  const [payloads, setPayloads] = useState<Payload[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [selectedPayload, setSelectedPayload] = useState<Payload | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newCategory, setNewCategory] = useState('xss')
  const [newDescription, setNewDescription] = useState('')
  const [newContent, setNewContent] = useState('')

  const fetchPayloads = useCallback(async () => {
    try {
      const res = await fetch('/api/payloads')
      if (res.ok) {
        const data = await res.json()
        setPayloads(data)
      }
    } catch (error) {
      console.error('Failed to fetch payloads:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPayloads()
  }, [fetchPayloads])

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const addPayload = async () => {
    if (!newTitle.trim() || !newContent.trim()) return
    try {
      const res = await fetch('/api/payloads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          category: newCategory,
          content: newContent,
          description: newDescription,
        }),
      })
      if (res.ok) {
        const payload = await res.json()
        setPayloads([payload, ...payloads])
        setSelectedPayload(payload)
        setNewTitle('')
        setNewCategory('xss')
        setNewDescription('')
        setNewContent('')
        setShowAddForm(false)
      }
    } catch (error) {
      console.error('Failed to add payload:', error)
    }
  }

  const deletePayload = async (id: string) => {
    try {
      const res = await fetch(`/api/payloads/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setPayloads(payloads.filter((p) => p.id !== id))
        if (selectedPayload?.id === id) setSelectedPayload(null)
      }
    } catch (error) {
      console.error('Failed to delete payload:', error)
    }
  }

  const filteredPayloads = payloads.filter((p) => {
    const matchesSearch =
      p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = !categoryFilter || p.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar />
      <main className="flex-1 overflow-auto p-6">
        <CommandPalette />
        <div className="max-w-full mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Payloads</h1>
              <p className="text-sm text-muted-foreground mt-1">{payloads.length} total payloads</p>
            </div>
            <Button onClick={() => setShowAddForm(!showAddForm)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Payload
            </Button>
          </div>

          {showAddForm && (
            <Card className="p-5 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">New Payload</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowAddForm(false)} className="h-8 w-8 p-0">
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-muted-foreground">Title</label>
                  <Input
                    placeholder="e.g., Basic XSS Test"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-muted-foreground">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1.5 text-muted-foreground">Description</label>
                <Input
                  placeholder="Brief description of the payload"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1.5 text-muted-foreground">Payload Content</label>
                <Textarea
                  placeholder="Paste your payload here..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  rows={8}
                  className="font-mono text-sm"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
                <Button onClick={addPayload} disabled={!newTitle.trim() || !newContent.trim()}>
                  Add Payload
                </Button>
              </div>
            </Card>
          )}

          <div className="flex gap-4 h-[calc(100vh-12rem)]">
            <div className="w-1/3 flex flex-col border border-border/50 rounded-lg overflow-hidden">
              <div className="p-3 border-b border-border/50 space-y-3 bg-muted/10">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search payloads..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 rounded-md border border-border bg-input text-sm text-foreground"
                  >
                    <option value="">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex-1 overflow-auto">
                {loading ? (
                  <div className="space-y-2 p-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-14 animate-pulse rounded bg-muted" />
                    ))}
                  </div>
                ) : filteredPayloads.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-32 text-sm text-muted-foreground">
                    <p>No payloads found</p>
                    {!showAddForm && (
                      <Button variant="ghost" size="sm" className="mt-2" onClick={() => setShowAddForm(true)}>
                        <Plus className="w-3.5 h-3.5 mr-1" />
                        Add one
                      </Button>
                    )}
                  </div>
                ) : (
                  filteredPayloads.map((payload) => (
                    <div
                      key={payload.id}
                      className={`p-3 border-b border-border/50 cursor-pointer hover:bg-foreground/[0.03] transition-colors group ${
                        selectedPayload?.id === payload.id ? 'bg-foreground/[0.05]' : ''
                      }`}
                      onClick={() => setSelectedPayload(payload)}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm truncate">{payload.title}</span>
                        <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Badge variant="secondary" className="text-[10px]">
                            {payload.category}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={(e) => {
                              e.stopPropagation()
                              deletePayload(payload.id)
                            }}
                          >
                            <Trash2 className="w-3 h-3 text-danger" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{payload.description}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="w-2/3 flex flex-col border border-border/50 rounded-lg overflow-hidden">
              {selectedPayload ? (
                <>
                  <div className="p-4 border-b border-border/50 flex items-center justify-between bg-muted/10">
                    <div>
                      <h2 className="font-semibold text-lg">{selectedPayload.title}</h2>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-[10px]">
                          <Code className="w-3 h-3 mr-1" />
                          {selectedPayload.category}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {selectedPayload.description}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(selectedPayload.content, selectedPayload.id)}
                      >
                        {copiedId === selectedPayload.id ? (
                          <Check className="w-3.5 h-3.5 mr-1.5 text-green-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 mr-1.5" />
                        )}
                        Copy
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => deletePayload(selectedPayload.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5 text-danger" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex-1 overflow-auto p-4">
                    <pre className="font-mono text-sm bg-muted/20 rounded-lg p-4 overflow-x-auto whitespace-pre-wrap border border-border/50">
                      {selectedPayload.content}
                    </pre>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
                  Select a payload to view
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
