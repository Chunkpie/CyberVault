import { NextResponse } from 'next/server';
import { getAll, get } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search');

  let sql = 'SELECT * FROM cves WHERE 1=1';
  const params: any[] = [];
  if (search) {
    sql += ' AND (cve_id ILIKE $1 OR description ILIKE $1)';
    params.push(`%${search}%`);
  }
  sql += ' ORDER BY created_at DESC';

  const cves = await getAll(sql, params);
  return NextResponse.json(cves);
}

export async function POST(request: Request) {
  const body = await request.json();
  const result = await get(
    'INSERT INTO cves (cve_id, description, severity, cvss, affected, notes) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
    [body.cve_id, body.description || '', body.severity || 'medium', body.cvss || 0, body.affected || '', body.notes || '']
  );
  return NextResponse.json(result);
}
