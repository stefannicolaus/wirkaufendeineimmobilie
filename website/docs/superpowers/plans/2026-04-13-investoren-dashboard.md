# Investoren Dashboard — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Admin-Dashboard `/admin/investoren` für Joachim — zeigt alle Investor-Registrierungen in einer animierten Dark-Theme-Tabelle mit Side-Panel, Status-Änderung und Soft-Delete.

**Architecture:** Astro SSR-Seite lädt Daten server-seitig, rendert Tabelle HTML-escaped. Client-JS übernimmt Filter/Suche und Panel-Interaktion (textContent only, kein innerHTML). API-Route `POST /api/admin-investor` mit Auth + CSRF + Whitelist-Validierung.

**Tech Stack:** Astro SSR (`export const prerender = false`), better-sqlite3, TypeScript, Inline-CSS (Dark Theme), Vanilla-JS

---

## File Structure

| Aktion | Datei | Zweck |
|--------|-------|-------|
| Modify | `website/src/lib/db.ts` | 5 neue ALTER TABLE + `getInvestorRegistrations()` + `getInvestorStats()` |
| Create | `website/src/pages/api/admin-investor.ts` | POST-Handler: update (status/notiz) + soft delete |
| Create | `website/src/pages/admin/investoren.astro` | Dark-Theme Dashboard-Seite |
| Modify | `website/src/pages/admin/index.astro` | Nav-Link "Investoren" hinzufügen |
| Modify | `website/src/pages/admin/registrierungen.astro` | Nav-Link "Investoren" hinzufügen |
| Modify | `website/src/pages/admin/kapitalanleger.astro` | Nav-Link "Investoren" hinzufügen |

---

## Task 1: DB — Neue Spalten + Abfrage-Funktionen

**Files:**
- Modify: `website/src/lib/db.ts` — nach dem letzten `try { db.exec(...pi_sent_at...) }` Block, vor der `insertRegistration`-Funktion

### - [ ] Step 1: Neue ALTER TABLE Migrationen und Funktionen schreiben

Direkt nach dem Block:
```ts
try { db.exec(`ALTER TABLE registrations ADD COLUMN pi_sent_at DATETIME`); } catch {}
```

Diesen Code einfügen:

```ts
// Investor-spezifische Felder (idempotent)
try { db.exec(`ALTER TABLE registrations ADD COLUMN assetklasse TEXT`); } catch {}
try { db.exec(`ALTER TABLE registrations ADD COLUMN kaufpreis_min INTEGER`); } catch {}
try { db.exec(`ALTER TABLE registrations ADD COLUMN kaufpreis_max INTEGER`); } catch {}
try { db.exec(`ALTER TABLE registrations ADD COLUMN objektzustand TEXT`); } catch {}
try { db.exec(`ALTER TABLE registrations ADD COLUMN kaufzeitrahmen TEXT`); } catch {}
```

Am Ende der Datei, vor `export default db;`, diese zwei Funktionen einfügen:

```ts
export function getInvestorRegistrations(limit = 200) {
  return db.prepare(
    `SELECT id, name, email, telefon, status, notiz, investor_typ, erfahrung,
            assetklasse, kaufpreis_min, kaufpreis_max, objektzustand, kaufzeitrahmen,
            created_at
     FROM registrations
     WHERE typ = 'investor' AND status != 'geloescht'
     ORDER BY created_at DESC
     LIMIT ?`
  ).all(limit) as Record<string, unknown>[];
}

export function getInvestorStats() {
  const rows = db.prepare(
    `SELECT status, COUNT(*) as count FROM registrations
     WHERE typ = 'investor' AND status != 'geloescht'
     GROUP BY status`
  ).all() as { status: string; count: number }[];

  const by: Record<string, number> = {};
  let gesamt = 0;
  for (const r of rows) {
    by[r.status] = r.count;
    gesamt += r.count;
  }
  return {
    gesamt,
    neu: by['neu'] ?? 0,
    qualifiziert: by['qualifiziert'] ?? 0,
    abgeschlossen: by['abgeschlossen'] ?? 0,
  };
}
```

### - [ ] Step 2: TypeScript-Build prüfen

```bash
cd website && npx tsc --noEmit
```

