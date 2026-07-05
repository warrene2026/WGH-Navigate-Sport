import { renderToBuffer } from '@react-pdf/renderer';
import { ReportDocument } from './ReportDocument';

// Shared by both the download route and the email route so the two
// can never render different PDFs from the same report data.
export async function renderReportPdf(data) {
  return renderToBuffer(<ReportDocument data={data} />);
}
