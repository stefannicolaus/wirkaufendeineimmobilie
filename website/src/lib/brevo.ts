// src/lib/brevo.ts
// Brevo transactional email helper with PDF attachment support

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

  const unsubscribeFooter = `<div style="margin-top:2rem;padding-top:1rem;border-top:1px solid #e5e7eb;font-size:12px;color:#9ca3af;font-family:system-ui,sans-serif;line-height:1.5"><p style="margin:0 0 4px">wirkaufendeineimmobilie.de — Joachim Kleinke<br>Diese E-Mail wurde durch Ihre Anfrage auf unserer Website ausgelöst.</p><p style="margin:0">Keine weiteren E-Mails? <a href="mailto:datenschutz@wirkaufendeineimmobilie.de" style="color:#9ca3af">datenschutz@wirkaufendeineimmobilie.de</a></p></div>`;

  const body: Record<string, unknown> = {
    sender: {
      name: 'Joachim Kleinke — wirkaufendeineimmobilie',
      email: 'office@wirkaufendeineimmobilie.de',
    },
    to: [{ email: opts.to.email, name: opts.to.name }],
    replyTo: { email: opts.replyTo ?? 'office@wirkaufendeineimmobilie.de' },
    headers: {
      'List-Unsubscribe': '<mailto:datenschutz@wirkaufendeineimmobilie.de?subject=Abmeldung>',
    },
    ...(opts.subject ? { subject: opts.subject } : {}),
    ...(opts.htmlContent ? { htmlContent: opts.htmlContent + unsubscribeFooter } : {}),
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
