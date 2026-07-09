'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Plus, X, Check, Trash2 } from 'lucide-react'
import Sidebar from '@/components/layout/sidebar'
import CommandPalette from '@/components/layout/command-palette'
import Editor from '@/components/editor/editor'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface Target {
  id: string
  host: string
  ip: string
  type: string
}

interface Vulnerability {
  id: string
  title: string
  severity: string
  status: string
}

interface ChecklistItem {
  id: string
  text: string
  completed: boolean
}

interface Engagement {
  id: string
  name: string
  client: string
  scope: string
  status: string
  startDate: string
  endDate: string
  targets: Target[]
  vulnerabilities: Vulnerability[]
  notes: string
  checklist: ChecklistItem[]
  createdAt: string
  updatedAt: string
}

const statusColors: Record<string, string> = {
  active: 'bg-green-500/10 text-green-400 border-green-500/30',
  completed: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  on_hold: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
  cancelled: 'bg-red-500/10 text-red-400 border-red-500/30',
}

const severityColors: Record<string, string> = {
  critical: 'bg-red-500/10 text-red-400 border-red-500/30',
  high: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
  medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
  low: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  info: 'bg-neutral-500/10 text-neutral-400 border-neutral-500/30',
}

export default function EngagementDetailPage() {
  const router = useRouter()
  const params = useParams()
  const engagementId = params.id as string

  const [engagement, setEngagement] = useState<Engagement | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [newTarget, setNewTarget] = useState({ host: '', ip: '', type: 'web' })
  const [newChecklistItem, setNewChecklistItem] = useState('')
  const [notes, setNotes] = useState('')
  const [newVulnTitle, setNewVulnTitle] = useState('')
  const [newVulnSeverity, setNewVulnSeverity] = useState('medium')

  const [editName, setEditName] = useState('')
  const [editClient, setEditClient] = useState('')
  const [editScope, setEditScope] = useState('')
  const [editStatus, setEditStatus] = useState('')
  const [editStartDate, setEditStartDate] = useState('')
  const [editEndDate, setEditEndDate] = useState('')

  const fetchEngagement = useCallback(async () => {
    try {
      const res = await fetch(`/api/engagements/${engagementId}`)
      if (res.ok) {
        const data = await res.json()
        setEngagement(data)
        setNotes(data.notes || '')
        setEditName(data.name || '')
        setEditClient(data.client || '')
        setEditScope(data.scope || '')
        setEditStatus(data.status || 'active')
        setEditStartDate(data.startDate || '')
        setEditEndDate(data.endDate || '')
      }
    } catch (error) {
      console.error('Failed to fetch engagement:', error)
    } finally {
      setLoading(false)
    }
  }, [engagementId])

  useEffect(() => {
    fetchEngagement()
  }, [fetchEngagement])

  const updateEngagement = async (updates: Record<string, any>) => {
    try {
      const res = await fetch(`/api/engagements/${engagementId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      if (res.ok) {
        const data = await res.json()
        setEngagement(data)
      }
    } catch (error) {
      console.error('Failed to update engagement:', error)
    }
  }

  const saveOverview = () => {
    updateEngagement({
      name: editName,
      client: editClient,
      scope: editScope,
      status: editStatus,
      start_date: editStartDate,
      end_date: editEndDate,
    })
  }

  const deleteEngagement = async () => {
    try {
      const res = await fetch(`/api/engagements/${engagementId}`, { method: 'DELETE' })
      if (res.ok) {
        router.push('/engagements')
      }
    } catch (error) {
      console.error('Failed to delete engagement:', error)
    }
  }

  const addTarget = () => {
    if (!newTarget.host || !newTarget.ip) return
    const target: Target = { id: crypto.randomUUID(), ...newTarget }
    updateEngagement({
      targets: [...(engagement?.targets || []), target],
    })
    setNewTarget({ host: '', ip: '', type: 'web' })
  }

  const removeTarget = (targetId: string) => {
    updateEngagement({
      targets: engagement?.targets.filter((t) => t.id !== targetId) || [],
    })
  }

  const addChecklistItem = () => {
    if (!newChecklistItem.trim()) return
    const item: ChecklistItem = { id: crypto.randomUUID(), text: newChecklistItem.trim(), completed: false }
    updateEngagement({
      checklist: [...(engagement?.checklist || []), item],
    })
    setNewChecklistItem('')
  }

  const toggleChecklistItem = (itemId: string) => {
    updateEngagement({
      checklist: engagement?.checklist.map((item) =>
        item.id === itemId ? { ...item, completed: !item.completed } : item
      ) || [],
    })
  }

  const removeChecklistItem = (itemId: string) => {
    updateEngagement({
      checklist: engagement?.checklist.filter((item) => item.id !== itemId) || [],
    })
  }

  const saveNotes = () => {
    updateEngagement({ notes })
  }

  const addVulnerability = () => {
    if (!newVulnTitle.trim()) return
    const vuln: Vulnerability = {
      id: crypto.randomUUID(),
      title: newVulnTitle.trim(),
      severity: newVulnSeverity,
      status: 'open',
    }
    updateEngagement({
      vulnerabilities: [...(engagement?.vulnerabilities || []), vuln],
    })
    setNewVulnTitle('')
    setNewVulnSeverity('medium')
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-background text-foreground">
        <Sidebar />
        <main className="flex-1 overflow-auto p-6">
          <CommandPalette />
          <div className="max-w-6xl mx-auto text-center py-8 text-muted-foreground text-sm">Loading...</div>
        </main>
      </div>
    )
  }

  if (!engagement) {
    return (
      <div className="flex h-screen bg-background text-foreground">
        <Sidebar />
        <main className="flex-1 overflow-auto p-6">
          <CommandPalette />
          <div className="max-w-6xl mx-auto text-center py-8 text-muted-foreground text-sm">Engagement not found</div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar />
      <main className="flex-1 overflow-auto p-6">
        <CommandPalette />
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="sm" onClick={() => router.push('/engagements')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="flex-1">
              <h1 className="text-lg font-semibold">{engagement.name}</h1>
              <p className="text-sm text-muted-foreground">{engagement.client}</p>
            </div>
            <Badge variant="outline" className={`text-[11px] ${statusColors[engagement.status] || ''}`}>
              {engagement.status}
            </Badge>
            <Button variant="destructive" size="sm" onClick={deleteEngagement}>
              <Trash2 className="w-3.5 h-3.5 mr-1.5" />
              Delete
            </Button>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="scope">Scope</TabsTrigger>
              <TabsTrigger value="vulnerabilities">Vulnerabilities</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
              <TabsTrigger value="checklist">Checklist</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold">Engagement Details</h3>
                  <Button size="sm" onClick={saveOverview}>Save Changes</Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-muted-foreground">Name</label>
                    <Input value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Engagement name" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-muted-foreground">Client</label>
                    <Input value={editClient} onChange={(e) => setEditClient(e.target.value)} placeholder="Client name" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-muted-foreground">Status</label>
                    <Select value={editStatus} onValueChange={setEditStatus}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="on_hold">On Hold</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-muted-foreground">Scope</label>
                    <Input value={editScope} onChange={(e) => setEditScope(e.target.value)} placeholder="e.g. *.target.com" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-muted-foreground">Start Date</label>
                    <Input type="date" value={editStartDate} onChange={(e) => setEditStartDate(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-muted-foreground">End Date</label>
                    <Input type="date" value={editEndDate} onChange={(e) => setEditEndDate(e.target.value)} />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-border/50">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{engagement.targets?.length || 0}</div>
                    <div className="text-xs text-muted-foreground">Targets</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{engagement.vulnerabilities?.length || 0}</div>
                    <div className="text-xs text-muted-foreground">Vulnerabilities</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {engagement.checklist?.filter((i) => i.completed).length || 0}/{engagement.checklist?.length || 0}
                    </div>
                    <div className="text-xs text-muted-foreground">Checklist</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {new Date(engagement.updatedAt).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-muted-foreground">Last Updated</div>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="scope">
              <Card className="p-5">
                <h3 className="font-semibold mb-4">Targets</h3>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input placeholder="Host" value={newTarget.host} onChange={(e) => setNewTarget({ ...newTarget, host: e.target.value })} className="flex-1" />
                    <Input placeholder="IP Address" value={newTarget.ip} onChange={(e) => setNewTarget({ ...newTarget, ip: e.target.value })} className="flex-1" />
                    <Select value={newTarget.type} onValueChange={(value) => setNewTarget({ ...newTarget, type: value })}>
                      <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="web">Web</SelectItem>
                        <SelectItem value="api">API</SelectItem>
                        <SelectItem value="mobile">Mobile</SelectItem>
                        <SelectItem value="network">Network</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button onClick={addTarget}><Plus className="w-4 h-4" /></Button>
                  </div>

                  {engagement.targets?.length === 0 ? (
                    <div className="text-center py-4 text-sm text-muted-foreground">No targets added yet</div>
                  ) : (
                    <div className="space-y-2">
                      {engagement.targets?.map((target) => (
                        <div key={target.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border/50">
                          <div>
                            <span className="font-mono text-sm">{target.host}</span>
                            <span className="text-muted-foreground mx-2">|</span>
                            <span className="text-muted-foreground text-sm">{target.ip}</span>
                            <Badge variant="outline" className="ml-2 text-[10px]">{target.type}</Badge>
                          </div>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => removeTarget(target.id)}>
                            <X className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="vulnerabilities">
              <Card className="p-5">
                <h3 className="font-semibold mb-4">Vulnerabilities</h3>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input placeholder="Vulnerability title" value={newVulnTitle} onChange={(e) => setNewVulnTitle(e.target.value)} className="flex-1" onKeyDown={(e) => e.key === 'Enter' && addVulnerability()} />
                    <Select value={newVulnSeverity} onValueChange={setNewVulnSeverity}>
                      <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="critical">Critical</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="info">Info</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button onClick={addVulnerability}><Plus className="w-4 h-4" /></Button>
                  </div>

                  {engagement.vulnerabilities?.length === 0 ? (
                    <div className="text-center py-4 text-sm text-muted-foreground">No vulnerabilities found</div>
                  ) : (
                    <div className="space-y-2">
                      {engagement.vulnerabilities?.map((vuln) => (
                        <div key={vuln.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border/50 cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => router.push(`/vulnerabilities/${vuln.id}`)}>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={`text-[10px] ${severityColors[vuln.severity] || ''}`}>{vuln.severity}</Badge>
                            <span className="text-sm">{vuln.title}</span>
                          </div>
                          <Badge variant="secondary" className="text-[10px]">{vuln.status}</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="notes">
              <Card className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Notes</h3>
                  <Button variant="outline" size="sm" onClick={saveNotes}>Save</Button>
                </div>
                <div className="border border-border/50 rounded-lg min-h-[400px]">
                  <Editor content={notes} onChange={setNotes} />
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="checklist">
              <Card className="p-5">
                <h3 className="font-semibold mb-4">Checklist</h3>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input placeholder="Add checklist item..." value={newChecklistItem} onChange={(e) => setNewChecklistItem(e.target.value)} className="flex-1" onKeyDown={(e) => e.key === 'Enter' && addChecklistItem()} />
                    <Button onClick={addChecklistItem}><Plus className="w-4 h-4" /></Button>
                  </div>

                  {engagement.checklist?.length === 0 ? (
                    <div className="text-center py-4 text-sm text-muted-foreground">No checklist items yet</div>
                  ) : (
                    <div className="space-y-2">
                      {engagement.checklist?.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border/50">
                          <div className="flex items-center gap-3">
                            <button onClick={() => toggleChecklistItem(item.id)} className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${item.completed ? 'bg-foreground border-foreground text-background' : 'border-border hover:border-foreground/50'}`}>
                              {item.completed && <Check className="w-3 h-3" />}
                            </button>
                            <span className={`text-sm ${item.completed ? 'line-through text-muted-foreground' : ''}`}>{item.text}</span>
                          </div>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => removeChecklistItem(item.id)}>
                            <X className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
