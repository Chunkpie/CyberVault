import { NextResponse } from 'next/server';
import { getAll, get } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const engagementId = searchParams.get('engagement_id');
  const type = searchParams.get('type');
  const search = searchParams.get('search');

  let sql = 'SELECT r.*, e.name as engagement_name FROM recon r LEFT JOIN engagements e ON r.engagement_id = e.id WHERE 1=1';
  const params: any[] = [];
  let idx = 1;

  if (engagementId) {
    sql += ` AND r.engagement_id = $${idx}`;
    params.push(engagementId);
    idx++;
  }
  if (type) {
    sql += ` AND r.type = $${idx}`;
    params.push(type);
    idx++;
  }
  if (search) {
    sql += ` AND (r.value ILIKE $${idx} OR r.notes ILIKE $${idx})`;
    params.push(`%${search}%`);
    idx++;
  }
  sql += ' ORDER BY r.created_at DESC';

  const data = await getAll(sql, params);
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const body = await request.json();
  const result = await get(
    'INSERT INTO recon (engagement_id, type, value, notes) VALUES ($1,$2,$3,$4) RETURNING *',
    [body.engagement_id, body.type || 'subdomain', body.value, body.notes || '']
  );
  return NextResponse.json(result);
}
