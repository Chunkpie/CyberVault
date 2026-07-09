import { NextResponse } from 'next/server';
import { get, run } from '@/lib/db';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const note = await get('SELECT * FROM notes WHERE id = $1', [id]);
  if (!note) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(note);
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();

  const fields: string[] = [];
  const values: any[] = [];
  let idx = 1;

  for (const [key, value] of Object.entries(body)) {
    const dbKey = key === 'tags' ? 'tags' : key;
    if (key === 'tags' || key === 'meta') {
      fields.push(`${dbKey}=$${idx}`);
      values.push(JSON.stringify(value || (key === 'tags' ? [] : {})));
    } else {
      fields.push(`${dbKey}=$${idx}`);
      values.push(value);
    }
    idx++;
  }

  if (fields.length === 0) {
    const note = await get('SELECT * FROM notes WHERE id=$1', [id]);
    return NextResponse.json(note);
  }

  fields.push(`updated_at=NOW()`);
  values.push(id);

  await run(`UPDATE notes SET ${fields.join(', ')} WHERE id=$${idx}`, values);
  const note = await get('SELECT * FROM notes WHERE id=$1', [id]);
  return NextResponse.json(note);
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await run('DELETE FROM notes WHERE id=$1', [id]);
  return NextResponse.json({ success: true });
}
