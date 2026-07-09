import { NextResponse } from 'next/server';
import { getAll, get } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search');
  const severity = searchParams.get('severity');

  let sql = 'SELECT * FROM vulnerabilities WHERE 1=1';
  const params: any[] = [];
  let idx = 1;

  if (search) {
    sql += ` AND (title ILIKE $${idx} OR description ILIKE $${idx})`;
    params.push(`%${search}%`);
    idx++;
  }
  if (severity) {
    sql += ` AND severity = $${idx}`;
    params.push(severity);
    idx++;
  }
  sql += ' ORDER BY CASE severity WHEN \'critical\' THEN 1 WHEN \'high\' THEN 2 WHEN \'medium\' THEN 3 WHEN \'low\' THEN 4 ELSE 5 END, updated_at DESC';

  const vulns = await getAll(sql, params);
  return NextResponse.json(vulns);
}

export async function POST(request: Request) {
  const body = await request.json();
  const result = await get(
    'INSERT INTO vulnerabilities (title, severity, cvss, cwe, owasp, description, impact, poc, fix, evidence, status, engagement_id) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *',
    [body.title, body.severity || 'medium', body.cvss || 0, body.cwe || '', body.owasp || '', body.description || '', body.impact || '', body.poc || '', body.fix || '', body.evidence || '', body.status || 'open', body.engagement_id || null]
  );
  return NextResponse.json(result);
}
