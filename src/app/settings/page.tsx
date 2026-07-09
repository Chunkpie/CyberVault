'use client'

import { useState, useEffect, useCallback } from 'react'
import { Database, Download, Trash2, RefreshCw, Info } from 'lucide-react'
import Sidebar from '@/components/layout/sidebar'
import CommandPalette from '@/components/layout/command-palette'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface DBStats {
  notes: number
  payloads: number
  recon: number
  reports: number
  cves: number
  bookmarks: number
  tools: number
  checklists: number
  templates: number
  screenshots: number
  vulnerabilities: number
  engagements: number
}

export default function SettingsPage() {
  const [stats, setStats] = useState<DBStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/settings/stats')
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  const exportData = async () => {
    try {
      const res = await fetch('/api/settings/export')
      if (res.ok) {
        const data = await res.json()
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `cybervault-export-${new Date().toISOString().split('T')[0]}.json`
        a.click()
        URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Failed to export data:', error)
    }
  }

  const forceSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/settings/save', { method: 'POST' })
      if (res.ok) {
        alert('Data saved successfully')
      }
    } catch (error) {
      console.error('Failed to force save:', error)
    } finally {
      setSaving(false)
    }
  }

  const deleteAllData = async () => {
    if (!confirm('Are you sure you want to delete ALL data? This cannot be undone.')) return
    setDeleting(true)
    try {
      const res = await fetch('/api/settings/delete-all', { method: 'DELETE' })
      if (res.ok) {
        alert('All data deleted')
        fetchStats()
      }
    } catch (error) {
      console.error('Failed to delete data:', error)
    } finally {
      setDeleting(false)
    }
  }

  const totalItems = stats
    ? Object.values(stats).reduce((sum, val) => sum + val, 0)
    : 0

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar />
      <main className="flex-1 overflow-auto p-6">
        <CommandPalette />
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage your application data and preferences</p>
          </div>

          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
                <Database className="w-4 h-4 text-muted-foreground" />
                Database Statistics
              </h2>
              {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-20 animate-pulse rounded-lg bg-muted" />
                  ))}
                </div>
              ) : stats ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {Object.entries(stats).map(([key, value]) => (
                    <div key={key} className="text-center p-3 bg-muted/30 rounded-lg border border-border/50">
                      <div className="text-xl font-bold">{value}</div>
                      <div className="text-[11px] text-muted-foreground capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </div>
                    </div>
                  ))}
                  <div className="text-center p-3 bg-foreground/[0.03] rounded-lg border border-foreground/10">
                    <div className="text-xl font-bold">{totalItems}</div>
                    <div className="text-[11px] text-muted-foreground">Total Items</div>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">Failed to load stats</div>
              )}
            </Card>

            <Card className="p-6">
              <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
                <Download className="w-4 h-4 text-muted-foreground" />
                Data Management
              </h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg border border-border/50">
                  <div>
                    <h3 className="font-medium text-sm">Export Data</h3>
                    <p className="text-xs text-muted-foreground">
                      Download all data as a JSON file
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={exportData}>
                    <Download className="w-3.5 h-3.5 mr-1.5" />
                    Export
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg border border-border/50">
                  <div>
                    <h3 className="font-medium text-sm">Force Save</h3>
                    <p className="text-xs text-muted-foreground">
                      Immediately save all in-memory data to disk
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={forceSave} disabled={saving}>
                    <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${saving ? 'animate-spin' : ''}`} />
                    {saving ? 'Saving...' : 'Save Now'}
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 bg-danger/5 rounded-lg border border-danger/20">
                  <div>
                    <h3 className="font-medium text-sm text-danger">Delete All Data</h3>
                    <p className="text-xs text-muted-foreground">
                      Permanently remove all data from the database
                    </p>
                  </div>
                  <Button variant="destructive" size="sm" onClick={deleteAllData} disabled={deleting}>
                    <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                    {deleting ? 'Deleting...' : 'Delete All'}
                  </Button>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
                <Info className="w-4 h-4 text-muted-foreground" />
                About
              </h2>
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Application</span>
                  <span className="font-medium">CyberVault</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Version</span>
                  <span className="font-medium">1.0.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Framework</span>
                  <span className="font-medium">Next.js 15</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Port</span>
                  <span className="font-medium">3333</span>
                </div>
                <div className="pt-3 border-t border-border/50 text-muted-foreground text-xs leading-relaxed">
                  Secure knowledge management for cybersecurity professionals.
                  All data is stored locally on your machine.
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
