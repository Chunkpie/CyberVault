'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Trash2, Plus, X } from 'lucide-react'
import Sidebar from '@/components/layout/sidebar'
import CommandPalette from '@/components/layout/command-palette'
import Editor from '@/components/editor/editor'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

interface Note {
  id: string
  title: string
  content: string
  tags: string[]
  meta?: { severity?: string; cvss?: number; cve?: string; references?: string[] }
  createdAt: string
  updatedAt: string
}

export default function NoteEditorPage() {
  const router = useRouter()
  const params = useParams()
  const noteId = params.id as string

  const [note, setNote] = useState<Note | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [meta, setMeta] = useState<{ severity?: string; cvss?: number; cve?: string; references?: string[] }>({})
  const [newTag, setNewTag] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isInitialLoad = useRef(true)

  useEffect(() => {
    const fetchNote = async () => {
      try {
        const res = await fetch(`/api/notes/${noteId}`)
        if (res.ok) {
          const data = await res.json()
          setNote(data)
          setTitle(data.title)
          setContent(data.content)
            setTags(data.tags || [])
            setMeta(data.meta || {})
        }
      } catch (error) {
        console.error('Failed to fetch note:', error)
      } finally {
        setLoading(false)
        setTimeout(() => {
          isInitialLoad.current = false
        }, 100)
      }
    }
    fetchNote()
  }, [noteId])

  const saveNote = useCallback(
    async (updates: Partial<Note>) => {
      setSaving(true)
      try {
        await fetch(`/api/notes/${noteId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        })
      } catch (error) {
        console.error('Failed to save note:', error)
      } finally {
        setSaving(false)
      }
    },
    [noteId]
  )

  const debouncedSave = useCallback(
    (updates: Partial<Note>) => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
      saveTimeoutRef.current = setTimeout(() => {
        saveNote(updates)
      }, 300)
    },
    [saveNote]
  )

  useEffect(() => {
    if (isInitialLoad.current) return
    debouncedSave({ title, content, tags, meta })
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [title, content, tags, meta, debouncedSave])

  const deleteNote = async () => {
    try {
      const res = await fetch(`/api/notes/${noteId}`, { method: 'DELETE' })
      if (res.ok) {
        router.push('/notes')
      }
    } catch (error) {
      console.error('Failed to delete note:', error)
    }
  }

  const addTag = () => {
    const trimmed = newTag.trim()
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed])
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-background text-foreground">
        <Sidebar />
        <main className="flex-1 overflow-auto p-6">
          <CommandPalette />
          <div className="max-w-4xl mx-auto text-center py-8 text-muted-foreground text-sm">
            Loading...
          </div>
        </main>
      </div>
    )
  }

  if (!note) {
    return (
      <div className="flex h-screen bg-background text-foreground">
        <Sidebar />
        <main className="flex-1 overflow-auto p-6">
          <CommandPalette />
          <div className="max-w-4xl mx-auto text-center py-8 text-muted-foreground text-sm">
            Note not found
          </div>
        </main>
      </div>
    )
  }

  const lastSaved = new Date(note.updatedAt).toLocaleString()
  const createdAt = new Date(note.createdAt).toLocaleString()

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar />
      <main className="flex-1 overflow-auto p-6">
        <CommandPalette />
        <div className="max-w-7xl mx-auto space-y-6">
          <section className="rounded-3xl border border-border/70 bg-background/80 p-6 shadow-sm">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="min-w-0 space-y-3">
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <span className="rounded-full border border-border px-2 py-1 text-xs uppercase tracking-[0.22em]">Note</span>
                  <span>Last edited {lastSaved}</span>
                </div>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Capture a secure finding title"
                  className="text-3xl font-semibold bg-transparent border-none p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
                <p className="max-w-2xl text-sm text-muted-foreground">
                  Build rich technical notes with heading structure, tables, attachments, and security metadata.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs uppercase tracking-[0.22em]">
                  {saving ? 'Saving...' : 'Auto-saved'}
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(`/api/notes/pdf/${noteId}`, '_blank')}
                >
                  Download PDF
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    try {
                      const reportContent = `# ${title}\n\n` +
                        `**Severity:** ${meta.severity || 'N/A'}\n\n` +
                        `**CVSS:** ${meta.cvss ?? 'N/A'}\n\n` +
                        `**CVE:** ${meta.cve || 'N/A'}\n\n` +
                        `**References:** ${(meta.references || []).join(', ')}\n\n` +
                        `---\n\n` +
                        `${content}`;
                      const res = await fetch('/api/reports', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ title: `${title} - Finding`, content: reportContent, type: 'bug-bounty' }),
                      });
                      if (res.ok) {
                        const report = await res.json();
                        router.push(`/reports/${report.id}`);
                      }
                    } catch (error) {
                      console.error('Failed to export report:', error);
                    }
                  }}
                >
                  Export as Report
                </Button>
                <Button variant="destructive" size="sm" onClick={deleteNote}>
                  <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                  Delete
                </Button>
              </div>
            </div>
          </section>

          <div className="grid gap-6 lg:grid-cols-[2fr_0.95fr]">
            <section className="space-y-6">
              <div className="rounded-3xl border border-border/70 bg-panel p-6 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-base font-semibold">Editor</h2>
                    <p className="text-sm text-muted-foreground">Use the toolbar inside the editor to format headings, lists, callouts, tables, and code blocks.</p>
                  </div>
                  <span className="rounded-full bg-accent/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-accent-foreground">Rich text</span>
                </div>
                <div className="mt-5 overflow-hidden rounded-3xl border border-border/50 bg-background">
                  <Editor content={content} onChange={setContent} className="min-h-[540px]" />
                </div>
              </div>

              <div className="rounded-3xl border border-border/70 bg-background/90 p-6 shadow-sm">
                <h2 className="text-base font-semibold mb-4">Metadata & details</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-border/60 bg-background p-4">
                    <p className="text-sm font-medium text-muted-foreground">Severity</p>
                    <p className="mt-2 text-sm text-foreground">{meta.severity || 'None'}</p>
                  </div>
                  <div className="rounded-2xl border border-border/60 bg-background p-4">
                    <p className="text-sm font-medium text-muted-foreground">CVSS</p>
                    <p className="mt-2 text-sm text-foreground">{meta.cvss ?? 'N/A'}</p>
                  </div>
                  <div className="rounded-2xl border border-border/60 bg-background p-4">
                    <p className="text-sm font-medium text-muted-foreground">CVE</p>
                    <p className="mt-2 text-sm text-foreground">{meta.cve || 'None'}</p>
                  </div>
                  <div className="rounded-2xl border border-border/60 bg-background p-4">
                    <p className="text-sm font-medium text-muted-foreground">References</p>
                    <p className="mt-2 text-sm text-foreground">
                      {(meta.references || []).length > 0 ? (meta.references || []).join(', ') : 'None'}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <aside className="space-y-6">
              <div className="sticky top-6 space-y-4">
                <div className="rounded-3xl border border-border/70 bg-background/90 p-6 shadow-sm">
                  <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Quick summary</p>
                  <div className="mt-4 space-y-4 text-sm text-foreground">
                    <div>
                      <p className="text-muted-foreground">Created</p>
                      <p>{createdAt}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Updated</p>
                      <p>{lastSaved}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Tags</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {tags.length > 0 ? tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="rounded-full px-3 py-1 text-xs">
                            {tag}
                          </Badge>
                        )) : <span className="text-muted-foreground">No tags</span>}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-border/70 bg-background/90 p-6 shadow-sm">
                  <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Edit note metadata</p>
                  <div className="mt-4 grid gap-3">
                    <select
                      value={meta.severity || ''}
                      onChange={(e) => setMeta({ ...meta, severity: e.target.value })}
                      className="w-full rounded-md border border-border px-3 py-2 bg-input text-sm text-foreground"
                    >
                      <option value="">Severity</option>
                      <option value="critical">Critical</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                    <Input
                      value={meta.cve || ''}
                      onChange={(e) => setMeta({ ...meta, cve: e.target.value })}
                      placeholder="CVE reference"
                    />
                    <Input
                      value={(meta.references || []).join(', ')}
                      onChange={(e) => setMeta({ ...meta, references: e.target.value.split(',').map((tag) => tag.trim()).filter(Boolean) })}
                      placeholder="References"
                    />
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  )
}
