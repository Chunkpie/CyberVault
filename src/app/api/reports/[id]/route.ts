import { NextResponse } from 'next/server';
import { get, run } from '@/lib/db';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const report = await get('SELECT * FROM reports WHERE id=$1', [id]);
  if (!report) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(report);
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  await run(
    `UPDATE reports SET title=$1, content=$2, status=$3, type=$4, updated_at=NOW() WHERE id=$5`,
    [body.title, body.content, body.status, body.type, id]
  );
  const result = await get('SELECT * FROM reports WHERE id=$1', [id]);
  return NextResponse.json(result);
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await run('DELETE FROM reports WHERE id=$1', [id]);
  return NextResponse.json({ success: true });
}
