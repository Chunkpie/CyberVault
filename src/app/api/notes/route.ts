import { NextResponse } from 'next/server';
import { getAll, get, run } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search');
  const type = searchParams.get('type');
  const folder = searchParams.get('folder');

  let sql = 'SELECT * FROM notes WHERE 1=1';
  const params: any[] = [];
  let idx = 1;

  if (search) {
    sql += ` AND (title ILIKE $${idx} OR content ILIKE $${idx})`;
    params.push(`%${search}%`);
    idx++;
  }
  if (folder) {
    sql += ` AND folder = $${idx}`;
    params.push(folder);
    idx++;
  }
  sql += ' ORDER BY pinned DESC, updated_at DESC';

  const notes = await getAll(sql, params);
  return NextResponse.json(notes);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { title, content, folder, tags } = body;
  const meta = body.meta || {};

  const result = await get(
    'INSERT INTO notes (title, content, folder, tags, meta) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [title || 'Untitled', content || '', folder || 'default', JSON.stringify(tags || []), JSON.stringify(meta)]
  );
  return NextResponse.json(result);
}
