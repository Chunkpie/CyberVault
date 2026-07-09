'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Trash2, Save } from 'lucide-react'
import Sidebar from '@/components/layout/sidebar'
import CommandPalette from '@/components/layout/command-palette'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface Vulnerability {
  id: string
  title: string
  severity: string
  cvss: number
  cwe: string
  owasp: string
  description: string
  impact: string
  poc: string
  evidence: string
  fix: string
  references: string[]
  status: string
  createdAt: string
  updatedAt: string
}

const severityColors: Record<string, string> = {
  critical: 'bg-red-500/10 text-red-400 border-red-500/30',
  high: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
  medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
  low: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  info: 'bg-neutral-500/10 text-neutral-400 border-neutral-500/30',
}

export default function VulnerabilityDetailPage() {
  const router = useRouter()
  const params = useParams()
  const vulnId = params.id as string

  const [vuln, setVuln] = useState<Vulnerability | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [title, setTitle] = useState('')
  const [severity, setSeverity] = useState('medium')
  const [cvss, setCVSS] = useState('')
  const [cwe, setCWE] = useState('')
  const [owasp, setOWASP] = useState('')
  const [description, setDescription] = useState('')
  const [impact, setImpact] = useState('')
  const [poc, setPoc] = useState('')
  const [evidence, setEvidence] = useState('')
  const [fix, setFix] = useState('')
  const [references, setReferences] = useState<string[]>([])
  const [newReference, setNewReference] = useState('')
  const [status, setStatus] = useState('open')

  const fetchVuln = useCallback(async () => {
    try {
      const res = await fetch(`/api/vulnerabilities/${vulnId}`)
      if (res.ok) {
        const data = await res.json()
        setVuln(data)
        setTitle(data.title || '')
        setSeverity(data.severity || 'medium')
        setCVSS(data.cvss?.toString() || '')
        setCWE(data.cwe || '')
        setOWASP(data.owasp || '')
        setDescription(data.description || '')
        setImpact(data.impact || '')
        setPoc(data.poc || '')
        setEvidence(data.evidence || '')
        setFix(data.fix || '')
        setReferences(data.references || [])
        setStatus(data.status || 'open')
      }
    } catch (error) {
      console.error('Failed to fetch vulnerability:', error)
    } finally {
      setLoading(false)
    }
  }, [vulnId])

  useEffect(() => {
    fetchVuln()
  }, [fetchVuln])

  const saveVuln = async () => {
    setSaving(true)
    try {
      await fetch(`/api/vulnerabilities/${vulnId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          severity,
          cvss: parseFloat(cvss) || 0,
          cwe,
          owasp,
          description,
          impact,
          poc,
          evidence,
          fix,
          references,
          status,
        }),
      })
    } catch (error) {
      console.error('Failed to save vulnerability:', error)
    } finally {
      setSaving(false)
    }
  }

  const deleteVuln = async () => {
    try {
      const res = await fetch(`/api/vulnerabilities/${vulnId}`, { method: 'DELETE' })
      if (res.ok) {
        router.push('/vulnerabilities')
      }
    } catch (error) {
      console.error('Failed to delete vulnerability:', error)
    }
  }

  const addReference = () => {
    const trimmed = newReference.trim()
    if (trimmed && !references.includes(trimmed)) {
      setReferences([...references, trimmed])
      setNewReference('')
    }
  }

  const removeReference = (ref: string) => {
    setReferences(references.filter((r) => r !== ref))
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-background text-foreground">
        <Sidebar />
        <main className="flex-1 overflow-auto p-6">
          <CommandPalette />
          <div className="max-w-4xl mx-auto text-center py-8 text-muted-foreground text-sm">Loading...</div>
        </main>
      </div>
    )
  }

  if (!vuln) {
    return (
      <div className="flex h-screen bg-background text-foreground">
        <Sidebar />
        <main className="flex-1 overflow-auto p-6">
          <CommandPalette />
          <div className="max-w-4xl mx-auto text-center py-8 text-muted-foreground text-sm">Vulnerability not found</div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar />
      <main className="flex-1 overflow-auto p-6">
        <CommandPalette />
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => router.push('/vulnerabilities')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <h1 className="text-lg font-semibold">Edit Vulnerability</h1>
              {saving && (
                <Badge variant="secondary" className="text-[10px]">
                  Saving...
                </Badge>
              )}
            </div>
            <div className="flex gap-2">
              <Button onClick={saveVuln} disabled={saving} size="sm">
                <Save className="w-3.5 h-3.5 mr-1.5" />
                Save
              </Button>
              <Button variant="destructive" size="sm" onClick={deleteVuln}>
                <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                Delete
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            <Card className="p-5">
              <h3 className="font-semibold mb-4 text-sm">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1.5 text-muted-foreground">Title</label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-muted-foreground">Severity</label>
                  <Select value={severity} onValueChange={setSeverity}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="info">Info</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-muted-foreground">Status</label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="fixed">Fixed</SelectItem>
                      <SelectItem value="false_positive">False Positive</SelectItem>
                      <SelectItem value="risk_accepted">Risk Accepted</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-muted-foreground">CVSS Score</label>
                  <Input type="number" step="0.1" min="0" max="10" value={cvss} onChange={(e) => setCVSS(e.target.value)} placeholder="0.0 - 10.0" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-muted-foreground">CWE</label>
                  <Input value={cwe} onChange={(e) => setCWE(e.target.value)} placeholder="e.g., CWE-79" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-muted-foreground">OWASP</label>
                  <Input value={owasp} onChange={(e) => setOWASP(e.target.value)} placeholder="e.g., A03:2021" />
                </div>
              </div>
            </Card>

            <Card className="p-5">
              <h3 className="font-semibold mb-4 text-sm">Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-muted-foreground">Description</label>
                  <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} placeholder="Describe the vulnerability..." />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-muted-foreground">Impact</label>
                  <Textarea value={impact} onChange={(e) => setImpact(e.target.value)} rows={3} placeholder="What is the impact of this vulnerability?" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-muted-foreground">Proof of Concept</label>
                  <Textarea value={poc} onChange={(e) => setPoc(e.target.value)} rows={4} placeholder="Steps to reproduce..." />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-muted-foreground">Evidence</label>
                  <Textarea value={evidence} onChange={(e) => setEvidence(e.target.value)} rows={3} placeholder="Screenshots, logs, or other evidence..." />
                </div>
              </div>
            </Card>

            <Card className="p-5">
              <h3 className="font-semibold mb-4 text-sm">Remediation</h3>
              <Textarea value={fix} onChange={(e) => setFix(e.target.value)} rows={4} placeholder="How to fix this vulnerability..." />
            </Card>

            <Card className="p-5">
              <h3 className="font-semibold mb-4 text-sm">References</h3>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input value={newReference} onChange={(e) => setNewReference(e.target.value)} placeholder="Add reference URL..." className="flex-1" onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addReference() } }} />
                  <Button variant="outline" onClick={addReference}>Add</Button>
                </div>
                {references.length > 0 && (
                  <div className="space-y-1">
                    {references.map((ref, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted/30 rounded border border-border/50">
                        <a href={ref} target="_blank" rel="noopener noreferrer" className="text-sm text-foreground hover:underline truncate flex-1">
                          {ref}
                        </a>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => removeReference(ref)}>
                          <span className="text-muted-foreground hover:text-foreground">×</span>
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
