'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  FileText,
  Users,
  Bug,
  Zap,
  Activity,
  AlertTriangle,
  Plus,
  PenTool,
  Shield,
  FileBarChart,
  Keyboard,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Stats {
  totalNotes: number;
  totalEngagements: number;
  totalVulnerabilities: number;
  totalPayloads: number;
  totalReports: number;
  activeEngagements: number;
  criticalVulns: number;
  highVulns: number;
}

interface ActivityItem {
  id: string;
  type: string;
  title: string;
  timestamp: string;
}

const quickActions = [
  { label: 'New Note', href: '/notes', icon: PenTool },
  { label: 'New Engagement', href: '/engagements', icon: Plus },
  { label: 'Add Vulnerability', href: '/vulnerabilities', icon: AlertTriangle },
  { label: 'Generate Report', href: '/reports', icon: FileBarChart },
];

const shortcuts = [
  { keys: ['Ctrl', 'N'], description: 'New Note' },
  { keys: ['Ctrl', 'E'], description: 'New Engagement' },
  { keys: ['Ctrl', 'K'], description: 'Search' },
  { keys: ['Ctrl', 'S'], description: 'Save' },
];

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    totalNotes: 0,
    totalEngagements: 0,
    totalVulnerabilities: 0,
    totalPayloads: 0,
    totalReports: 0,
    activeEngagements: 0,
    criticalVulns: 0,
    highVulns: 0,
  });
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/stats');
        if (res.ok) {
          const data = await res.json();
          setStats(data);
          setRecentActivity(data.recentActivity ?? []);
          return;
        }
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      }

      setStats((prev) => prev);
      setRecentActivity([]);
      setLoading(false);
    }
    fetchStats();
  }, []);

  const statCards = [
    { label: 'Total Notes', value: stats.totalNotes, icon: FileText, accent: 'text-neutral-400' },
    { label: 'Engagements', value: stats.totalEngagements, icon: Users, accent: 'text-neutral-400' },
    { label: 'Vulnerabilities', value: stats.totalVulnerabilities, icon: Bug, accent: 'text-neutral-400' },
    { label: 'Payloads', value: stats.totalPayloads, icon: Zap, accent: 'text-neutral-400' },
    { label: 'Active Engagements', value: stats.activeEngagements, icon: Activity, accent: 'text-neutral-400' },
    { label: 'Critical Vulns', value: stats.criticalVulns, icon: AlertTriangle, accent: 'text-neutral-400' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Overview of your cybersecurity workspace</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((card) => (
          <Card key={card.label} className="group hover:shadow-card-hover hover:border-border/80 transition-all duration-200">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-foreground/[0.03] border border-border/50 group-hover:bg-foreground/[0.06] transition-colors">
                <card.icon className={`h-5 w-5 ${card.accent}`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{card.label}</p>
                <p className="text-2xl font-bold text-foreground tracking-tight">
                  {loading ? (
                    <span className="inline-block h-7 w-12 animate-pulse rounded bg-muted" />
                  ) : (
                    card.value
                  )}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-12 animate-pulse rounded-lg bg-muted" />
                  ))}
                </div>
              ) : recentActivity.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Activity className="h-8 w-8 text-muted-foreground/50 mb-3" />
                  <p className="text-sm text-muted-foreground">No recent activity</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">Start by creating a note or engagement</p>
                </div>
              ) : (
                <ul className="space-y-2">
                  {recentActivity.map((item) => (
                    <li key={item.id} className="flex items-center justify-between rounded-lg border border-border/50 p-3 hover:bg-foreground/[0.02] transition-colors">
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary" className="capitalize text-[11px]">
                          {item.type}
                        </Badge>
                        <span className="text-sm text-foreground">{item.title}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{item.timestamp}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {quickActions.map((action) => (
                <Button key={action.href} asChild variant="outline" className="w-full justify-start h-10">
                  <Link href={action.href}>
                    <action.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                    {action.label}
                  </Link>
                </Button>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center gap-2 pb-4">
              <Keyboard className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base">Keyboard Shortcuts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {shortcuts.map((s) => (
                <div key={s.description} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{s.description}</span>
                  <div className="flex gap-1">
                    {s.keys.map((k) => (
                      <kbd key={k} className="rounded border border-border bg-muted px-1.5 py-0.5 text-[11px] font-mono text-muted-foreground">
                        {k}
                      </kbd>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
