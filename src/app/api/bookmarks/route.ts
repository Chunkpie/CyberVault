import { NextResponse } from 'next/server';
import { getAll, get } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search');

  let sql = 'SELECT * FROM bookmarks WHERE 1=1';
  const params: any[] = [];
  if (search) {
    sql += ' AND (title ILIKE $1 OR url ILIKE $1 OR description ILIKE $1)';
    params.push(`%${search}%`);
  }
  sql += ' ORDER BY created_at DESC';

  const bookmarks = await getAll(sql, params);
  return NextResponse.json(bookmarks);
}

export async function POST(request: Request) {
  const body = await request.json();
  const result = await get(
    'INSERT INTO bookmarks (title, url, description, tags) VALUES ($1,$2,$3,$4) RETURNING *',
    [body.title || body.url, body.url, body.description || '', JSON.stringify(body.tags || [])]
  );
  return NextResponse.json(result);
}
