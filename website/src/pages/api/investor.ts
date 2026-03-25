// src/pages/api/investor.ts
import type { APIRoute } from 'astro';
import { insertRegistration } from '../../lib/db';
import { checkRateLimit } from '../../lib/rate-limit';
import { sendTransactionalEmail } from '../../lib/brevo';

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
  });

  const anrede = vorname || name || 'Investor';
  sendTransactionalEmail({
    to: { email, name },
    subject: 'Dein Zugang ist beantragt — wirkaufendeineimmobilie.de',
    htmlContent: `<div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;color:#111827;line-height:1.6">
<p>Hallo ${anrede},</p>
<p>deine Anfrage ist bei uns eingegangen. Wir prüfen dein Profil und melden uns innerhalb von 24 Stunden bei dir.</p>
<p><strong>Was dich erwartet:</strong></p>
<ul style="padding-left:1.2rem">
  <li>Off-Market Objekte bevor sie öffentlich werden</li>
  <li>Vorgeprüft mit Renditepotenzial &amp; Sanierungskalkulation</li>
  <li>Kein Bietergefecht — diskretes Angebotsverfahren</li>
</ul>
<p>Wir freuen uns auf die Zusammenarbeit.</p>
</div>`,
  }).catch(() => {});

  return new Response(JSON.stringify({ success: true }), {
    status: 200, headers: { 'Content-Type': 'application/json' },
  });
};
