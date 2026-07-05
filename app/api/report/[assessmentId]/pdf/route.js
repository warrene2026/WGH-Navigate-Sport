import { NextResponse } from 'next/server';
import { buildReportData } from '@/lib/assessment/reportData';
import { renderReportPdf } from '@/lib/pdf/renderReportPdf';
import { loadAssessmentForViewing } from '@/lib/assessment/authorize';

// react-pdf needs Node APIs — must not run on the Edge runtime.
export const runtime = 'nodejs';

export async function GET(request, { params }) {
  const { assessmentId } = await params;
  const result = await loadAssessmentForViewing(assessmentId);

  if (!result.authorized) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  const reportData = buildReportData(result);
  const buffer = await renderReportPdf(reportData);

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="navigate-ys-report.pdf"',
    },
  });
}
