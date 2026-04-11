// src/pages/api/makler.ts
import type { APIRoute } from 'astro';
import { insertRegistration } from '../../lib/db';
import { checkRateLimit } from '../../lib/rate-limit';
import { sendTransactionalEmail, sendInternalEmail } from '../../lib/brevo';
import { verifyTurnstile } from '../../lib/turnstile';

export const prerender = false;

export const POST: APIRoute = async ({ request, clientAddress }) => {
  const ip = clientAddress || request.headers.get('x-forwarded-for') || 'unknown';
  if (!checkRateLimit(ip)) {
    return new Response(JSON.stringify({ error: 'Zu viele Anfragen.' }), {
      status: 429, headers: { 'Content-Type': 'application/json' },
    });
  }

  const data = await request.formData();
  if (data.get('website')) {
    return new Response(JSON.stringify({ success: true }), {
      status: 200, headers: { 'Content-Type': 'application/json' },
    });
  }

  // Turnstile spam check
  const turnstileOk = await verifyTurnstile(String(data.get('cf-turnstile-response') || ''), ip);
  if (!turnstileOk) {
    return new Response(JSON.stringify({ error: 'Spam-Schutz fehlgeschlagen. Bitte Seite neu laden.' }), {
      status: 403, headers: { 'Content-Type': 'application/json' },
    });
  }

  const email = String(data.get('email') || '').trim();
  if (!email) {
    return new Response(JSON.stringify({ error: 'E-Mail fehlt.' }), {
      status: 400, headers: { 'Content-Type': 'application/json' },
    });
  }

  const lead_magnet_data = JSON.stringify({
    ...(data.get('abschluesse_jahr') ? { abschluesse_jahr: data.get('abschluesse_jahr') } : {}),
    ...(data.get('kooperation_interesse') ? { kooperation_interesse: data.get('kooperation_interesse') } : {}),
  });

  insertRegistration({
    typ: 'makler',
    name: data.get('name'),
    email,
    telefon: data.get('telefon'),
    maklerbuero: data.get('maklerbuero'),
    lead_magnet_data,
    pain_freitext: data.get('pain_freitext') || null,
  });

  const name = String(data.get('name') || '').trim();
  const source = String(data.get('source') || '');
  const isCommunity = source.startsWith('community-');
  const anrede = name.split(' ')[0] || 'Makler';

  const confirmationHtml = isCommunity
    ? `<p>Hallo ${anrede},</p>
<p>vielen Dank für dein Interesse an unserer WhatsApp-Gruppe für Makler.</p>
<p>Wir prüfen deine Anfrage und schicken dir den Zugangslink innerhalb von 24 Stunden per E-Mail zu.</p>
<p><strong>Was dich in der Gruppe erwartet:</strong></p>
<ul style="padding-left:1.2rem;margin:8px 0">
  <li>Direkte Kooperationen mit einem seriösen Ankäufer</li>
  <li>Schnelle Entscheidungen — kein langes Warten</li>
  <li>Faire Provisionsregelungen, klar und transparent</li>
</ul>
<p>Wir freuen uns, dich bald in der Gruppe zu begrüßen.</p>`
    : `<p>Hallo ${anrede},</p>
<p>deine Anfrage ist bei uns eingegangen. Wir melden uns innerhalb von 24 Stunden bei dir.</p>
<p><strong>Was dich erwartet:</strong></p>
<ul style="padding-left:1.2rem;margin:8px 0">
  <li>Direkte Kooperationen mit einem seriösen Ankäufer</li>
  <li>Schnelle Entscheidungen — kein langes Warten</li>
  <li>Faire Provisionsregelungen, klar und transparent</li>
</ul>
<p>Wir freuen uns auf die Zusammenarbeit.</p>`;

  sendTransactionalEmail({
    to: { email, name },
    subject: isCommunity
      ? 'Deine Anfrage für die Makler-Gruppe — wirkaufendeineimmobilie.de'
      : 'Deine Makler-Anfrage — wirkaufendeineimmobilie.de',
    htmlContent: confirmationHtml,
  }).catch(() => {});

  sendInternalEmail({
    subject: isCommunity
      ? `[WhatsApp-Gruppe Makler] Neue Anmeldung: ${name || email}`
      : `[Makler] Neue Registrierung: ${name || email}`,
    htmlContent: `<p><strong>Neue Makler-Anmeldung${isCommunity ? ' (WhatsApp-Gruppe)' : ''}:</strong></p>
<table style="border-collapse:collapse;width:100%">
  <tr><td style="padding:6px 12px 6px 0;color:#6b7280;white-space:nowrap">Name</td><td style="padding:6px 0"><strong>${name || '—'}</strong></td></tr>
  <tr><td style="padding:6px 12px 6px 0;color:#6b7280">E-Mail</td><td style="padding:6px 0"><a href="mailto:${email}">${email}</a></td></tr>
  <tr><td style="padding:6px 12px 6px 0;color:#6b7280">Telefon</td><td style="padding:6px 0">${data.get('telefon') || '—'}</td></tr>
  <tr><td style="padding:6px 12px 6px 0;color:#6b7280">Maklerbüro</td><td style="padding:6px 0">${data.get('maklerbuero') || '—'}</td></tr>
  <tr><td style="padding:6px 12px 6px 0;color:#6b7280">Quelle</td><td style="padding:6px 0">${source || 'direkt'}</td></tr>
</table>
${isCommunity ? '<p style="margin-top:1rem;padding:12px 16px;background:#fef3c7;border-radius:6px;font-size:14px">→ Bitte prüfen und WhatsApp-Gruppenlink zuschicken.</p>' : ''}`,
  }).catch(() => {});

  return new Response(JSON.stringify({ success: true }), {
    status: 200, headers: { 'Content-Type': 'application/json' },
  });
};
