'use client'

import { useState, useEffect, useCallback } from 'react'
import { Upload, Grid, List, Trash2, Download, X, Maximize2 } from 'lucide-react'
import Sidebar from '@/components/layout/sidebar'
import CommandPalette from '@/components/layout/command-palette'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface Screenshot {
  id: string
  filename: string
  originalName: string
  path: string
  notes: string
  tags: string[]
  createdAt: string
}

export default function ScreenshotsPage() {
  const [screenshots, setScreenshots] = useState<Screenshot[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [uploading, setUploading] = useState(false)
  const [fullscreen, setFullscreen] = useState<Screenshot | null>(null)

  const fetchScreenshots = useCallback(async () => {
    try {
      const res = await fetch('/api/screenshots')
      if (res.ok) {
        const data = await res.json()
        setScreenshots(data)
      }
    } catch (error) {
      console.error('Failed to fetch screenshots:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchScreenshots()
  }, [fetchScreenshots])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setFullscreen(null)
    }
    if (fullscreen) {
      document.addEventListener('keydown', handler)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [fullscreen])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    for (const file of Array.from(files)) {
      const reader = new FileReader()
      reader.onload = async () => {
        const base64 = reader.result as string
        try {
          const res = await fetch('/api/screenshots', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              filename: file.name,
              data: base64,
              notes: '',
            }),
          })
          if (res.ok) {
            const screenshot = await res.json()
            setScreenshots((prev) => [screenshot, ...prev])
          }
        } catch (error) {
          console.error('Failed to upload screenshot:', error)
        }
      }
      reader.readAsDataURL(file)
    }
    setUploading(false)
    e.target.value = ''
  }

  const deleteScreenshot = async (id: string) => {
    try {
      const res = await fetch(`/api/screenshots/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setScreenshots(screenshots.filter((s) => s.id !== id))
        if (fullscreen?.id === id) setFullscreen(null)
      }
    } catch (error) {
      console.error('Failed to delete screenshot:', error)
    }
  }

  const downloadImage = (screenshot: Screenshot) => {
    const a = document.createElement('a')
    a.href = screenshot.path
    a.download = screenshot.filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar />
      <main className="flex-1 overflow-auto p-6">
        <CommandPalette />
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Screenshots</h1>
              <p className="text-sm text-muted-foreground mt-1">{screenshots.length} files</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex border border-border rounded-md">
                <button
                  className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-foreground/10' : 'hover:bg-foreground/5'}`}
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-foreground/10' : 'hover:bg-foreground/5'}`}
                  onClick={() => setViewMode('list')}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
              <label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleUpload}
                />
                <Button asChild disabled={uploading}>
                  <span>
                    <Upload className="w-4 h-4 mr-2" />
                    {uploading ? 'Uploading...' : 'Upload'}
                  </span>
                </Button>
              </label>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-48 animate-pulse rounded-lg bg-muted" />
              ))}
            </div>
          ) : screenshots.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                <Upload className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">No screenshots yet</p>
              <label>
                <input type="file" accept="image/*" multiple className="hidden" onChange={handleUpload} />
                <Button variant="outline" size="sm" className="mt-3" asChild>
                  <span>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload your first screenshot
                  </span>
                </Button>
              </label>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {screenshots.map((screenshot) => (
                <Card key={screenshot.id} className="overflow-hidden group">
                  <div
                    className="aspect-video relative cursor-pointer"
                    onClick={() => setFullscreen(screenshot)}
                  >
                    <img
                      src={screenshot.path}
                      alt={screenshot.filename}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Maximize2 className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="p-2 space-y-2">
                    <p className="text-[11px] text-muted-foreground truncate">
                      {screenshot.filename}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {new Date(screenshot.createdAt).toLocaleDateString()}
                    </p>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 h-7 text-[11px]"
                        onClick={() => downloadImage(screenshot)}
                      >
                        <Download className="w-3 h-3 mr-1" />
                        Download
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="h-7 w-7 p-0"
                        onClick={() => deleteScreenshot(screenshot.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="border border-border/50 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted/20">
                  <tr>
                    <th className="px-4 py-3 text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Preview</th>
                    <th className="px-4 py-3 text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Filename</th>
                    <th className="px-4 py-3 text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-right text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {screenshots.map((screenshot) => (
                    <tr key={screenshot.id} className="border-t border-border/50 hover:bg-foreground/[0.02] transition-colors">
                      <td className="px-4 py-2">
                        <img
                          src={screenshot.path}
                          alt={screenshot.filename}
                          className="w-16 h-12 object-cover rounded cursor-pointer hover:opacity-80"
                          onClick={() => setFullscreen(screenshot)}
                        />
                      </td>
                      <td className="px-4 py-3 font-mono text-sm">{screenshot.filename}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {new Date(screenshot.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => downloadImage(screenshot)}
                          >
                            <Download className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => deleteScreenshot(screenshot.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5 text-danger" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {fullscreen && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex flex-col"
          onClick={() => setFullscreen(null)}
        >
          <div className="flex items-center justify-between p-4 border-b border-border/20">
            <div className="flex items-center gap-3">
              <span className="text-white font-medium text-sm">{fullscreen.filename}</span>
              <span className="text-white/40 text-xs">
                {new Date(fullscreen.createdAt).toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  downloadImage(fullscreen)
                }}
              >
                <Download className="w-3.5 h-3.5 mr-1.5" />
                Download
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:text-white hover:bg-white/10 h-8 w-8 p-0"
                onClick={(e) => {
                  e.stopPropagation()
                  deleteScreenshot(fullscreen.id)
                }}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:text-white hover:bg-white/10 h-8 w-8 p-0"
                onClick={() => setFullscreen(null)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
            <img
              src={fullscreen.path}
              alt={fullscreen.filename}
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  )
}
