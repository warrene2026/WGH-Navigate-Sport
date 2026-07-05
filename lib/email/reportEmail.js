import { getResendClient } from './resend';

export async function sendReportEmail({ to, reportData, pdfBuffer }) {
  const resend = getResendClient();
  const fromAddress = process.env.RESEND_FROM_EMAIL || 'Navigate YS <onboarding@resend.dev>';

  const { error } = await resend.emails.send({
    from: fromAddress,
    to,
    subject: 'Your Navigate YS report',
    html: `
      <div style="font-family: sans-serif; color: #1A1A1A;">
        <p>Hi ${reportData.athleteName},</p>
        <p>Your Navigate YS report is attached as a PDF.</p>
        <p style="color: #5A5A56; font-size: 13px;">— We Guide Heroes</p>
      </div>
    `,
    attachments: [
      {
        filename: 'navigate-ys-report.pdf',
        content: pdfBuffer,
      },
    ],
  });

  if (error) {
    throw new Error(error.message || 'Failed to send email.');
  }
}
