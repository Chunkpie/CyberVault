'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, Plus, ExternalLink, Trash2, Bookmark } from 'lucide-react'
import Sidebar from '@/components/layout/sidebar'
import CommandPalette from '@/components/layout/command-palette'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'

interface BookmarkItem {
  id: string
  title: string
  url: string
  description: string
  createdAt: string
  updatedAt: string
}

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newUrl, setNewUrl] = useState('')
  const [newDescription, setNewDescription] = useState('')

  const fetchBookmarks = useCallback(async () => {
    try {
      const res = await fetch('/api/bookmarks')
      if (res.ok) {
        const data = await res.json()
        setBookmarks(data)
      }
    } catch (error) {
      console.error('Failed to fetch bookmarks:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBookmarks()
  }, [fetchBookmarks])

  const addBookmark = async () => {
    if (!newTitle.trim() || !newUrl.trim()) return
    try {
      const res = await fetch('/api/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          url: newUrl,
          description: newDescription,
        }),
      })
      if (res.ok) {
        const bookmark = await res.json()
        setBookmarks([bookmark, ...bookmarks])
        setNewTitle('')
        setNewUrl('')
        setNewDescription('')
        setShowAddForm(false)
      }
    } catch (error) {
      console.error('Failed to add bookmark:', error)
    }
  }

  const deleteBookmark = async (id: string) => {
    try {
      const res = await fetch(`/api/bookmarks/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setBookmarks(bookmarks.filter((b) => b.id !== id))
      }
    } catch (error) {
      console.error('Failed to delete bookmark:', error)
    }
  }

  const filteredBookmarks = bookmarks.filter(
    (b) =>
      b.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.url?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar />
      <main className="flex-1 overflow-auto p-6">
        <CommandPalette />
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Bookmarks</h1>
              <p className="text-sm text-muted-foreground mt-1">{bookmarks.length} saved bookmarks</p>
            </div>
            <Button onClick={() => setShowAddForm(!showAddForm)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Bookmark
            </Button>
          </div>

          {showAddForm && (
            <Card className="p-5 mb-6">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <Input
                  placeholder="Title"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
                <Input
                  placeholder="URL"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                />
              </div>
              <div className="flex gap-4">
                <Textarea
                  placeholder="Description"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="min-h-[60px]"
                />
                <Button onClick={addBookmark} className="shrink-0">
                  Add
                </Button>
              </div>
            </Card>
          )}

          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search bookmarks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-40 animate-pulse rounded-lg bg-muted" />
              ))}
            </div>
          ) : filteredBookmarks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                <Bookmark className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                {searchQuery ? 'No bookmarks match your search' : 'No bookmarks yet'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredBookmarks.map((bookmark) => (
                <Card key={bookmark.id} className="p-5 hover:shadow-card-hover hover:border-border/80 transition-all duration-200 group">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <Bookmark className="w-4 h-4 text-muted-foreground shrink-0" />
                      <h3 className="font-semibold truncate text-foreground">{bookmark.title}</h3>
                    </div>
                    <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <a
                        href={bookmark.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => deleteBookmark(bookmark.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5 text-danger" />
                      </Button>
                    </div>
                  </div>

                  <a
                    href={bookmark.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground hover:text-foreground truncate block mb-2 transition-colors"
                  >
                    {bookmark.url}
                  </a>

                  {bookmark.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                      {bookmark.description}
                    </p>
                  )}

                  <div className="text-[11px] text-muted-foreground mt-3 pt-2 border-t border-border/50">
                    Added {new Date(bookmark.createdAt).toLocaleDateString()}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
