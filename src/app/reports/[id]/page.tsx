'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Save, Download, Trash2 } from 'lucide-react'
import Sidebar from '@/components/layout/sidebar'
import CommandPalette from '@/components/layout/command-palette'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Editor from '@/components/editor/editor'

interface Report {
  id: string
  title: string
  type: string
  engagementId: string
  status: string
  content: string
  createdAt: string
  updatedAt: string
}

export default function ReportEditorPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const [report, setReport] = useState<Report | null>(null)
  const [title, setTitle] = useState('')
  const [type, setType] = useState('')
  const [status, setStatus] = useState('draft')
  const [content, setContent] = useState('')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  const fetchReport = useCallback(async () => {
    try {
      const res = await fetch(`/api/reports/${id}`)
      if (res.ok) {
        const data = await res.json()
        setReport(data)
        setTitle(data.title)
        setType(data.type || '')
        setStatus(data.status)
        setContent(data.content || '')
      }
    } catch (error) {
      console.error('Failed to fetch report:', error)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchReport()
  }, [fetchReport])

  const saveReport = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/reports/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, type, status, content }),
      })
      if (res.ok) {
        const updated = await res.json()
        setReport(updated)
      }
    } catch (error) {
      console.error('Failed to save report:', error)
    } finally {
      setSaving(false)
    }
  }

  const deleteReport = async () => {
    try {
      const res = await fetch(`/api/reports/${id}`, { method: 'DELETE' })
      if (res.ok) {
        router.push('/reports')
      }
    } catch (error) {
      console.error('Failed to delete report:', error)
    }
  }

  const exportMarkdown = () => {
    const blob = new Blob([content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-background text-foreground">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
          Loading...
        </main>
      </div>
    )
  }

  if (!report) {
    return (
      <div className="flex h-screen bg-background text-foreground">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
          Report not found
        </main>
      </div>
    )
  }

  const updatedAt = new Date(report.updatedAt).toLocaleString()
  const createdAt = new Date(report.createdAt).toLocaleString()
  const wordCount = content
    .replace(/<[^>]+>/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length

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
                  <span className="rounded-full border border-border px-2 py-1 text-xs uppercase tracking-[0.22em]">Report</span>
                  <span>Last updated {updatedAt}</span>
                </div>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="text-3xl font-semibold bg-transparent border-none p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                  placeholder="New pentest report"
                />
                <p className="max-w-2xl text-sm text-muted-foreground">
                  Organize your findings with a modern report editor. Export to PDF, keep type/status in sync, and publish polished evidence summaries.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="outline" size="sm" onClick={exportMarkdown}>
                  <Download className="w-3.5 h-3.5 mr-1.5" />
                  Export MD
                </Button>
                <Button variant="outline" size="sm" onClick={() => window.open(`/api/reports/pdf/${id}`, '_blank')}>
                  <Download className="w-3.5 h-3.5 mr-1.5" />
                  Download PDF
                </Button>
                <Button onClick={saveReport} disabled={saving} size="sm">
                  <Save className="w-3.5 h-3.5 mr-1.5" />
                  {saving ? 'Saving...' : 'Save'}
                </Button>
                <Button variant="destructive" size="sm" onClick={deleteReport}>
                  <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                  Delete
                </Button>
              </div>
            </div>
          </section>

          <div className="grid gap-6 lg:grid-cols-[2fr_0.95fr]">
            <section className="space-y-6">
              <div className="rounded-3xl border border-border/70 bg-panel p-6 shadow-sm">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-muted-foreground">Report type</label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground"
                    >
                      <option value="pentest">Pentest</option>
                      <option value="bug-bounty">Bug bounty</option>
                      <option value="audit">Audit</option>
                      <option value="incident-response">Incident response</option>
                      <option value="remediation">Remediation</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-muted-foreground">Status</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground"
                    >
                      <option value="draft">Draft</option>
                      <option value="review">Review</option>
                      <option value="final">Final</option>
                      <option value="published">Published</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-border/70 bg-panel p-6 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-base font-semibold">Report editor</h2>
                    <p className="text-sm text-muted-foreground">Write the full report content here. Use headings, callouts, tables, and images to structure your findings.</p>
                  </div>
                  <span className="rounded-full bg-accent/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-accent-foreground">Modern</span>
                </div>
                <div className="mt-5 overflow-hidden rounded-3xl border border-border/50 bg-background">
                  <Editor content={content} onChange={setContent} placeholder="Start writing your report..." className="min-h-[540px]" />
                </div>
              </div>
            </section>

            <aside className="space-y-6">
              <div className="sticky top-6 space-y-4">
                <div className="rounded-3xl border border-border/70 bg-background/90 p-6 shadow-sm">
                  <h2 className="text-sm font-semibold mb-4">Report details</h2>
                  <div className="space-y-4 text-sm text-foreground">
                    <div>
                      <p className="text-muted-foreground">Type</p>
                      <p className="mt-1 font-medium">{type}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Status</p>
                      <p className="mt-1 font-medium">{status}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Word count</p>
                      <p className="mt-1 font-medium">{wordCount}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Created</p>
                      <p className="mt-1">{createdAt}</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-border/70 bg-background/90 p-6 shadow-sm">
                  <h2 className="text-sm font-semibold mb-4">PDF export</h2>
                  <p className="text-sm text-muted-foreground">Download a professional PDF with headers, footers, and embedded images.</p>
                  <div className="mt-4 flex flex-col gap-3">
                    <Button variant="outline" size="sm" onClick={() => window.open(`/api/reports/pdf/${id}`, '_blank')}>
                      Download PDF
                    </Button>
                    <Button onClick={saveReport} disabled={saving} size="sm">
                      Save changes
                    </Button>
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
