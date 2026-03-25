import type { APIRoute } from 'astro';
import db from '../../lib/db';
import { unsubscribeToken } from '../../lib/unsubscribe-token';

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  const email = url.searchParams.get('email') || '';
  const token = url.searchParams.get('token') || '';

  if (!email || !token || token !== unsubscribeToken(email)) {
    return new Response(null, { status: 302, headers: { Location: '/abmelden?fehler=1' } });
  }

  try {
    db.exec(`ALTER TABLE registrations ADD COLUMN unsubscribed INTEGER DEFAULT 0`);
  } catch {}

  db.prepare(`UPDATE registrations SET unsubscribed = 1 WHERE lower(email) = lower(?)`).run(email);

  return new Response(null, {
    status: 302,
    headers: { Location: `/abmelden?ok=1&email=${encodeURIComponent(email)}` },
  });
};
