import { NextResponse } from 'next/server';
import { getAll, get } from '@/lib/db';

export async function GET() {
  const screenshots = await getAll('SELECT * FROM screenshots ORDER BY created_at DESC');
  return NextResponse.json(screenshots);
}

export async function POST(request: Request) {
  const body = await request.json();
  const result = await get(
    'INSERT INTO screenshots (filename, original_name, path, notes, tags, engagement_id) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
    [body.filename || 'screenshot.png', body.filename || 'screenshot.png', body.data || '', body.notes || '', JSON.stringify(body.tags || []), body.engagement_id || null]
  );
  return NextResponse.json(result);
}