Erwartung: Keine Fehler.

### - [ ] Step 3: Commit

```bash
git add website/src/lib/db.ts
git commit -m "feat(db): add investor columns + getInvestorRegistrations + getInvestorStats"
```

---

## Task 2: API Route `POST /api/admin-investor`

**Files:**
- Create: `website/src/pages/api/admin-investor.ts`

### - [ ] Step 1: Datei erstellen

```ts
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
```

### - [ ] Step 2: TypeScript-Build prüfen

```bash
cd website && npx tsc --noEmit
```

Erwartung: Keine Fehler.

### - [ ] Step 3: Commit

```bash
git add website/src/pages/api/admin-investor.ts
git commit -m "feat(api): add admin-investor POST route (update/soft-delete, auth+CSRF+whitelist)"
```

---

## Task 3: Dashboard-Seite `/admin/investoren.astro`

**Files:**
- Create: `website/src/pages/admin/investoren.astro`

### - [ ] Step 1: Datei erstellen (vollständiger Code)

```astro
---
export const prerender = false;
import { getInvestorRegistrations, getInvestorStats } from '../../lib/db';

const registrations = getInvestorRegistrations(200);
const stats = getInvestorStats();
const showWarning = registrations.length >= 200;

function formatDate(dt: unknown): string {
  if (!dt || typeof dt !== 'string') return '—';
  try {
    return new Date(dt).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit' });
  } catch { return '—'; }
}

function formatBudget(min: unknown, max: unknown): string {
  if (min == null && max == null) return '—';
  const fmt = (v: number) => `€ ${v.toLocaleString('de-DE')}`;
  if (min != null && max != null) return `${fmt(Number(min))} – ${fmt(Number(max))}`;
  if (min != null) return `ab ${fmt(Number(min))}`;
  return `bis ${fmt(Number(max))}`;
}

function parseArr(val: unknown): string[] {
  if (!val || typeof val !== 'string') return [];
  try { return JSON.parse(val) as string[]; } catch { return []; }
}

function statusBadge(s: unknown): string {
  const map: Record<string, string> = {
    'neu': 'badge-neu',
    'kontaktiert': 'badge-kontaktiert',
    'qualifiziert': 'badge-qualifiziert',
    'aktiv': 'badge-aktiv',
    'abgeschlossen': 'badge-abgeschlossen',
    'nicht qualifiziert': 'badge-nicht-qual',
  };
  return map[String(s ?? 'neu')] ?? 'badge-neu';
}
---
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="robots" content="noindex, nofollow">
  <title>Investoren — WKDI Admin</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    body { font-family: system-ui, sans-serif; margin: 0; background: #020817; color: #e2e8f0; min-height: 100vh; }

    /* NAV */
    nav { background: #0d1117; border-bottom: 1px solid #1e293b; padding: 0.6rem 1.25rem;
          display: flex; gap: 1.25rem; align-items: center; }
    nav strong { margin-right: auto; color: #f1f5f9; font-size: 0.95rem; }
    nav a { color: #64748b; text-decoration: none; font-size: 0.85rem; transition: color 0.15s; }
    nav a:hover { color: #cbd5e1; }
    nav a.active { color: #60a5fa; border-bottom: 1px solid #3b82f6; padding-bottom: 1px; }
    .nav-logout { background: none; border: none; color: #64748b; cursor: pointer; font-size: 0.85rem;
                  padding: 0; transition: color 0.15s; }
    .nav-logout:hover { color: #f87171; }

    /* STATS */
    #stats-wrap { overflow: hidden; transition: max-height 0.3s ease; max-height: 200px; }
    #stats-wrap.hidden { max-height: 0; }
    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1px; background: #1e293b;
                  border-bottom: 1px solid #1e293b; }
    .stat-card { background: #0f172a; padding: 1rem 1.25rem; }
    .stat-label { color: #475569; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.25rem; }
    .stat-value { font-size: 1.6rem; font-weight: 700; line-height: 1; }
    .stat-sub { color: #475569; font-size: 0.7rem; margin-top: 0.15rem; }
    .sv-blue { color: #60a5fa; }
    .sv-green { color: #86efac; }
    .sv-yellow { color: #fbbf24; }

    /* TOOLBAR */
    #toolbar { display: flex; gap: 0.5rem; align-items: center; padding: 0.75rem 1.25rem;
               border-bottom: 1px solid #1e293b; background: #0f172a; flex-wrap: wrap; }
    #search { flex: 1; min-width: 180px; background: #1e293b; border: 1px solid #334155; border-radius: 6px;
              padding: 0.4rem 0.75rem; color: #e2e8f0; font-size: 0.85rem; outline: none; }
    #search:focus { border-color: #3b82f6; }
    #search::placeholder { color: #475569; }
    .filter-btns { display: flex; gap: 0.25rem; }
    .filter-btn { background: #1e293b; border: 1px solid #334155; border-radius: 6px; color: #64748b;
                  cursor: pointer; font-size: 0.8rem; padding: 0.35rem 0.7rem; transition: all 0.15s; }
    .filter-btn.active { background: #1e3a8a; border-color: #3b82f6; color: #93c5fd; }
    .filter-btn:hover:not(.active) { border-color: #475569; color: #94a3b8; }
    #toggle-stats { background: #1e293b; border: 1px solid #334155; border-radius: 6px; color: #64748b;
                    cursor: pointer; font-size: 0.8rem; padding: 0.35rem 0.7rem; margin-left: auto;
                    transition: all 0.15s; white-space: nowrap; }
    #toggle-stats:hover { border-color: #475569; color: #94a3b8; }

    /* WARNING */
    .limit-warn { background: #451a03; border-bottom: 1px solid #92400e; color: #fbbf24;
                  font-size: 0.8rem; padding: 0.4rem 1.25rem; }

    /* MAIN LAYOUT */
    #layout { display: flex; min-height: calc(100vh - 120px); }
    #table-wrap { flex: 1; overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
    thead tr { border-bottom: 1px solid #1e293b; }
    th { color: #475569; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.05em;
         padding: 0.6rem 0.75rem; font-weight: 600; text-align: left; white-space: nowrap; }
    .investor-row { border-bottom: 1px solid #0f172a; cursor: pointer; transition: background 0.15s;
                    animation: fadeInUp 0.3s ease forwards; opacity: 0; }
    .investor-row:hover { background: #1e293b40; }
    .investor-row.selected { background: #1e3a5f30; border-left: 2px solid #3b82f6; }
    td { padding: 0.55rem 0.75rem; color: #cbd5e1; vertical-align: middle; }
    td:first-child { color: #f1f5f9; }
    .date-col { color: #475569; font-size: 0.8rem; white-space: nowrap; }
    .tag { background: #1d3a6e; color: #93c5fd; padding: 1px 6px; border-radius: 9px;
           font-size: 0.72rem; display: inline-block; margin: 1px 2px 1px 0; }
    .budget-col { color: #4ade80; font-size: 0.82rem; white-space: nowrap; }
    .empty-state { padding: 3rem 1.25rem; text-align: center; color: #475569; }

    /* BADGES */
    .badge { padding: 2px 8px; border-radius: 9px; font-size: 0.75rem; white-space: nowrap; }
    .badge-neu { background: #1e3a8a; color: #93c5fd; }
    .badge-kontaktiert { background: #2e1065; color: #c4b5fd; }
    .badge-qualifiziert { background: #14532d; color: #86efac; }
    .badge-aktiv { background: #451a03; color: #fbbf24; }
    .badge-abgeschlossen { background: #1e293b; color: #64748b; }
    .badge-nicht-qual { background: #450a0a; color: #fca5a5; }

    /* SIDE PANEL */
    #panel { width: 0; min-width: 0; overflow: hidden; background: #0d1117; border-left: 1px solid #1e293b;
             transition: width 0.2s ease, min-width 0.2s ease; flex-shrink: 0; }
    #panel.open { width: 280px; min-width: 280px; }
    .panel-inner { width: 280px; padding: 1rem; overflow-y: auto; height: 100%; }
    .panel-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem; }
    .panel-name { font-weight: 700; color: #f1f5f9; font-size: 1rem; }
    .panel-meta { color: #475569; font-size: 0.75rem; margin-top: 0.2rem; }
    .panel-close { background: none; border: none; color: #475569; cursor: pointer; font-size: 1rem;
                   padding: 0; line-height: 1; flex-shrink: 0; }
    .panel-close:hover { color: #94a3b8; }
    .field { margin-bottom: 0.6rem; }
    .field-label { color: #475569; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.2rem; }
    .field-value { color: #94a3b8; font-size: 0.85rem; word-break: break-word; }
    .field-link { color: #60a5fa; font-size: 0.85rem; text-decoration: none; }
    .field-link:hover { text-decoration: underline; }
    .tags-wrap { display: flex; flex-wrap: wrap; gap: 2px; }
    .panel-status { width: 100%; background: #1e293b; border: 1px solid #334155; border-radius: 6px;
                    color: #e2e8f0; padding: 0.4rem 0.5rem; font-size: 0.85rem; margin-top: 0.2rem;
                    cursor: pointer; outline: none; }
    .panel-status:focus { border-color: #3b82f6; }
    .panel-notiz { width: 100%; background: #1e293b; border: 1px solid #334155; border-radius: 6px;
                   color: #e2e8f0; padding: 0.4rem 0.5rem; font-size: 0.82rem; resize: vertical;
                   min-height: 80px; margin-top: 0.2rem; font-family: inherit; outline: none; }
    .panel-notiz:focus { border-color: #3b82f6; }
    .notiz-count { font-size: 0.7rem; color: #475569; float: right; }
    .btn-save { background: #1e3a8a; border: 1px solid #3b82f6; border-radius: 6px; color: #93c5fd;
                cursor: pointer; font-size: 0.8rem; padding: 0.35rem 0.75rem; margin-top: 0.35rem;
                transition: all 0.15s; width: 100%; }
    .btn-save:hover { background: #1d4ed8; }
    .panel-divider { border: none; border-top: 1px solid #1e293b; margin: 0.75rem 0; }
    .panel-actions { display: flex; gap: 0.4rem; flex-wrap: wrap; }
    .btn-action { border-radius: 6px; cursor: pointer; font-size: 0.78rem; padding: 0.35rem 0.6rem;
                  text-decoration: none; border: 1px solid; transition: all 0.15s; display: inline-block; }
    .btn-email { background: #1e293b; border-color: #334155; color: #94a3b8; }
    .btn-email:hover { border-color: #60a5fa; color: #60a5fa; }
    .btn-wa { background: #14532d30; border-color: #16a34a; color: #86efac; }
    .btn-wa:hover { background: #14532d; }
    .btn-delete { background: none; border-color: #450a0a; color: #f87171; }
    .btn-delete:hover { background: #450a0a30; }

    /* ANIMATIONS */
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @media (prefers-reduced-motion: reduce) {
      .investor-row { animation: none; opacity: 1; }
      #panel { transition: none; }
      #stats-wrap { transition: none; }
    }
  </style>
</head>
<body>
  <nav>
    <strong>WKDI Admin</strong>
    <a href="/admin">Dashboard</a>
    <a href="/admin/registrierungen">Registrierungen</a>
    <a href="/admin/investoren" class="active">Investoren</a>
    <a href="/admin/kapitalanleger">KA-Rechner</a>
    <form method="POST" action="/api/admin-logout" style="margin:0">
      <button type="submit" class="nav-logout">Abmelden</button>
    </form>
  </nav>

  <div id="stats-wrap">
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">Gesamt</div>
        <div class="stat-value">{stats.gesamt}</div>
        <div class="stat-sub">Investoren</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Neu</div>
        <div class="stat-value sv-blue">{stats.neu}</div>
        <div class="stat-sub">ausstehend</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Qualifiziert</div>
        <div class="stat-value sv-green">{stats.qualifiziert}</div>
        <div class="stat-sub">aktiv matchen</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Deals</div>
        <div class="stat-value sv-yellow">{stats.abgeschlossen}</div>
        <div class="stat-sub">abgeschlossen</div>
      </div>
    </div>
  </div>

  <div id="toolbar">
    <input id="search" type="text" placeholder="Suche nach Name oder E-Mail..." autocomplete="off" />
    <div class="filter-btns">
      <button class="filter-btn active" data-filter="all">Alle</button>
      <button class="filter-btn" data-filter="neu">Neu</button>
      <button class="filter-btn" data-filter="qualifiziert">Qualifiziert</button>
      <button class="filter-btn" data-filter="aktiv">Aktiv</button>
    </div>
    <button id="toggle-stats">Statistiken ausblenden</button>
  </div>

  {showWarning && (
    <div class="limit-warn">
      ⚠️ Es werden nur die neuesten 200 Einträge angezeigt. Pagination ist für eine spätere Version geplant.
    </div>
  )}

  <div id="layout">
    <div id="table-wrap">
      {registrations.length === 0 ? (
        <div class="empty-state">Noch keine Investor-Registrierungen vorhanden.</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Typ</th>
              <th>Assetklasse</th>
              <th>Budget</th>
              <th>Erfahrung</th>
              <th>Status</th>
              <th>Datum</th>
            </tr>
          </thead>
          <tbody>
            {registrations.map((row, i) => {
              const assets = parseArr(row.assetklasse);
              return (
                <tr
                  class="investor-row"
                  data-id={String(row.id)}
                  data-status={String(row.status ?? 'neu')}
                  data-search={`${String(row.name ?? '')} ${String(row.email ?? '')}`.toLowerCase()}
                  data-investor={JSON.stringify({
                    id: row.id,
                    name: String(row.name ?? ''),
                    email: String(row.email ?? ''),
                    telefon: String(row.telefon ?? ''),
                    status: String(row.status ?? 'neu'),
                    notiz: String(row.notiz ?? ''),
                    investor_typ: String(row.investor_typ ?? ''),
                    erfahrung: String(row.erfahrung ?? ''),
                    assetklasse: String(row.assetklasse ?? ''),
                    kaufpreis_min: row.kaufpreis_min ?? null,
                    kaufpreis_max: row.kaufpreis_max ?? null,
                    objektzustand: String(row.objektzustand ?? ''),
                    kaufzeitrahmen: String(row.kaufzeitrahmen ?? ''),
                    created_at: String(row.created_at ?? ''),
                  })}
                  style={`animation-delay:${i * 0.03}s`}
                >
                  <td>{String(row.name ?? '—')}</td>
                  <td style="color:#64748b;font-size:0.82rem">{String(row.investor_typ ?? '—')}</td>
                  <td>
                    {assets.length > 0
                      ? assets.map(a => <span class="tag">{a}</span>)
                      : <span style="color:#475569">—</span>}
                  </td>
                  <td class="budget-col">{formatBudget(row.kaufpreis_min, row.kaufpreis_max)}</td>
                  <td style="color:#64748b;font-size:0.82rem">{String(row.erfahrung ?? '—')}</td>
                  <td><span class={`badge ${statusBadge(row.status)}`}>{String(row.status ?? 'neu')}</span></td>
                  <td class="date-col">{formatDate(row.created_at)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>

    <div id="panel">
      <div class="panel-inner">
        <div class="panel-header">
          <div>
            <div id="pn-name" class="panel-name"></div>
            <div id="pn-meta" class="panel-meta"></div>
          </div>
          <button class="panel-close" id="panel-close" aria-label="Schließen">✕</button>
        </div>

        <div class="field">
          <div class="field-label">E-Mail</div>
          <a id="pn-email" href="#" class="field-link"></a>
        </div>
        <div class="field">
          <div class="field-label">Telefon</div>
          <a id="pn-telefon" href="#" class="field-link"></a>
        </div>
        <div class="field">
          <div class="field-label">Investor-Typ</div>
          <div id="pn-typ" class="field-value"></div>
        </div>
        <div class="field">
          <div class="field-label">Assetklassen</div>
          <div id="pn-assets" class="tags-wrap"></div>
        </div>
        <div class="field">
          <div class="field-label">Budget</div>
          <div id="pn-budget" class="field-value" style="color:#4ade80"></div>
        </div>
        <div class="field">
          <div class="field-label">Erfahrung</div>
          <div id="pn-erfahrung" class="field-value"></div>
        </div>
        <div class="field">
          <div class="field-label">Objektzustand</div>
          <div id="pn-zustand" class="tags-wrap"></div>
        </div>
        <div class="field">
          <div class="field-label">Kaufzeitrahmen</div>
          <div id="pn-zeitrahmen" class="field-value"></div>
        </div>

        <hr class="panel-divider" />

        <div class="field">
          <div class="field-label">Status</div>
          <select id="pn-status" class="panel-status">
            <option value="neu">neu</option>
            <option value="kontaktiert">kontaktiert</option>
            <option value="qualifiziert">qualifiziert</option>
            <option value="aktiv">aktiv</option>
            <option value="abgeschlossen">abgeschlossen</option>
            <option value="nicht qualifiziert">nicht qualifiziert</option>
          </select>
        </div>

        <div class="field">
          <div class="field-label">
            Notiz
            <span class="notiz-count" id="notiz-count">0 / 2000</span>
          </div>
          <textarea id="pn-notiz" class="panel-notiz" maxlength="2000" rows="4" placeholder="Notiz erfassen…"></textarea>
          <button id="btn-save" class="btn-save">Speichern</button>
        </div>

        <hr class="panel-divider" />

        <div class="panel-actions">
          <a id="btn-email" href="#" class="btn-action btn-email">E-Mail</a>
          <a id="btn-wa" href="#" target="_blank" rel="noopener" class="btn-action btn-wa">WhatsApp</a>
          <button id="btn-delete" class="btn-action btn-delete">Löschen</button>
        </div>
      </div>
    </div>
  </div>

  <script>
    // ── Helpers ──────────────────────────────────────────────────────────
    function parseArr(val) {
      if (!val) return [];
      try { return JSON.parse(val); } catch { return []; }
    }

    function fmtBudget(min, max) {
      if (min == null && max == null) return '—';
      const fmt = v => '€ ' + Number(v).toLocaleString('de-DE');
      if (min != null && max != null) return fmt(min) + ' – ' + fmt(max);
      if (min != null) return 'ab ' + fmt(min);
      return 'bis ' + fmt(max);
    }

    function normalizePhone(tel) {
      if (!tel) return '';
      const d = tel.replace(/\D/g, '');
      if (d.startsWith('49')) return '+' + d;
      if (d.startsWith('0')) return '+49' + d.slice(1);
      return d;
    }

    function fmtDate(dt) {
      if (!dt) return '—';
      try { return new Date(dt).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit' }); }
      catch { return '—'; }
    }

    const BADGE_MAP = {
      'neu': 'badge-neu', 'kontaktiert': 'badge-kontaktiert',
      'qualifiziert': 'badge-qualifiziert', 'aktiv': 'badge-aktiv',
      'abgeschlossen': 'badge-abgeschlossen', 'nicht qualifiziert': 'badge-nicht-qual',
    };

    // ── State ─────────────────────────────────────────────────────────────
    let activeId = null;
    let activeRow = null;
    let currentFilter = 'all';
    let currentSearch = '';

    // ── Stats Toggle ──────────────────────────────────────────────────────
    const statsWrap = document.getElementById('stats-wrap');
    const toggleBtn = document.getElementById('toggle-stats');
    const statsKey = 'wkdi-investor-stats';

    function applyStatsVisibility(hidden) {
      if (hidden) {
        statsWrap.classList.add('hidden');
        toggleBtn.textContent = 'Statistiken einblenden';
      } else {
        statsWrap.classList.remove('hidden');
        toggleBtn.textContent = 'Statistiken ausblenden';
      }
    }

    applyStatsVisibility(localStorage.getItem(statsKey) === '1');
    toggleBtn.addEventListener('click', () => {
      const nowHidden = !statsWrap.classList.contains('hidden');
      localStorage.setItem(statsKey, nowHidden ? '1' : '0');
      applyStatsVisibility(nowHidden);
    });

    // ── Filter & Search ───────────────────────────────────────────────────
    function applyFilters() {
      document.querySelectorAll('.investor-row').forEach(row => {
        const status = row.dataset.status ?? '';
        const search = row.dataset.search ?? '';
        const matchFilter = currentFilter === 'all' || status === currentFilter;
        const matchSearch = !currentSearch || search.includes(currentSearch);
        row.style.display = matchFilter && matchSearch ? '' : 'none';
      });
    }

    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        applyFilters();
      });
    });

    document.getElementById('search').addEventListener('input', e => {
      currentSearch = e.target.value.toLowerCase().trim();
      applyFilters();
    });

    // ── Side Panel ────────────────────────────────────────────────────────
    const panel = document.getElementById('panel');

    function openPanel(row) {
      const inv = JSON.parse(row.dataset.investor);

      if (activeRow) activeRow.classList.remove('selected');
      row.classList.add('selected');
      activeRow = row;
      activeId = inv.id;

      // Populate with textContent (XSS-safe)
      document.getElementById('pn-name').textContent = inv.name || '—';
      document.getElementById('pn-meta').textContent =
        (inv.status || 'neu') + ' · ' + fmtDate(inv.created_at);

      const emailEl = document.getElementById('pn-email');
      emailEl.textContent = inv.email || '—';
      emailEl.href = inv.email ? 'mailto:' + inv.email : '#';

      const telEl = document.getElementById('pn-telefon');
      telEl.textContent = inv.telefon || '—';
      telEl.href = inv.telefon ? 'tel:' + inv.telefon : '#';

      document.getElementById('pn-typ').textContent = inv.investor_typ || '—';

      const assetsEl = document.getElementById('pn-assets');
      assetsEl.innerHTML = '';
      const assets = parseArr(inv.assetklasse);
      if (assets.length > 0) {
        assets.forEach(a => {
          const span = document.createElement('span');
          span.className = 'tag';
          span.textContent = a;
          assetsEl.appendChild(span);
        });
      } else {
        assetsEl.textContent = '—';
      }

      document.getElementById('pn-budget').textContent = fmtBudget(inv.kaufpreis_min, inv.kaufpreis_max);
      document.getElementById('pn-erfahrung').textContent = inv.erfahrung || '—';

      const zustandEl = document.getElementById('pn-zustand');
      zustandEl.innerHTML = '';
      const zustand = parseArr(inv.objektzustand);
      if (zustand.length > 0) {
        zustand.forEach(z => {
          const span = document.createElement('span');
          span.className = 'tag';
          span.textContent = z;
          zustandEl.appendChild(span);
        });
      } else {
        zustandEl.textContent = '—';
      }

      document.getElementById('pn-zeitrahmen').textContent = inv.kaufzeitrahmen || '—';
      document.getElementById('pn-status').value = inv.status || 'neu';

      const notizEl = document.getElementById('pn-notiz');
      notizEl.value = inv.notiz || '';
      updateNotizCount(notizEl.value.length);

      const waNum = normalizePhone(inv.telefon);
      const waBtn = document.getElementById('btn-wa');
      waBtn.href = waNum ? 'https://wa.me/' + waNum.replace('+', '') : '#';

      document.getElementById('btn-email').href = inv.email ? 'mailto:' + inv.email : '#';

      panel.classList.add('open');
    }

    function closePanel() {
      panel.classList.remove('open');
      if (activeRow) { activeRow.classList.remove('selected'); activeRow = null; }
      activeId = null;
    }

    document.getElementById('panel-close').addEventListener('click', closePanel);

    document.querySelectorAll('.investor-row').forEach(row => {
      row.addEventListener('click', () => openPanel(row));
    });

    // ── Notiz Counter ─────────────────────────────────────────────────────
    function updateNotizCount(len) {
      document.getElementById('notiz-count').textContent = len + ' / 2000';
    }
    document.getElementById('pn-notiz').addEventListener('input', e => {
      updateNotizCount(e.target.value.length);
    });

    // ── API Calls ─────────────────────────────────────────────────────────
    async function apiPost(body) {
      const res = await fetch('/api/admin-investor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      return res.json();
    }

    // Status ändern
    document.getElementById('pn-status').addEventListener('change', async e => {
      if (!activeId) return;
      const newStatus = e.target.value;
      const result = await apiPost({ action: 'update', id: activeId, status: newStatus });
      if (result.success) {
        // Update row data attribute + badge
        if (activeRow) {
          activeRow.dataset.status = newStatus;
          const badge = activeRow.querySelector('.badge');
          if (badge) {
            badge.className = 'badge ' + (BADGE_MAP[newStatus] ?? 'badge-neu');
            badge.textContent = newStatus;
          }
          // Update cached investor data
          try {
            const inv = JSON.parse(activeRow.dataset.investor);
            inv.status = newStatus;
            activeRow.dataset.investor = JSON.stringify(inv);
          } catch {}
        }
        document.getElementById('pn-meta').textContent =
          newStatus + ' · ' + document.getElementById('pn-meta').textContent.split(' · ')[1];
      }
    });

    // Notiz speichern
    document.getElementById('btn-save').addEventListener('click', async () => {
      if (!activeId) return;
      const notiz = document.getElementById('pn-notiz').value;
      const btn = document.getElementById('btn-save');
      const result = await apiPost({ action: 'update', id: activeId, notiz });
      if (result.success) {
        btn.textContent = '✓ Gespeichert';
        if (activeRow) {
          try {
            const inv = JSON.parse(activeRow.dataset.investor);
            inv.notiz = notiz;
            activeRow.dataset.investor = JSON.stringify(inv);
          } catch {}
        }
        setTimeout(() => { btn.textContent = 'Speichern'; }, 1500);
      }
    });

    // Löschen (Soft Delete)
    document.getElementById('btn-delete').addEventListener('click', async () => {
      if (!activeId) return;
      const name = document.getElementById('pn-name').textContent;
      if (!confirm('Investor "' + name + '" löschen? Die Daten bleiben in der Datenbank gespeichert.')) return;
      const result = await apiPost({ action: 'delete', id: activeId });
      if (result.success) {
        if (activeRow) activeRow.remove();
        closePanel();
      }
    });
  </script>
</body>
</html>
```

