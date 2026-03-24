// src/pages/api/confirm-report.ts
// GET endpoint — called by Brevo DOI redirect for ROI/KA calculator leads
// Retrieves stored PDF from SQLite and sends it via Brevo

import type { APIRoute } from 'astro';
import { findRegistrationByRef, confirmRegistrationByRef, findKapitalanlegerByRef, confirmKapitalanlegerByRef } from '../../lib/db';
import { sendTransactionalEmail } from '../../lib/brevo';

export const prerender = false;

const NOTIFY_EMAIL = process.env.NOTIFY_EMAIL || 'office@wirkaufendeineimmobilie.de';

export const GET: APIRoute = async ({ url }) => {
  const ref = url.searchParams.get('ref');

  if (!ref) {
    return Response.redirect(new URL('/danke?typ=doi-fehler', url.origin), 302);
  }

  // Determine record type by prefix
  const isKA = ref.startsWith('KA-');
  const record = isKA ? findKapitalanlegerByRef(ref) : findRegistrationByRef(ref);

  if (!record) {
    return Response.redirect(new URL('/danke?typ=doi-fehler', url.origin), 302);
  }

  // already confirmed — idempotent, don't re-send PDF
  if (record.doi_confirmed) {
    return Response.redirect(new URL('/danke?typ=report-versendet', url.origin), 302);
  }

  const pdfBase64 = record.pdf_base64 as string | undefined;
  if (!pdfBase64) {
    // PDF not stored — fallback to doi-fehler (should not happen)
    return Response.redirect(new URL('/danke?typ=doi-fehler', url.origin), 302);
  }

  const vorname = (record.vorname as string) || (record.name as string) || 'Interessent';
  const email = record.email as string;
  const refNr = ref;

  const pdfName = isKA ? `KA-Analyse-${refNr}.pdf` : `ROI-Analyse-${refNr}.pdf`;
  const subject = isKA
    ? `Deine Kapitalanleger-Analyse — Ref ${refNr}`
    : `Deine persönliche Deal-Analyse — Ref ${refNr}`;

  // Mark confirmed FIRST — idempotency guard fires on any retry regardless of email outcome
  if (isKA) {
    confirmKapitalanlegerByRef(ref);
  } else {
    confirmRegistrationByRef(ref);
  }

  try {
    // Send PDF to user
    await sendTransactionalEmail({
      to: { email, name: vorname },
      subject,
      htmlContent: `<p>Hallo ${vorname},</p>
<p>anbei deine persönliche Analyse mit der Referenznummer <strong>${refNr}</strong>.</p>
<p>Das PDF enthält deine vollständige Kalkulation und nächste Empfehlungen.</p>
<p>Bei Fragen: office@wirkaufendeineimmobilie.de</p>
<br><p>Beste Grüße,<br>Joachim Kleinke</p>`,
      attachments: [{ content: pdfBase64, name: pdfName }],
    });

    // Notify Joachim
    await sendTransactionalEmail({
      to: { email: NOTIFY_EMAIL, name: 'Joachim Kleinke' },
      subject: `DOI bestätigt + Report gesendet: ${vorname} — ${refNr}`,
      htmlContent: `<p>DOI bestätigt. Report wurde an ${email} gesendet.</p><p>Ref: ${refNr}</p>`,
    });
  } catch {
    // email failure must not block the redirect — Joachim can follow up manually via ref in DB
  }

  return Response.redirect(new URL('/danke?typ=report-versendet', url.origin), 302);
};
