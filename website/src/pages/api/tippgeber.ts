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
    typ: 'tippgeber',
    name: data.get('name'),
    email: data.get('email'),
    telefon: data.get('telefon'),
    tippgeber_typ: data.get('tippgeber_typ'),
    tippgeber_plz: data.get('plz'),
  });

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
