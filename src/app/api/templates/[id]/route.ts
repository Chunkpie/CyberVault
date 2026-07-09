import { NextResponse } from 'next/server';
import { run } from '@/lib/db';

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await run('DELETE FROM templates WHERE id=$1', [id]);
  return NextResponse.json({ success: true });
}
