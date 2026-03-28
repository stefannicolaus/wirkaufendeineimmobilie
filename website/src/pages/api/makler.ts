// src/pages/api/makler.ts
import type { APIRoute } from 'astro';
import { insertRegistration } from '../../lib/db';
import { checkRateLimit } from '../../lib/rate-limit';
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

  return new Response(JSON.stringify({ success: true }), {
    status: 200, headers: { 'Content-Type': 'application/json' },
  });
};
