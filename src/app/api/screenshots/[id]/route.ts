import { NextResponse } from 'next/server';
import { get, run } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const screenshot = await get('SELECT * FROM screenshots WHERE id = $1', [id]);
  if (!screenshot) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return NextResponse.json(screenshot);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await run('DELETE FROM screenshots WHERE id = $1', [id]);
  return NextResponse.json({ success: true });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const fields: string[] = [];
  const values: any[] = [];
  let idx = 1;

  if (body.notes !== undefined) {
    fields.push(`notes = $${idx}`);
    values.push(body.notes);
    idx++;
  }
  if (body.tags !== undefined) {
    fields.push(`tags = $${idx}`);
    values.push(JSON.stringify(body.tags));
    idx++;
  }

  if (fields.length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
  }

  values.push(id);
  const screenshot = await get(
    `UPDATE screenshots SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
    values
  );
  return NextResponse.json(screenshot);
}
