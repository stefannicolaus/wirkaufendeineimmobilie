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

  const typ = data.get('typ') as string;
  const extraData: Record<string, unknown> = {};

  if (typ === 'aktionsplan-erben') {
    extraData.lead_magnet_data = JSON.stringify({
      anzahl_erben: data.get('anzahl_erben'),
      blockiert_seit: data.get('blockiert_seit'),
    });
    extraData.plz = data.get('plz');
  } else if (typ === 'blueprint') {
    extraData.lead_magnet_data = JSON.stringify({
      erfahrung: data.get('erfahrung'),
      budget: data.get('budget'),
      handwerker: data.get('handwerker'),
    });
  } else if (typ === 'kompass') {
    extraData.lead_magnet_data = JSON.stringify({
      rolle: data.get('rolle'),
      vermoegenssorge: data.get('vermoegenssorge'),
    });
    extraData.plz = data.get('plz');
  }

  insertRegistration({
    typ: 'lead-magnet',
    email: data.get('email'),
    lead_magnet_typ: typ,
    ...extraData,
  });

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
