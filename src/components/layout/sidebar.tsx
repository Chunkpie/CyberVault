'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  Target,
  Search,
  Bug,
  Code2,
  Wrench,
  ClipboardCheck,
  FileBarChart,
  BookOpen,
  Bookmark,
  Camera,
  FileCode,
  Archive,
  Settings,
  Plus,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'Notes', href: '/notes', icon: FileText },
  { label: 'Engagements', href: '/engagements', icon: Target },
  { label: 'Recon', href: '/recon', icon: Search },
  { label: 'Vulnerabilities', href: '/vulnerabilities', icon: Bug },
  { label: 'Payloads', href: '/payloads', icon: Code2 },
  { label: 'Tools', href: '/tools', icon: Wrench },
  { label: 'Checklists', href: '/checklists', icon: ClipboardCheck },
  { label: 'Reports', href: '/reports', icon: FileBarChart },
  { label: 'CVEs', href: '/cves', icon: BookOpen },
  { label: 'Bookmarks', href: '/bookmarks', icon: Bookmark },
  { label: 'Screenshots', href: '/screenshots', icon: Camera },
  { label: 'Templates', href: '/templates', icon: FileCode },
  { label: 'Archive', href: '/archive', icon: Archive },
  { label: 'Settings', href: '/settings', icon: Settings },
];

function AppSymbol() {
  return (
    <svg viewBox="0 0 512 512" className="h-8 w-8 shrink-0" aria-hidden="true">
      <rect x="40" y="40" width="432" height="432" rx="72" ry="72" fill="none" stroke="#0f172a" strokeWidth="24" />
      <polygon points="180,150 332,150 372,210 256,372 140,210" fill="#22c55e" />
      <path d="M208 188h96" stroke="white" strokeWidth="12" strokeLinecap="round" />
      <path d="M208 188l48 132" stroke="white" strokeWidth="12" strokeLinecap="round" />
      <path d="M304 188l-48 132" stroke="white" strokeWidth="12" strokeLinecap="round" />
      <circle cx="352" cy="120" r="13" fill="#f87171" />
      <circle cx="392" cy="92" r="13" fill="#f87171" />
      <circle cx="418" cy="132" r="13" fill="#f87171" />
    </svg>
  );
}

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  return (
    <aside
      className={cn(
        'relative flex h-screen flex-col border-r border-border bg-sidebar transition-all duration-300 ease-in-out',
        collapsed ? 'w-[60px]' : 'w-[240px]'
      )}
    >
      <div className="flex items-center gap-3 px-4 py-5 border-b border-border/50">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border/60 bg-background/70">
          <AppSymbol />
        </div>
        {!collapsed && (
          <span className="text-base font-semibold tracking-tight text-foreground">
            CyberVault
          </span>
        )}
      </div>

      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-8 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-sidebar text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
      >
        {collapsed ? (
          <ChevronRight className="h-3 w-3" />
        ) : (
          <ChevronLeft className="h-3 w-3" />
        )}
      </button>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 py-3">
        {navItems.map((item) => {
          const isActive =
            item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-[13px] font-medium transition-all duration-150',
                isActive
                  ? 'bg-foreground/[0.07] text-foreground'
                  : 'text-muted-foreground hover:bg-foreground/[0.04] hover:text-foreground',
                collapsed && 'justify-center px-0'
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className={cn('h-4 w-4 shrink-0', isActive && 'text-foreground')} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border/50 p-3">
        <button
          onClick={async () => {
            try {
              const res = await fetch('/api/notes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: 'Untitled Note', content: '', tags: [] }),
              });
              if (res.ok) {
                const note = await res.json();
                router.push(`/notes/${note.id}`);
              } else {
                router.push('/notes');
              }
            } catch (error) {
              console.error('Failed to create note from sidebar:', error);
              router.push('/notes');
            }
          }}
          className={cn(
            'flex w-full items-center justify-center gap-2 rounded-md bg-foreground px-3 py-2 text-[13px] font-medium text-background transition-all duration-150 hover:bg-foreground/90 active:scale-[0.98]',
            collapsed && 'px-0'
          )}
        >
          <Plus className="h-4 w-4 shrink-0" />
          {!collapsed && <span>New Note</span>}
        </button>
      </div>
    </aside>
  );
}
