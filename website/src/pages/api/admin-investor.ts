import type { APIRoute } from 'astro';
import { updateRegistration, getRegistrationById } from '../../lib/db';
import { isValidSession } from '../../lib/admin-auth';

export const prerender = false;

const ALLOWED_ORIGINS = [
  'https://wirkaufendeineimmobilie.de',
  'http://localhost:4321',
  'http://localhost:3000',
];

const VALID_STATUS = [
  'neu', 'kontaktiert', 'qualifiziert', 'aktiv', 'abgeschlossen', 'nicht qualifiziert', 'geloescht',
];

function authCheck(request: Request): boolean {
  return isValidSession(request.headers.get('cookie'));
}

function originCheck(request: Request): boolean {
  const origin = request.headers.get('origin') ?? '';
  return ALLOWED_ORIGINS.some(o => origin === o || origin.startsWith(o));
}

export const POST: APIRoute = async ({ request }) => {
  const json = (body: object, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { 'Content-Type': 'application/json' },
    });

  if (!authCheck(request)) return json({ error: 'Unauthorized' }, 401);
  if (!originCheck(request)) return json({ error: 'Forbidden' }, 403);

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }

  const { action, id, status, notiz } = body;

  // Validate action
  if (!['update', 'delete'].includes(action as string)) {
    return json({ error: 'Invalid action' }, 400);
  }

  // Validate id
  const numId = Number(id);
  if (!Number.isInteger(numId) || numId <= 0) {
    return json({ error: 'Invalid id' }, 400);
  }

  // Verify record exists and is investor type
  const record = getRegistrationById(numId);
  if (!record || record.typ !== 'investor') {
    return json({ error: 'Not found' }, 404);
  }

  try {
    if (action === 'delete') {
      updateRegistration(numId, { status: 'geloescht' });
      return json({ success: true });
    }

    // action === 'update'
    const update: { status?: string; notiz?: string } = {};

    if (status !== undefined) {
      if (!VALID_STATUS.includes(status as string)) {
        return json({ error: 'Invalid status' }, 400);
      }
      update.status = status as string;
    }

    if (notiz !== undefined) {
      if (typeof notiz !== 'string') return json({ error: 'Invalid notiz' }, 400);
      const trimmed = (notiz as string).trim();
      if (trimmed.length > 2000) return json({ error: 'Notiz zu lang (max 2000)' }, 400);
      update.notiz = trimmed;
    }

    if (Object.keys(update).length === 0) {
      return json({ error: 'No valid fields provided' }, 400);
    }

    updateRegistration(numId, update);
    return json({ success: true });
  } catch {
    return json({ error: 'Server error' }, 500);
  }
};