### - [ ] Step 2: TypeScript-Build prüfen

```bash
cd website && npx tsc --noEmit
```

Erwartung: Keine Fehler.

### - [ ] Step 3: Build testen

```bash
cd website && npm run build
```

Erwartung: Build erfolgreich, keine Fehler.

### - [ ] Step 4: Commit

```bash
git add website/src/pages/admin/investoren.astro
git commit -m "feat(admin): add /admin/investoren dark-theme dashboard with panel, filters, animations"
```

---

## Task 4: Nav-Links in allen Admin-Seiten

**Files:**
- Modify: `website/src/pages/admin/index.astro`
- Modify: `website/src/pages/admin/registrierungen.astro`
- Modify: `website/src/pages/admin/kapitalanleger.astro`

### - [ ] Step 1: In allen 3 Dateien nach `<a href="/admin/kapitalanleger">KA-Rechner</a>` suchen und einen Link davor einfügen

In **jeder** der drei Dateien:

Suchen:
```html
    <a href="/admin/kapitalanleger">KA-Rechner</a>
```

Ersetzen durch:
```html
    <a href="/admin/investoren">Investoren</a>
    <a href="/admin/kapitalanleger">KA-Rechner</a>
```

### - [ ] Step 2: Build prüfen

```bash
cd website && npm run build
```

