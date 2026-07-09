export interface Note {
  id: string;
  title: string;
  content: string;
  folder: string;
  tags: string[];
  pinned: boolean;
  starred: boolean;
  created_at: string;
  updated_at: string;
}

export interface Engagement {
  id: string;
  name: string;
  client: string;
  scope: string;
  status: 'active' | 'completed' | 'archived';
  start_date: string;
  end_date: string;
  targets: string[];
  notes: string;
  vulnerabilities?: Vulnerability[];
  created_at: string;
  updated_at: string;
}

export interface Vulnerability {
  id: string;
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  cvss: number;
  cwe: string;
  owasp: string;
  description: string;
  impact: string;
  poc: string;
  references: string[];
  payloads: string[];
  fix: string;
  evidence: string;
  status: 'open' | 'confirmed' | 'fixed' | 'false-positive';
  tags: string[];
  engagement_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Payload {
  id: string;
  title: string;
  category: string;
  content: string;
  language: string;
  tags: string[];
  description: string;
  created_at: string;
  updated_at: string;
}

export interface ReconData {
  id: string;
  engagement_id: string;
  engagement_name?: string;
  type: string;
  value: string;
  metadata: string;
  notes: string;
  created_at: string;
}

export interface Report {
  id: string;
  title: string;
  engagement_id?: string;
  engagement_name?: string;
  type: string;
  content: string;
  status: 'draft' | 'final';
  created_at: string;
  updated_at: string;
}

export interface CVE {
  id: string;
  cve_id: string;
  description: string;
  severity: string;
  cvss: number;
  affected: string;
  published: string;
  references: string[];
  notes: string;
  created_at: string;
}

export interface Bookmark {
  id: string;
  title: string;
  url: string;
  description: string;
  tags: string[];
  created_at: string;
}

export interface Tool {
  id: string;
  name: string;
  command: string;
  description: string;
  category: string;
  tags: string[];
  created_at: string;
}

export interface Checklist {
  id: string;
  title: string;
  items: ChecklistItem[];
  category: string;
  created_at: string;
  updated_at: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
}

export interface Template {
  id: string;
  name: string;
  icon: string;
  content: string;
  type: string;
  category: string;
}

export interface Screenshot {
  id: string;
  filename: string;
  original_name: string;
  path: string;
  notes: string;
  tags: string[];
  engagement_id?: string;
  created_at: string;
}
