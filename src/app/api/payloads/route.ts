import { NextResponse } from 'next/server';
import { getAll, get } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search');
  const category = searchParams.get('category');

  let sql = 'SELECT * FROM payloads WHERE 1=1';
  const params: any[] = [];
  let idx = 1;

  if (search) {
    sql += ` AND (title ILIKE $${idx} OR content ILIKE $${idx})`;
    params.push(`%${search}%`);
    idx++;
  }
  if (category && category !== 'all') {
    sql += ` AND category = $${idx}`;
    params.push(category);
    idx++;
  }
  sql += ' ORDER BY updated_at DESC';

  const payloads = await getAll(sql, params);
  return NextResponse.json(payloads);
}

export async function POST(request: Request) {
  const body = await request.json();
  const result = await get(
    'INSERT INTO payloads (title, category, content, language, description) VALUES ($1,$2,$3,$4,$5) RETURNING *',
    [body.title, body.category || 'custom', body.content || '', body.language || 'text', body.description || '']
  );
  return NextResponse.json(result);
}