Erwartung: Build erfolgreich.

### - [ ] Step 3: Commit

```bash
git add website/src/pages/admin/index.astro website/src/pages/admin/registrierungen.astro website/src/pages/admin/kapitalanleger.astro
git commit -m "feat(admin): add Investoren nav link to all admin pages"
```

---

## Erfolgskriterien-Abgleich

| Kriterium aus Spec | Abgedeckt durch |
|--------------------|----------------|
| Alle Investor-Registrierungen in dunkler Tabelle | Task 3: investoren.astro |
| Klick → Side Panel mit Slide-Animation | Task 3: JS + CSS panel.open |
| Leer-Felder zeigen "—" | Task 3: formatBudget + String(x ?? '—') |
| Status per Dropdown ändern (Whitelist) | Task 2: API + Task 3: JS |
| Notiz speichern (max 2000 Zeichen) | Task 2: API + Task 3: JS |
| Soft Delete entfernt Row | Task 2: status='geloescht' + Task 3: JS |
| Kennzahlen-Leiste togglebar (localStorage) | Task 3: JS stats-toggle |
| Suche + Filter client-seitig | Task 3: JS applyFilters() |
| Admin-Login Pflicht, API Auth + Origin-Check | Task 2: authCheck + originCheck |
| prefers-reduced-motion | Task 3: @media CSS |
| Build auf feat/website-build erfolgreich | Tasks 1–4 je Build-Check |
Plan written (       1 lines)
