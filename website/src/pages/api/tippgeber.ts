// src/pages/api/tippgeber.ts
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

  const vorname = String(data.get('vorname') || '').trim();
  const nachname = String(data.get('nachname') || '').trim();
  const name = `${vorname} ${nachname}`.trim() || String(data.get('name') || '').trim();

  const lead_magnet_data = JSON.stringify({
    ...(data.get('objekt_quelle') ? { objekt_quelle: data.get('objekt_quelle') } : {}),
    ...(data.get('tipps_monat') ? { tipps_monat: data.get('tipps_monat') } : {}),
  });

  insertRegistration({
    typ: 'tippgeber',
    name,
    email,
    telefon: data.get('telefon'),
    tippgeber_typ: data.get('tippgeber_typ'),
    tippgeber_plz: data.get('plz'),
    lead_magnet_data,
    pain_freitext: data.get('pain_freitext') || null,
  });

  const anrede = vorname || name || 'Tippgeber';
  const source = String(data.get('source') || '');
  const isCommunity = source.startsWith('community-');

  const confirmationHtml = isCommunity
    ? `<p>Hallo ${anrede},</p>
<p>vielen Dank für dein Interesse an unserer WhatsApp-Gruppe für Tippgeber.</p>
<p>Wir prüfen deine Anfrage und schicken dir den Zugangslink innerhalb von 24 Stunden per E-Mail zu.</p>
<p><strong>Was dich in der Gruppe erwartet:</strong></p>
<ul style="padding-left:1.2rem;margin:8px 0">
  <li>Du erfährst genau, welche Objekte für uns interessant sind</li>
  <li>Direkter Draht zum Team — schnelle Rückmeldung</li>
  <li>Bei jedem erfolgreichen Deal erhältst du deine Provision</li>
</ul>
<p>Wir freuen uns, dich bald in der Gruppe zu begrüßen.</p>`
    : `<p>Hallo ${anrede},</p>
<p>willkommen an Bord. Deine Anmeldung als Tippgeber ist eingegangen.</p>
<p><strong>Wie es weitergeht:</strong></p>
<ul style="padding-left:1.2rem;margin:8px 0">
  <li>Wir schicken dir in Kürze deinen persönlichen Leitfaden</li>
  <li>Du erfährst genau, welche Objekte für uns interessant sind</li>
  <li>Bei jedem erfolgreichen Deal erhältst du deine Provision</li>
</ul>
<p>Schreib uns jederzeit — wir sind für dich da.</p>`;

  sendTransactionalEmail({
    to: { email, name },
    subject: isCommunity
      ? 'Deine Anfrage für die Tippgeber-Gruppe — wirkaufendeineimmobilie.de'
      : 'Deine Anmeldung als Tippgeber — wirkaufendeineimmobilie.de',
    htmlContent: confirmationHtml,
  }).catch(() => {});

  sendInternalEmail({
    subject: isCommunity
      ? `[WhatsApp-Gruppe Tippgeber] Neue Anmeldung: ${name || email}`
      : `[Tippgeber] Neue Registrierung: ${name || email}`,
    htmlContent: `<p><strong>Neue Tippgeber-Anmeldung${isCommunity ? ' (WhatsApp-Gruppe)' : ''}:</strong></p>
<table style="border-collapse:collapse;width:100%">
  <tr><td style="padding:6px 12px 6px 0;color:#6b7280;white-space:nowrap">Name</td><td style="padding:6px 0"><strong>${name || '—'}</strong></td></tr>
  <tr><td style="padding:6px 12px 6px 0;color:#6b7280">E-Mail</td><td style="padding:6px 0"><a href="mailto:${email}">${email}</a></td></tr>
  <tr><td style="padding:6px 12px 6px 0;color:#6b7280">Telefon</td><td style="padding:6px 0">${data.get('telefon') || '—'}</td></tr>
  <tr><td style="padding:6px 12px 6px 0;color:#6b7280">Tippgeber-Typ</td><td style="padding:6px 0">${data.get('tippgeber_typ') || '—'}</td></tr>
  <tr><td style="padding:6px 12px 6px 0;color:#6b7280">PLZ</td><td style="padding:6px 0">${data.get('plz') || '—'}</td></tr>
  <tr><td style="padding:6px 12px 6px 0;color:#6b7280">Quelle</td><td style="padding:6px 0">${source || 'direkt'}</td></tr>
</table>
${isCommunity ? '<p style="margin-top:1rem;padding:12px 16px;background:#fef3c7;border-radius:6px;font-size:14px">→ Bitte prüfen und WhatsApp-Gruppenlink zuschicken.</p>' : ''}`,
  }).catch(() => {});

  return new Response(JSON.stringify({ success: true }), {
    status: 200, headers: { 'Content-Type': 'application/json' },
  });
};
