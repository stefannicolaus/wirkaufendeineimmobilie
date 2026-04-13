// src/pages/api/investor.ts
import type { APIRoute } from 'astro';
import { insertRegistration } from '../../lib/db';
import { checkRateLimit } from '../../lib/rate-limit';
import { sendTransactionalEmail, sendInternalEmail } from '../../lib/brevo';
import { verifyTurnstile } from '../../lib/turnstile';

export const prerender = false;

export const POST: APIRoute = async ({ request, clientAddress }) => {
  const ip = clientAddress || request.headers.get('x-forwarded-for') || 'unknown';
  if (!checkRateLimit(ip)) {
    return new Response(JSON.stringify({ error: 'Zu viele Anfragen. Bitte kurz warten.' }), {
      status: 429, headers: { 'Content-Type': 'application/json' },
    });
  }

  const data = await request.formData();

  // Honeypot
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

  const erfahrung_deals = data.get('erfahrung_deals');
  const hauptproblem = data.get('hauptproblem');
  const konkreter_deal = data.get('konkreter_deal');

  const lead_magnet_data = JSON.stringify({
    ...(erfahrung_deals ? { erfahrung_deals } : {}),
    ...(hauptproblem ? { hauptproblem } : {}),
    ...(konkreter_deal ? { konkreter_deal } : {}),
  });

  const assetklasseArr = data.getAll('assetklasse').map(String).filter(Boolean);
  const objektzustandArr = data.getAll('objektzustand').map(String).filter(Boolean);
  const kaufpreis_min_raw = data.get('kaufpreis_min');
  const kaufpreis_max_raw = data.get('kaufpreis_max');

  insertRegistration({
    typ: 'investor',
    name,
    email,
    telefon: data.get('telefon'),
    investor_typ: data.get('investor_typ'),
    erfahrung: data.get('erfahrung'),
    gewerk: data.get('gewerk'),
    lead_magnet_data,
    pain_freitext: data.get('pain_freitext') || null,
    assetklasse: assetklasseArr.length > 0 ? JSON.stringify(assetklasseArr) : null,
    objektzustand: objektzustandArr.length > 0 ? JSON.stringify(objektzustandArr) : null,
    kaufpreis_min: kaufpreis_min_raw ? (parseInt(String(kaufpreis_min_raw), 10) || null) : null,
    kaufpreis_max: kaufpreis_max_raw ? (parseInt(String(kaufpreis_max_raw), 10) || null) : null,
    kaufzeitrahmen: data.get('kaufzeitrahmen') ? String(data.get('kaufzeitrahmen')) : null,
  });

  const anrede = vorname || name || 'Investor';
  const source = String(data.get('source') || '');
  const isCommunity = source.startsWith('community-');

  const confirmationHtml = isCommunity
    ? `<p>Hallo ${anrede},</p>
<p>vielen Dank für dein Interesse an unserer WhatsApp-Gruppe für Immobilien-Investoren.</p>
<p>Wir prüfen deine Anfrage und schicken dir den Zugangslink innerhalb von 24 Stunden per E-Mail zu.</p>
<p><strong>Was dich in der Gruppe erwartet:</strong></p>
<ul style="padding-left:1.2rem;margin:8px 0">
  <li>Off-Market Objekte bevor sie öffentlich werden</li>
  <li>Vorgeprüft mit Renditepotenzial &amp; Sanierungskalkulation</li>
  <li>Direkte Absprachen ohne Bietergefecht</li>
</ul>
<p>Wir freuen uns, dich bald in der Gruppe zu begrüßen.</p>`
    : `<p>Hallo ${anrede},</p>
<p>deine Anfrage ist bei uns eingegangen. Wir prüfen dein Profil und melden uns innerhalb von 24 Stunden bei dir.</p>
<p><strong>Was dich erwartet:</strong></p>
<ul style="padding-left:1.2rem;margin:8px 0">
  <li>Off-Market Objekte bevor sie öffentlich werden</li>
  <li>Vorgeprüft mit Renditepotenzial &amp; Sanierungskalkulation</li>
  <li>Kein Bietergefecht — diskretes Angebotsverfahren</li>
</ul>
<p>Wir freuen uns auf die Zusammenarbeit.</p>`;

  sendTransactionalEmail({
    to: { email, name },
    subject: isCommunity
      ? 'Deine Anfrage für die Investoren-Gruppe — wirkaufendeineimmobilie.de'
      : 'Dein Zugang ist beantragt — wirkaufendeineimmobilie.de',
    htmlContent: confirmationHtml,
  }).catch(() => {});

  sendInternalEmail({
    subject: isCommunity
      ? `[WhatsApp-Gruppe Investoren] Neue Anmeldung: ${name || email}`
      : `[Investor] Neue Registrierung: ${name || email}`,
    htmlContent: `<p><strong>Neue Investoren-Anmeldung${isCommunity ? ' (WhatsApp-Gruppe)' : ''}:</strong></p>
<table style="border-collapse:collapse;width:100%">
  <tr><td style="padding:6px 12px 6px 0;color:#6b7280;white-space:nowrap">Name</td><td style="padding:6px 0"><strong>${name || '—'}</strong></td></tr>
  <tr><td style="padding:6px 12px 6px 0;color:#6b7280">E-Mail</td><td style="padding:6px 0"><a href="mailto:${email}">${email}</a></td></tr>
  <tr><td style="padding:6px 12px 6px 0;color:#6b7280">Telefon</td><td style="padding:6px 0">${data.get('telefon') || '—'}</td></tr>
  <tr><td style="padding:6px 12px 6px 0;color:#6b7280">Investor-Typ</td><td style="padding:6px 0">${data.get('investor_typ') || '—'}</td></tr>
  <tr><td style="padding:6px 12px 6px 0;color:#6b7280">Erfahrung</td><td style="padding:6px 0">${data.get('erfahrung') || '—'}</td></tr>
  <tr><td style="padding:6px 12px 6px 0;color:#6b7280">Assetklassen</td><td style="padding:6px 0">${assetklasseArr.join(', ') || '—'}</td></tr>
  <tr><td style="padding:6px 12px 6px 0;color:#6b7280">Kaufpreis</td><td style="padding:6px 0">${kaufpreis_min_raw ? `€ ${Number(kaufpreis_min_raw).toLocaleString('de-DE')}` : '—'} – ${kaufpreis_max_raw ? `€ ${Number(kaufpreis_max_raw).toLocaleString('de-DE')}` : '—'}</td></tr>
  <tr><td style="padding:6px 12px 6px 0;color:#6b7280">Objektzustand</td><td style="padding:6px 0">${objektzustandArr.join(', ') || '—'}</td></tr>
  <tr><td style="padding:6px 12px 6px 0;color:#6b7280">Kaufzeitrahmen</td><td style="padding:6px 0">${data.get('kaufzeitrahmen') || '—'}</td></tr>
  <tr><td style="padding:6px 12px 6px 0;color:#6b7280">Quelle</td><td style="padding:6px 0">${source || 'direkt'}</td></tr>
</table>
${isCommunity ? '<p style="margin-top:1rem;padding:12px 16px;background:#fef3c7;border-radius:6px;font-size:14px">→ Bitte prüfen und WhatsApp-Gruppenlink zuschicken.</p>' : ''}`,
  }).catch(() => {});

  return new Response(JSON.stringify({ success: true }), {
    status: 200, headers: { 'Content-Type': 'application/json' },
  });
};
