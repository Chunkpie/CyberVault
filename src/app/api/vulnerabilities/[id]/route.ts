import { NextResponse } from 'next/server';
import { get, run } from '@/lib/db';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const vuln = await get('SELECT * FROM vulnerabilities WHERE id=$1', [id]);
  if (!vuln) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(vuln);
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  await run(
    `UPDATE vulnerabilities SET title=$1, severity=$2, cvss=$3, cwe=$4, owasp=$5, description=$6, impact=$7, poc=$8, fix=$9, evidence=$10, status=$11, "references"=$12, updated_at=NOW() WHERE id=$13`,
    [body.title, body.severity, body.cvss, body.cwe, body.owasp, body.description, body.impact, body.poc, body.fix, body.evidence, body.status, JSON.stringify(body.references || []), id]
  );
  const result = await get('SELECT * FROM vulnerabilities WHERE id=$1', [id]);
  return NextResponse.json(result);
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await run('DELETE FROM vulnerabilities WHERE id=$1', [id]);
  return NextResponse.json({ success: true });
}
