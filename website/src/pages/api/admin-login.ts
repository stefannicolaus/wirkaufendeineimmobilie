import type { APIRoute } from 'astro';
import { validateAdminCredentials, makeSessionCookie } from '../../lib/admin-auth';
import { checkRateLimit } from '../../lib/rate-limit';

export const prerender = false;

export const POST: APIRoute = async ({ request, redirect, clientAddress }) => {
  // Rate-Limit: schützt vor Brute-Force (30 Login-Versuche/min per IP)
  const ip = clientAddress || request.headers.get('x-forwarded-for') || 'unknown';
  if (!checkRateLimit(ip)) {
    return new Response(null, {
      status: 302,
      headers: { Location: '/admin/login?error=1' },
    });
  }

  const data = await request.formData();
  const user = String(data.get('user') || '');
  const password = String(data.get('password') || '');

  if (!validateAdminCredentials(user, password)) {
    return new Response(null, {
      status: 302,
      headers: { Location: '/admin/login?error=1' },
    });
  }

  return new Response(null, {
    status: 302,
    headers: {
      'Set-Cookie': makeSessionCookie(),
      Location: '/admin',
    },
  });
};
