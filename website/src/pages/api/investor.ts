// src/pages/api/investor.ts
import type { APIRoute } from 'astro';
import { insertRegistration } from '../../lib/db';
import { checkRateLimit } from '../../lib/rate-limit';

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

  return new Response(JSON.stringify({ success: true }), {
    status: 200, headers: { 'Content-Type': 'application/json' },
  });
};
