import { NextResponse } from 'next/server';
import { getAll, get } from '@/lib/db';

export async function GET() {
  const reports = await getAll(`
    SELECT r.*, e.name as engagement_name 
    FROM reports r 
    LEFT JOIN engagements e ON r.engagement_id = e.id 
    ORDER BY r.updated_at DESC
  `);
  return NextResponse.json(reports);
}

export async function POST(request: Request) {
  const body = await request.json();
  const result = await get(
    'INSERT INTO reports (title, engagement_id, type, content) VALUES ($1,$2,$3,$4) RETURNING *',
    [body.title || 'New Report', body.engagement_id || null, body.type || 'pentest', body.content || '']
  );
  return NextResponse.json(result);
}
