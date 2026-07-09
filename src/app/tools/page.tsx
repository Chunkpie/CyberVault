'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, Plus, Copy, Check, Terminal } from 'lucide-react'
import Sidebar from '@/components/layout/sidebar'
import CommandPalette from '@/components/layout/command-palette'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'

interface Tool {
  id: string
  name: string
  command: string
  description: string
  category: string
  createdAt: string
  updatedAt: string
}

const toolCategories = [
  'recon', 'scanning', 'exploitation', 'post-exploitation',
  'web', 'network', 'wireless', 'forensics', 'utilities',
]

export default function ToolsPage() {
  const [tools, setTools] = useState<Tool[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [newName, setNewName] = useState('')
  const [newCommand, setNewCommand] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [newCategory, setNewCategory] = useState('recon')

  const fetchTools = useCallback(async () => {
    try {
      const res = await fetch('/api/tools')
      if (res.ok) {
        const data = await res.json()
        setTools(data)
      }
    } catch (error) {
      console.error('Failed to fetch tools:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTools()
  }, [fetchTools])

  const addTool = async () => {
    if (!newName.trim() || !newCommand.trim()) return
    try {
      const res = await fetch('/api/tools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName,
          command: newCommand,
          description: newDescription,
          category: newCategory,
        }),
      })
      if (res.ok) {
        const tool = await res.json()
        setTools([tool, ...tools])
        setNewName('')
        setNewCommand('')
        setNewDescription('')
        setShowAddForm(false)
      }
    } catch (error) {
      console.error('Failed to add tool:', error)
    }
  }

  const copyCommand = async (command: string, id: string) => {
    await navigator.clipboard.writeText(command)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const filteredTools = tools.filter(
    (t) =>
      t.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.command?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const groupedTools = toolCategories.reduce((acc, cat) => {
    const catTools = filteredTools.filter((t) => t.category === cat)
    if (catTools.length > 0) acc[cat] = catTools
    return acc
  }, {} as Record<string, Tool[]>)

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar />
      <main className="flex-1 overflow-auto p-6">
        <CommandPalette />
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Tool Reference</h1>
              <p className="text-sm text-muted-foreground mt-1">{tools.length} tools</p>
            </div>
            <Button onClick={() => setShowAddForm(!showAddForm)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Tool
            </Button>
          </div>

          {showAddForm && (
            <Card className="p-5 mb-6">
              <div className="grid grid-cols-3 gap-4 mb-4">
                <Input
                  placeholder="Tool name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
                <Input
                  placeholder="Command"
                  value={newCommand}
                  onChange={(e) => setNewCommand(e.target.value)}
                  className="font-mono"
                />
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="px-3 py-2 rounded-md border border-border bg-input text-sm text-foreground"
                >
                  {toolCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-4">
                <Textarea
                  placeholder="Description"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="min-h-[60px]"
                />
                <Button onClick={addTool} className="shrink-0">
                  Add
                </Button>
              </div>
            </Card>
          )}

          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search tools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {loading ? (
            <div className="space-y-6">
              {[1, 2].map((i) => (
                <div key={i}>
                  <div className="h-5 w-24 animate-pulse rounded bg-muted mb-3" />
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map((j) => (
                      <div key={j} className="h-32 animate-pulse rounded-lg bg-muted" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : filteredTools.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                <Terminal className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                {searchQuery ? 'No tools match your search' : 'No tools yet'}
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(groupedTools).map(([category, catTools]) => (
                <div key={category}>
                  <h2 className="text-sm font-semibold mb-3 capitalize text-muted-foreground">{category}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {catTools.map((tool) => (
                      <Card key={tool.id} className="p-4 hover:shadow-card-hover hover:border-border/80 transition-all duration-200">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Terminal className="w-4 h-4 text-muted-foreground" />
                            <h3 className="font-semibold text-sm">{tool.name}</h3>
                          </div>
                        </div>

                        <div className="bg-muted/30 rounded-md p-2 mb-3 flex items-center justify-between border border-border/50">
                          <code className="text-xs font-mono truncate flex-1 text-foreground">
                            {tool.command}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => copyCommand(tool.command, tool.id)}
                          >
                            {copiedId === tool.id ? (
                              <Check className="w-3.5 h-3.5 text-green-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </Button>
                        </div>

                        {tool.description && (
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {tool.description}
                          </p>
                        )}
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
