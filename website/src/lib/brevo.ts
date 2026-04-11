// src/lib/brevo.ts
// Brevo transactional email helper with PDF attachment support

import { unsubscribeToken } from './unsubscribe-token';

const SITE_URL = process.env.SITE_URL || 'https://wirkaufendeineimmobilie.de';

export interface BrevoAttachment {
  content: string; // base64 encoded
  name: string;
}

export async function sendTransactionalEmail(opts: {
  to: { email: string; name?: string };
  subject?: string; // optional when using templateId (Brevo uses the template's own subject)
  htmlContent?: string;
  templateId?: number;
  params?: Record<string, string>;
  attachments?: BrevoAttachment[];
  replyTo?: string;
}) {
  // use process.env for SSR runtime (import.meta.env is replaced at build time by Vite)
  const apiKey = process.env.BREVO_API_KEY || import.meta.env.BREVO_API_KEY;
  if (!apiKey) throw new Error('BREVO_API_KEY not configured');

  const signature = `<div style="margin-top:2rem;padding-top:1.5rem;border-top:2px solid #f3f4f6;font-family:system-ui,sans-serif"><table cellpadding="0" cellspacing="0" border="0"><tr><td style="padding-right:14px;vertical-align:middle"><img src="https://wirkaufendeineimmobilie.de/images/joachim-kleinke-portrait.jpg" alt="Joachim Kleinke" width="56" height="56" style="border-radius:50%;display:block;object-fit:cover" /></td><td style="vertical-align:middle"><p style="margin:0;font-size:15px;font-weight:600;color:#111827">Joachim Kleinke</p><p style="margin:2px 0 0;font-size:13px;color:#6b7280">Immobilienprofi · Handel &amp; Consulting</p><p style="margin:4px 0 0;font-size:13px"><a href="https://wirkaufendeineimmobilie.de" style="color:#1d4ed8;text-decoration:none">wirkaufendeineimmobilie.de</a></p></td></tr></table></div>`;

  const unsubscribeUrl = `${SITE_URL}/api/unsubscribe?email=${encodeURIComponent(opts.to.email)}&token=${unsubscribeToken(opts.to.email)}`;
  const unsubscribeFooter = `<div style="margin-top:1.5rem;padding-top:1rem;border-top:1px solid #e5e7eb;font-size:12px;color:#9ca3af;font-family:system-ui,sans-serif;line-height:1.5"><p style="margin:0 0 4px">Diese E-Mail wurde durch Ihre Anfrage auf unserer Website ausgelöst.</p><p style="margin:0"><a href="${unsubscribeUrl}" style="color:#9ca3af">Keine weiteren E-Mails — jetzt abmelden</a></p></div>`;

  const body: Record<string, unknown> = {
    sender: {
      name: 'Joachim Kleinke — wirkaufendeineimmobilie',
      email: 'office@wirkaufendeineimmobilie.de',
    },
    to: [{ email: opts.to.email, name: opts.to.name }],
    replyTo: { email: opts.replyTo ?? 'office@wirkaufendeineimmobilie.de' },
    headers: {
      'List-Unsubscribe': `<${unsubscribeUrl}>`,
      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
    },
    ...(opts.subject ? { subject: opts.subject } : {}),
    ...(opts.htmlContent ? { htmlContent: `<div style="font-family:system-ui,-apple-system,sans-serif;max-width:600px;color:#111827;line-height:1.6;text-align:left">` + opts.htmlContent + signature + unsubscribeFooter + `</div>` } : {}),
    ...(opts.templateId ? { templateId: opts.templateId } : {}),
    ...(opts.params ? { params: opts.params } : {}),
    ...(opts.attachments?.length ? { attachment: opts.attachments } : {}),
  };

  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Brevo API error ${res.status}: ${err}`);
  }

  return await res.json();
}

export async function sendInternalEmail(opts: {
  subject: string;
  htmlContent: string;
  to?: string;
}) {
  const apiKey = process.env.BREVO_API_KEY || import.meta.env.BREVO_API_KEY;
  if (!apiKey) throw new Error('BREVO_API_KEY not configured');

  const body = {
    sender: {
      name: 'WKDI Formular-Benachrichtigung',
      email: 'office@wirkaufendeineimmobilie.de',
    },
    to: [{ email: opts.to ?? 'office@wirkaufendeineimmobilie.de' }],
    subject: opts.subject,
    htmlContent: `<div style="font-family:system-ui,sans-serif;max-width:600px;color:#111827;line-height:1.6">${opts.htmlContent}</div>`,
  };

  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Brevo API error ${res.status}: ${err}`);
  }

  return await res.json();
}
