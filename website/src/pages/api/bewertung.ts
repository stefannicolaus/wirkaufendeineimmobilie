import type { APIRoute } from 'astro';
import { insertRegistration } from '../../lib/db';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const data = await request.formData();

  // Honeypot spam check
  if (data.get('website')) {
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  insertRegistration({
    typ: 'bewertung',
    name: data.get('name') || '',
    email: data.get('email'),
    telefon: data.get('telefon'),
    plz: data.get('plz'),
    immobilientyp: data.get('typ'),
  });

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
