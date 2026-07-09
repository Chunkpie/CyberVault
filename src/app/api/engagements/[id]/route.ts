import { NextResponse } from 'next/server';
import { get, run, getAll } from '@/lib/db';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const engagement = await get('SELECT * FROM engagements WHERE id=$1', [id]);
  if (!engagement) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const vulns = await getAll('SELECT * FROM vulnerabilities WHERE engagement_id=$1', [id]);
  return NextResponse.json({ ...engagement, vulnerabilities: vulns });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const fields: string[] = [];
  const values: any[] = [];
  let idx = 1;

  const columnMap: Record<string, string> = {
    name: 'name', client: 'client', scope: 'scope', status: 'status',
    notes: 'notes', start_date: 'start_date', end_date: 'end_date',
  };

  for (const [key, value] of Object.entries(body)) {
    if (key === 'targets' || key === 'checklist') {
      fields.push(`${key}=$${idx}`);
      values.push(JSON.stringify(value || []));
    } else if (columnMap[key]) {
      fields.push(`${columnMap[key]}=$${idx}`);
      values.push(value);
    }
    idx++;
  }

  if (fields.length === 0) {
    const result = await get('SELECT * FROM engagements WHERE id=$1', [id]);
    return NextResponse.json(result);
  }

  fields.push(`updated_at=NOW()`);
  values.push(id);

  await run(`UPDATE engagements SET ${fields.join(', ')} WHERE id=$${idx}`, values);
  const result = await get('SELECT * FROM engagements WHERE id=$1', [id]);
  return NextResponse.json(result);
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await run('DELETE FROM engagements WHERE id=$1', [id]);
  return NextResponse.json({ success: true });
}
