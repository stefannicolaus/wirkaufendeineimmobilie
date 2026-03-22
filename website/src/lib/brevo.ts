// src/lib/brevo.ts
// Brevo transactional email helper with PDF attachment support

export interface BrevoAttachment {
  content: string; // base64 encoded
  name: string;
}

export async function sendTransactionalEmail(opts: {
  to: { email: string; name?: string };
  subject: string;
  htmlContent: string;
  attachments?: BrevoAttachment[];
  replyTo?: string;
}) {
  const apiKey = import.meta.env.BREVO_API_KEY;
  if (!apiKey) throw new Error('BREVO_API_KEY not configured');

  const body = {
    sender: {
      name: 'Joachim Kleinke — wirkaufendeineimmobilie',
      email: 'office@wirkaufendeineimmobilie.de',
    },
    to: [opts.to],
    subject: opts.subject,
    htmlContent: opts.htmlContent,
    replyTo: { email: opts.replyTo ?? 'office@wirkaufendeineimmobilie.de' },
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
