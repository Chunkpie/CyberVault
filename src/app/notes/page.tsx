'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Plus, Pin, PinOff, Trash2, Tag } from 'lucide-react'
import Sidebar from '@/components/layout/sidebar'
import CommandPalette from '@/components/layout/command-palette'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Note {
  id: string
  title: string
  content: string
  tags: string[]
  pinned: boolean
  createdAt: string
  updatedAt: string
}

export default function NotesPage() {
  const router = useRouter()
  const [notes, setNotes] = useState<Note[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchNotes = useCallback(async () => {
    try {
      const res = await fetch('/api/notes')
      if (res.ok) {
        const data = await res.json()
        setNotes(data)
      }
    } catch (error) {
      console.error('Failed to fetch notes:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchNotes()
  }, [fetchNotes])

  const createNote = async () => {
    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Untitled Note', content: '', tags: [] }),
      })
      if (res.ok) {
        const note = await res.json()
        router.push(`/notes/${note.id}`)
      }
    } catch (error) {
      console.error('Failed to create note:', error)
    }
  }

  const deleteNote = async (id: string) => {
    try {
      const res = await fetch(`/api/notes/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setNotes(notes.filter((n) => n.id !== id))
      }
    } catch (error) {
      console.error('Failed to delete note:', error)
    }
  }

  const togglePin = async (id: string, pinned: boolean) => {
    try {
      const res = await fetch(`/api/notes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pinned: !pinned }),
      })
      if (res.ok) {
        setNotes(notes.map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n)))
      }
    } catch (error) {
      console.error('Failed to toggle pin:', error)
    }
  }

  const filteredNotes = notes.filter(
    (note) =>
      note.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (Array.isArray(note.tags) && note.tags.some((tag) => tag?.toLowerCase().includes(searchQuery.toLowerCase())))
  )

  const sortedNotes = [...filteredNotes].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1
    if (!a.pinned && b.pinned) return 1
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  })

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar />
      <main className="flex-1 overflow-auto p-6">
        <CommandPalette />
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Notes</h1>
              <p className="text-sm text-muted-foreground mt-1">{notes.length} notes total</p>
            </div>
            <Button onClick={createNote}>
              <Plus className="w-4 h-4 mr-2" />
              New Note
            </Button>
          </div>

          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search notes..."
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
          ) : sortedNotes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                <Search className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                {searchQuery ? 'No notes match your search' : 'No notes yet'}
              </p>
              {!searchQuery && (
                <Button variant="outline" size="sm" className="mt-3" onClick={createNote}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create your first note
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedNotes.map((note) => (
                <Card
                  key={note.id}
                  className="p-4 hover:shadow-card-hover hover:border-border/80 transition-all duration-200 cursor-pointer group"
                  onClick={() => router.push(`/notes/${note.id}`)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold truncate flex-1 text-foreground">{note.title}</h3>
                    <div className="flex gap-0.5 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={(e) => {
                          e.stopPropagation()
                          togglePin(note.id, note.pinned)
                        }}
                      >
                        {note.pinned ? (
                          <Pin className="w-3.5 h-3.5 text-foreground" />
                        ) : (
                          <PinOff className="w-3.5 h-3.5" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteNote(note.id)
                        }}
                      >
                        <Trash2 className="w-3.5 h-3.5 text-danger" />
                      </Button>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3 leading-relaxed">
                    {note.content || 'Empty note'}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex gap-1 flex-wrap">
                      {note.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0">
                          <Tag className="w-2.5 h-2.5 mr-0.5" />
                          {tag}
                        </Badge>
                      ))}
                      {note.tags.length > 3 && (
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                          +{note.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                    <span className="text-[11px] text-muted-foreground">
                      {new Date(note.updatedAt).toLocaleDateString()}
                    </span>
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
