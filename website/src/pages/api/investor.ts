import type { APIRoute } from 'astro';
import { insertRegistration } from '../../lib/db';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const data = await request.formData();

  insertRegistration({
    typ: 'investor',
    name: data.get('name'),
    email: data.get('email'),
    telefon: data.get('telefon'),
    investor_typ: data.get('investor_typ'),
    erfahrung: data.get('erfahrung'),
    gewerk: data.get('gewerk'),
  });

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
