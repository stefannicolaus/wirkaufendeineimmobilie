import type { APIRoute } from 'astro';
import {
  getRegistrations, countRegistrations, getRegistrationById,
  updateRegistration, deleteRegistration, getDashboardStats, getKapitalanlegerLeads
} from '../../lib/db';
import { isValidSession } from '../../lib/admin-auth';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { lookup as mimeLookup } from 'mime-types';

export const prerender = false;

function authCheck(request: Request): boolean {
  return isValidSession(request.headers.get('cookie'));
}

// GET /api/admin-leads?view=dashboard|list|detail|kapitalanleger|export
export const GET: APIRoute = async ({ request }) => {
  if (!authCheck(request)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const url = new URL(request.url);
  const view = url.searchParams.get('view') ?? 'list';

  if (view === 'dashboard') {
    return new Response(JSON.stringify(getDashboardStats()), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (view === 'kapitalanleger') {
    const data = getKapitalanlegerLeads();
    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Upload-Wizard Datei-Download
  const action = url.searchParams.get('action');
  if (action === 'file') {
    const session = url.searchParams.get('session') ?? '';
    const doctype = url.searchParams.get('doctype') ?? '';
    const filename = url.searchParams.get('filename') ?? '';
    // Sicherheit: keine Pfad-Traversal
    if (!session || !doctype || !filename ||
        session.includes('..') || doctype.includes('..') || filename.includes('..')) {
      return new Response(JSON.stringify({ error: 'ungültige Parameter' }), { status: 400 });
    }
    const filePath = join(process.cwd(), 'data', 'uploads', session, doctype, filename);
    if (!existsSync(filePath)) {
      return new Response(JSON.stringify({ error: 'Datei nicht gefunden' }), { status: 404 });
    }
    const buffer = readFileSync(filePath);
    const mimeType = mimeLookup(filename) || 'application/octet-stream';
    const displayName = filename.replace(/^\d+-/, '');
    return new Response(buffer, {
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `attachment; filename="${displayName}"`,
      },
    });
  }

  // Energieausweis-Download (Quiz-Upload, base64 in DB)
  if (action === 'energieausweis') {
    const id = Number(url.searchParams.get('id'));
    if (!id) return new Response(JSON.stringify({ error: 'id fehlt' }), { status: 400 });
    const row = getRegistrationById(id);
    if (!row || !row.energieausweis_base64) {
      return new Response(JSON.stringify({ error: 'kein Energieausweis' }), { status: 404 });
    }
    return new Response(JSON.stringify({ base64: String(row.energieausweis_base64) }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (view === 'detail') {
    const id = Number(url.searchParams.get('id'));
    if (!id) return new Response(JSON.stringify({ error: 'id fehlt' }), { status: 400 });
    const row = getRegistrationById(id);
    if (!row) return new Response(JSON.stringify({ error: 'nicht gefunden' }), { status: 404 });
    return new Response(JSON.stringify(row), { headers: { 'Content-Type': 'application/json' } });
  }

  if (view === 'export') {
    const typ = url.searchParams.get('typ') ?? undefined;
    const status = url.searchParams.get('status') ?? undefined;
    const rows = getRegistrations({ typ, status, limit: 10000 });

    const BOM = '\uFEFF';
    const header = 'id,typ,name,email,telefon,status,notiz,pain_freitext,created_at';
    const csv = [header, ...rows.map(r =>
      [r.id, r.typ, r.name, r.email, r.telefon, r.status, r.notiz, r.pain_freitext, r.created_at]
        .map(v => v == null ? '' : `"${String(v).replace(/"/g, '""')}"`)
        .join(',')
    )].join('\n');

    const date = new Date().toISOString().slice(0, 10);
    const filename = `wkdi-leads-${typ ?? 'alle'}-${date}.csv`;

    return new Response(BOM + csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  }

  // Default: list
  const typ = url.searchParams.get('typ') ?? undefined;
  const status = url.searchParams.get('status') ?? undefined;
  const sort = url.searchParams.get('sort') ?? undefined;
  const dir = url.searchParams.get('dir') === 'ASC' ? 'ASC' as const : 'DESC' as const;
  const page = Math.max(0, Number(url.searchParams.get('page') ?? 0));
  const limit = 50;

  const rows = getRegistrations({ typ, status, sort, dir, limit, offset: page * limit });
  const total = countRegistrations({ typ, status });

  return new Response(JSON.stringify({ rows, total, page }), {
    headers: { 'Content-Type': 'application/json' },
  });
};

// PATCH /api/admin-leads — Status oder Notiz eines Leads aktualisieren
export const PATCH: APIRoute = async ({ request }) => {
  if (!authCheck(request)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const body = await request.json();
  const { id, status, notiz } = body;

  if (!id) return new Response(JSON.stringify({ error: 'id fehlt' }), { status: 400 });

  const ALLOWED_STATUS = ['neu', 'kontaktiert', 'qualifiziert', 'abgeschlossen', 'nicht qualifiziert'];
  if (status && !ALLOWED_STATUS.includes(status)) {
    return new Response(JSON.stringify({ error: 'ungültiger status' }), { status: 400 });
  }

  updateRegistration(Number(id), { status, notiz });
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
};

// DELETE /api/admin-leads — Lead löschen
export const DELETE: APIRoute = async ({ request }) => {
  if (!authCheck(request)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const url = new URL(request.url);
  const id = Number(url.searchParams.get('id'));
  if (!id) return new Response(JSON.stringify({ error: 'id fehlt' }), { status: 400 });

  deleteRegistration(id);
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
