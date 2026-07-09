import { NextResponse } from 'next/server';
import { get, run } from '@/lib/db';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const payload = await get('SELECT * FROM payloads WHERE id=$1', [id]);
  if (!payload) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(payload);
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  await run(
    `UPDATE payloads SET title=$1, category=$2, content=$3, language=$4, description=$5, updated_at=NOW() WHERE id=$6`,
    [body.title, body.category, body.content, body.language, body.description, id]
  );
  const result = await get('SELECT * FROM payloads WHERE id=$1', [id]);
  return NextResponse.json(result);
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await run('DELETE FROM payloads WHERE id=$1', [id]);
  return NextResponse.json({ success: true });
}
