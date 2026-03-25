// src/pages/api/tippgeber.ts
import type { APIRoute } from 'astro';
import { insertRegistration } from '../../lib/db';
import { checkRateLimit } from '../../lib/rate-limit';
import { sendTransactionalEmail } from '../../lib/brevo';

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
  sendTransactionalEmail({
    to: { email, name },
    subject: 'Deine Anmeldung als Tippgeber — wirkaufendeineimmobilie.de',
    htmlContent: `<p>Hallo ${anrede},</p>
<p>willkommen an Bord. Deine Anmeldung als Tippgeber ist eingegangen.</p>
<p><strong>Wie es weitergeht:</strong></p>
<ul style="padding-left:1.2rem;margin:8px 0">
  <li>Wir schicken dir in Kürze deinen persönlichen Leitfaden</li>
  <li>Du erfährst genau, welche Objekte für uns interessant sind</li>
  <li>Bei jedem erfolgreichen Deal erhältst du deine Provision</li>
</ul>
<p>Schreib uns jederzeit — wir sind für dich da.</p>`,
  }).catch(() => {});

  return new Response(JSON.stringify({ success: true }), {
    status: 200, headers: { 'Content-Type': 'application/json' },
  });
};
