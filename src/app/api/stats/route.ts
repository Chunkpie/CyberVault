import { NextResponse } from 'next/server';
import { get, getAll } from '@/lib/db';

export async function GET() {
  const [notes, engagements, vulns, payloads, reports] = await Promise.all([
    get('SELECT COUNT(*)::int as count FROM notes'),
    get('SELECT COUNT(*)::int as count FROM engagements'),
    get('SELECT COUNT(*)::int as count FROM vulnerabilities'),
    get('SELECT COUNT(*)::int as count FROM payloads'),
    get('SELECT COUNT(*)::int as count FROM reports'),
  ]);

  const activeEng = await get("SELECT COUNT(*)::int as count FROM engagements WHERE status='active'");
  const criticalVulns = await get("SELECT COUNT(*)::int as count FROM vulnerabilities WHERE severity='critical'");
  const highVulns = await get("SELECT COUNT(*)::int as count FROM vulnerabilities WHERE severity='high'");

  const recentActivity = await getAll(`
    SELECT 'note' as type, title, updated_at as timestamp FROM notes
    UNION ALL
    SELECT 'engagement' as type, name as title, updated_at as timestamp FROM engagements
    UNION ALL
    SELECT 'vulnerability' as type, title, updated_at as timestamp FROM vulnerabilities
    ORDER BY timestamp DESC LIMIT 10
  `);

  return NextResponse.json({
    totalNotes: notes?.count || 0,
    totalEngagements: engagements?.count || 0,
    totalVulnerabilities: vulns?.count || 0,
    totalPayloads: payloads?.count || 0,
    totalReports: reports?.count || 0,
    activeEngagements: activeEng?.count || 0,
    criticalVulns: criticalVulns?.count || 0,
    highVulns: highVulns?.count || 0,
    recentActivity,
  });
}
