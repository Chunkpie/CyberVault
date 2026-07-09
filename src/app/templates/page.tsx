'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, FileText, ClipboardList, Plus, Trash2, X } from 'lucide-react'
import Sidebar from '@/components/layout/sidebar'
import CommandPalette from '@/components/layout/command-palette'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'

interface Template {
  id: string
  name: string
  icon: string
  content: string
  type: string
  category: string
}

const typeIcons: Record<string, typeof FileText> = {
  note: FileText,
  checklist: ClipboardList,
  report: FileText,
}

export default function TemplatesPage() {
  const router = useRouter()
  const [templates, setTemplates] = useState<Template[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')
  const [newIcon, setNewIcon] = useState('📄')
  const [newType, setNewType] = useState('note')
  const [newCategory, setNewCategory] = useState('general')
  const [newContent, setNewContent] = useState('')

  const fetchTemplates = useCallback(async () => {
    try {
      const res = await fetch('/api/templates')
      if (res.ok) {
        const data = await res.json()
        setTemplates(data)
      }
    } catch (error) {
      console.error('Failed to fetch templates:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTemplates()
  }, [fetchTemplates])

  const createTemplate = async () => {
    if (!newName.trim()) return
    try {
      const res = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: `custom-${Date.now()}`,
          name: newName,
          icon: newIcon,
          content: newContent,
          type: newType,
          category: newCategory,
        }),
      })
      if (res.ok) {
        const template = await res.json()
        setTemplates([template, ...templates])
        setNewName('')
        setNewIcon('📄')
        setNewContent('')
        setNewCategory('general')
        setShowCreate(false)
      }
    } catch (error) {
      console.error('Failed to create template:', error)
    }
  }

  const deleteTemplate = async (id: string) => {
    try {
      const res = await fetch(`/api/templates/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setTemplates(templates.filter((t) => t.id !== id))
      }
    } catch (error) {
      console.error('Failed to delete template:', error)
    }
  }

  const useTemplate = async (template: Template) => {
    try {
      if (template.type === 'note' || template.type === 'report') {
        const res = await fetch('/api/notes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: template.name,
            content: template.content,
            tags: [template.category],
          }),
        })
        if (res.ok) {
          const note = await res.json()
          router.push(`/notes/${note.id}`)
        }
      } else if (template.type === 'checklist') {
        const items = template.content
          .split('\n')
          .filter((line) => line.trim())
          .map((line, idx) => ({
            id: `item-${idx}`,
            text: line.replace(/^[-*]\s*/, '').replace(/^-\s*\[[ x]\]\s*/, '').trim(),
            checked: false,
          }))
        const res = await fetch('/api/checklists', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: template.name,
            items,
            category: template.category,
          }),
        })
        if (res.ok) {
          router.push('/checklists')
        }
      }
    } catch (error) {
      console.error('Failed to use template:', error)
    }
  }

  const filteredTemplates = templates.filter(
    (t) =>
      t.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar />
      <main className="flex-1 overflow-auto p-6">
        <CommandPalette />
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Template Gallery</h1>
              <p className="text-sm text-muted-foreground mt-1">{templates.length} templates</p>
            </div>
            <Button onClick={() => setShowCreate(!showCreate)}>
              <Plus className="w-4 h-4 mr-2" />
              New Template
            </Button>
          </div>

          {showCreate && (
            <Card className="p-5 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Create Template</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowCreate(false)} className="h-8 w-8 p-0">
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <Input
                  placeholder="Template name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
                <Input
                  placeholder="Icon (emoji)"
                  value={newIcon}
                  onChange={(e) => setNewIcon(e.target.value)}
                  maxLength={4}
                />
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  className="px-3 py-2 rounded-md border border-border bg-input text-sm text-foreground"
                >
                  <option value="note">Note</option>
                  <option value="checklist">Checklist</option>
                  <option value="report">Report</option>
                </select>
                <Input
                  placeholder="Category"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                />
              </div>
              <Textarea
                placeholder="Template content..."
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                rows={8}
                className="mb-4 font-mono text-sm"
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowCreate(false)}>
                  Cancel
                </Button>
                <Button onClick={createTemplate} disabled={!newName.trim()}>
                  Create
                </Button>
              </div>
            </Card>
          )}

          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 animate-pulse rounded-lg bg-muted" />
              ))}
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                <FileText className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                {searchQuery ? 'No templates match your search' : 'No templates yet'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTemplates.map((template) => {
                const Icon = typeIcons[template.type] || FileText
                return (
                  <Card key={template.id} className="p-5 hover:shadow-card-hover hover:border-border/80 transition-all duration-200">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{template.icon}</span>
                        <h3 className="font-semibold text-sm">{template.name}</h3>
                      </div>
                      <Badge variant="outline" className="text-[10px] capitalize">
                        {template.type}
                      </Badge>
                    </div>

                    {template.category && (
                      <p className="text-[11px] text-muted-foreground mb-2 capitalize">
                        {template.category}
                      </p>
                    )}

                    {template.content && (
                      <pre className="text-[11px] text-muted-foreground mb-4 line-clamp-4 whitespace-pre-wrap font-mono bg-muted/20 p-2 rounded border border-border/50">
                        {template.content}
                      </pre>
                    )}

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => useTemplate(template)}
                      >
                        Use
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => deleteTemplate(template.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5 text-danger" />
                      </Button>
                    </div>
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
