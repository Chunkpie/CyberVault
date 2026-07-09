'use client'

import Sidebar from '@/components/layout/sidebar'
import CommandPalette from '@/components/layout/command-palette'
import Dashboard from '@/components/dashboard/dashboard'

export default function HomePage() {
  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <CommandPalette />
        <Dashboard />
      </main>
    </div>
  )
}
