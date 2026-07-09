import { NextResponse } from 'next/server';
import { getAll, get } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search');
  const category = searchParams.get('category');

  let sql = 'SELECT * FROM tools WHERE 1=1';
  const params: any[] = [];
  let idx = 1;
  if (search) {
    sql += ` AND (name ILIKE $${idx} OR command ILIKE $${idx})`;
    params.push(`%${search}%`);
    idx++;
  }
  if (category && category !== 'all') {
    sql += ` AND category = $${idx}`;
    params.push(category);
    idx++;
  }
  sql += ' ORDER BY name';

  const tools = await getAll(sql, params);
  return NextResponse.json(tools);
}

export async function POST(request: Request) {
  const body = await request.json();
  const result = await get(
    'INSERT INTO tools (name, command, description, category) VALUES ($1,$2,$3,$4) RETURNING *',
    [body.name, body.command || '', body.description || '', body.category || 'recon']
  );
  return NextResponse.json(result);
}
