// src/pages/api/tippgeber.ts
import type { APIRoute } from 'astro';
import { insertRegistration } from '../../lib/db';
import { checkRateLimit } from '../../lib/rate-limit';

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

  const lead_magnet_data = JSON.stringify({
    ...(data.get('objekt_quelle') ? { objekt_quelle: data.get('objekt_quelle') } : {}),
    ...(data.get('tipps_monat') ? { tipps_monat: data.get('tipps_monat') } : {}),
  });

  insertRegistration({
    typ: 'tippgeber',
    name: data.get('name'),
    email,
    telefon: data.get('telefon'),
    tippgeber_typ: data.get('tippgeber_typ'),
    tippgeber_plz: data.get('plz'),
    lead_magnet_data,
    pain_freitext: data.get('pain_freitext') || null,
  });

  return new Response(JSON.stringify({ success: true }), {
    status: 200, headers: { 'Content-Type': 'application/json' },
  });
};
