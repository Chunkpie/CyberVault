import { NextResponse } from 'next/server';
import { getAll, get } from '@/lib/db';

export async function GET() {
  const engagements = await getAll('SELECT * FROM engagements ORDER BY updated_at DESC');
  return NextResponse.json(engagements);
}

export async function POST(request: Request) {
  const body = await request.json();
  const result = await get(
    'INSERT INTO engagements (name, client, scope, status) VALUES ($1, $2, $3, $4) RETURNING *',
    [body.name || 'New Engagement', body.client || '', body.scope || '', body.status || 'active']
  );
  return NextResponse.json(result);
}
