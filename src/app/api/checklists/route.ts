import { NextResponse } from 'next/server';
import { getAll, get } from '@/lib/db';

export async function GET() {
  const checklists = await getAll('SELECT * FROM checklists ORDER BY updated_at DESC');
  return NextResponse.json(checklists);
}

export async function POST(request: Request) {
  const body = await request.json();
  const result = await get(
    'INSERT INTO checklists (title, items, category) VALUES ($1,$2,$3) RETURNING *',
    [body.title || 'New Checklist', JSON.stringify(body.items || []), body.category || 'general']
  );
  return NextResponse.json(result);
}
