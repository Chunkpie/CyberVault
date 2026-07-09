import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function timeAgo(date: string | Date): string {
  const now = new Date();
  const d = new Date(date);
  const seconds = Math.floor((now.getTime() - d.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return formatDate(date);
}

export function getSeverityColor(severity: string): string {
  switch (severity) {
    case 'critical': return 'text-red-500 bg-red-500/10';
    case 'high': return 'text-orange-500 bg-orange-500/10';
    case 'medium': return 'text-yellow-500 bg-yellow-500/10';
    case 'low': return 'text-blue-500 bg-blue-500/10';
    case 'info': return 'text-cyan-500 bg-cyan-500/10';
    default: return 'text-slate-500 bg-slate-500/10';
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'active': return 'text-green-500 bg-green-500/10';
    case 'completed': return 'text-blue-500 bg-blue-500/10';
    case 'archived': return 'text-slate-500 bg-slate-500/10';
    case 'open': return 'text-yellow-500 bg-yellow-500/10';
    case 'confirmed': return 'text-orange-500 bg-orange-500/10';
    case 'fixed': return 'text-green-500 bg-green-500/10';
    case 'false-positive': return 'text-slate-500 bg-slate-500/10';
    case 'draft': return 'text-yellow-500 bg-yellow-500/10';
    case 'final': return 'text-green-500 bg-green-500/10';
    default: return 'text-slate-500 bg-slate-500/10';
  }
}
