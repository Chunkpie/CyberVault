const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://cybervault:cybervault_secret_2024@localhost:5432/cybervault',
});

const schema = `
CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL DEFAULT 'Untitled',
  content TEXT DEFAULT '',
  folder TEXT DEFAULT 'default',
  tags JSONB DEFAULT '[]',
  pinned BOOLEAN DEFAULT false,
  starred BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS engagements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  client TEXT DEFAULT '',
  scope TEXT DEFAULT '',
  status TEXT DEFAULT 'active',
  start_date TEXT DEFAULT '',
  end_date TEXT DEFAULT '',
  targets JSONB DEFAULT '[]',
  checklist JSONB DEFAULT '[]',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vulnerabilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  severity TEXT DEFAULT 'medium',
  cvss NUMERIC(3,1) DEFAULT 0,
  cwe TEXT DEFAULT '',
  owasp TEXT DEFAULT '',
  description TEXT DEFAULT '',
  impact TEXT DEFAULT '',
  poc TEXT DEFAULT '',
  "references" JSONB DEFAULT '[]',
  payloads JSONB DEFAULT '[]',
  fix TEXT DEFAULT '',
  evidence TEXT DEFAULT '',
  status TEXT DEFAULT 'open',
  tags JSONB DEFAULT '[]',
  engagement_id UUID REFERENCES engagements(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT DEFAULT 'custom',
  content TEXT DEFAULT '',
  language TEXT DEFAULT 'text',
  tags JSONB DEFAULT '[]',
  description TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS recon (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  engagement_id UUID REFERENCES engagements(id) ON DELETE CASCADE,
  type TEXT DEFAULT 'subdomain',
  value TEXT NOT NULL,
  metadata TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  engagement_id UUID REFERENCES engagements(id) ON DELETE SET NULL,
  type TEXT DEFAULT 'pentest',
  content TEXT DEFAULT '',
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cve_id TEXT NOT NULL,
  description TEXT DEFAULT '',
  severity TEXT DEFAULT 'medium',
  cvss NUMERIC(3,1) DEFAULT 0,
  affected TEXT DEFAULT '',
  published TEXT DEFAULT '',
  "references" JSONB DEFAULT '[]',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT DEFAULT '',
  tags JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  command TEXT DEFAULT '',
  description TEXT DEFAULT '',
  category TEXT DEFAULT 'recon',
  tags JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS checklists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  items JSONB DEFAULT '[]',
  category TEXT DEFAULT 'general',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS screenshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename TEXT NOT NULL,
  original_name TEXT NOT NULL,
  path TEXT NOT NULL,
  notes TEXT DEFAULT '',
  tags JSONB DEFAULT '[]',
  engagement_id UUID REFERENCES engagements(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT DEFAULT '📄',
  content TEXT DEFAULT '',
  type TEXT DEFAULT 'note',
  category TEXT DEFAULT 'general'
);
`;

const templates = [
  ['tpl-bb', 'Bug Bounty Report', '🐛', '# Bug Bounty Report\n\n## Summary\n**Title:** \n**Severity:** \n**CVSS:** \n**Affected:** \n\n## Vulnerability\n\n### Description\n\n### Steps to Reproduce\n1. \n2. \n\n### Impact\n\n### Remediation\n\n## PoC\n```\n```', 'report', 'bug-bounty'],
  ['tpl-pt', 'Penetration Test Report', '🎯', '# Pentest Report\n\n## Executive Summary\n**Client:** \n**Date:** \n**Scope:** \n\n## Findings\n### Critical\n### High\n### Medium\n### Low\n\n## Recommendations', 'report', 'pentest'],
  ['tpl-rc', 'Recon Checklist', '🔍', '- [ ] Subdomain enumeration\n- [ ] Port scanning\n- [ ] Technology fingerprinting\n- [ ] Directory bruteforce\n- [ ] Parameter discovery\n- [ ] Screenshot harvesting\n- [ ] Wayback machine lookup\n- [ ] JS file analysis', 'checklist', 'recon'],
  ['tpl-rt', 'Red Team Checklist', '🏴', '- [ ] OSINT gathering\n- [ ] Phishing setup\n- [ ] Initial foothold\n- [ ] C2 setup\n- [ ] Lateral movement\n- [ ] Privilege escalation\n- [ ] Data exfiltration', 'checklist', 'red-team'],
  ['tpl-wp', 'Web Pentest Methodology', '🌐', '- [ ] Technology stack identification\n- [ ] Subdomain enumeration\n- [ ] Spider/crawl application\n- [ ] Authentication bypass\n- [ ] Injection testing\n- [ ] Business logic flaws\n- [ ] API testing', 'checklist', 'web'],
  ['tpl-api', 'API Pentest Methodology', '🔌', '- [ ] API endpoint enumeration\n- [ ] Auth mechanism testing\n- [ ] IDOR testing\n- [ ] Parameter tampering\n- [ ] Mass assignment\n- [ ] Rate limiting', 'checklist', 'api'],
  ['tpl-ad', 'AD Pentest Methodology', '🏢', '- [ ] Domain enumeration\n- [ ] Kerberoasting\n- [ ] AS-REP Roasting\n- [ ] Pass-the-Hash\n- [ ] Token impersonation\n- [ ] LAPS exploitation\n- [ ] ACL abuse', 'checklist', 'active-directory'],
  ['tpl-tm', 'Threat Model', '🕵️', '# Threat Model\n\n## Assets\n\n## Threat Actors\n\n## Attack Vectors\n\n## Controls\n\n## Risk Assessment', 'note', 'threat-intel'],
  ['tpl-dj', 'Daily Journal', '📔', '# Daily Journal\n\n## Tasks\n\n## Notes\n\n## Learnings\n\n## Tomorrow', 'note', 'journal'],
  ['tpl-mn', 'Meeting Notes', '📋', '# Meeting Notes\n**Date:** \n**Attendees:** \n\n## Agenda\n\n## Discussion\n\n## Action Items\n- [ ] \n\n## Follow-up', 'note', 'meetings'],
  ['tpl-osint', 'OSINT Checklist', '🕵️', '- [ ] Name discovery\n- [ ] Social media profiles\n- [ ] Email addresses\n- [ ] Domain information\n- [ ] IP addresses\n- [ ] DNS records\n- [ ] WHOIS data\n- [ ] Certificate transparency', 'checklist', 'osint'],
];

async function initDB() {
  const client = await pool.connect();
  try {
    await client.query(schema);
    // Add migration for notes.meta if not present
    await client.query(`ALTER TABLE notes ADD COLUMN IF NOT EXISTS meta JSONB DEFAULT '{}'`);
    for (const t of templates) {
      await client.query(
        'INSERT INTO templates (id, name, icon, content, type, category) VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT (id) DO NOTHING',
        t
      );
    }
    console.log('Database initialized successfully');
  } finally {
    client.release();
  }
  await pool.end();
}

initDB().catch(console.error);
