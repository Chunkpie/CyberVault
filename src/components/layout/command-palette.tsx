'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  FileText,
  Target,
  LayoutDashboard,
  Bug,
  Code2,
  FileBarChart,
  Settings,
  Search,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Command {
  id: string;
  label: string;
  icon: React.ElementType;
  action: () => void;
  keywords: string[];
}

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const commands: Command[] = [
    {
      id: 'create-note',
      label: 'Create Note',
      icon: FileText,
      action: () => router.push('/notes'),
      keywords: ['create', 'note', 'new'],
    },
    {
      id: 'create-engagement',
      label: 'Create Engagement',
      icon: Target,
      action: () => router.push('/engagements'),
      keywords: ['create', 'engagement', 'new'],
    },
    {
      id: 'go-dashboard',
      label: 'Go to Dashboard',
      icon: LayoutDashboard,
      action: () => router.push('/'),
      keywords: ['go', 'dashboard', 'home'],
    },
    {
      id: 'go-notes',
      label: 'Go to Notes',
      icon: FileText,
      action: () => router.push('/notes'),
      keywords: ['go', 'notes'],
    },
    {
      id: 'go-vulns',
      label: 'Go to Vulnerabilities',
      icon: Bug,
      action: () => router.push('/vulnerabilities'),
      keywords: ['go', 'vulnerabilities', 'vulns'],
    },
    {
      id: 'go-payloads',
      label: 'Go to Payloads',
      icon: Code2,
      action: () => router.push('/payloads'),
      keywords: ['go', 'payloads'],
    },
    {
      id: 'go-reports',
      label: 'Go to Reports',
      icon: FileBarChart,
      action: () => router.push('/reports'),
      keywords: ['go', 'reports'],
    },
    {
      id: 'go-settings',
      label: 'Go to Settings',
      icon: Settings,
      action: () => router.push('/settings'),
      keywords: ['go', 'settings', 'config'],
    },
  ];

  const filtered = commands.filter((cmd) => {
    if (!query) return true;
    const lower = query.toLowerCase();
    return (
      cmd.label.toLowerCase().includes(lower) ||
      cmd.keywords.some((kw) => kw.includes(lower))
    );
  });

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((i) => (i + 1) % filtered.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((i) => (i - 1 + filtered.length) % filtered.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        filtered[selectedIndex]?.action();
        setOpen(false);
      } else if (e.key === 'Escape') {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, filtered, selectedIndex]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />
      <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-xl border border-border/50 bg-panel shadow-2xl animate-fade-in">
        <div className="flex items-center gap-3 border-b border-border/50 px-4">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command..."
            className="h-12 w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          <kbd className="pointer-events-none rounded border border-border bg-muted/30 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
            ESC
          </kbd>
        </div>

        <ul className="max-h-72 overflow-y-auto p-1.5">
          {filtered.length === 0 && (
            <li className="px-4 py-6 text-center text-sm text-muted-foreground">
              No results found.
            </li>
          )}
          {filtered.map((cmd, i) => (
            <li key={cmd.id}>
              <button
                onClick={() => {
                  cmd.action();
                  setOpen(false);
                }}
                className={cn(
                  'flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                  i === selectedIndex
                    ? 'bg-foreground/[0.07] text-foreground'
                    : 'text-foreground hover:bg-foreground/[0.03]'
                )}
              >
                <cmd.icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span>{cmd.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
