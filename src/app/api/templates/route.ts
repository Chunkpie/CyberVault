import { NextResponse } from 'next/server';
import { getAll, get } from '@/lib/db';

export async function GET() {
  const templates = await getAll('SELECT * FROM templates ORDER BY category, name');
  return NextResponse.json(templates);
}

export async function POST(request: Request) {
  const body = await request.json();
  const result = await get(
    'INSERT INTO templates (id, name, icon, content, type, category) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
    [body.id || crypto.randomUUID(), body.name, body.icon || '📄', body.content || '', body.type || 'note', body.category || 'general']
  );
  return NextResponse.json(result);
}
