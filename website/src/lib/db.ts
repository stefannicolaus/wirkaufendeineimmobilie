import Database from 'better-sqlite3';
import { join } from 'node:path';
import { mkdirSync } from 'node:fs';

const DB_PATH = process.env.WKDI_DB_PATH || join(process.cwd(), 'data', 'wkdi', 'wkdi.db');

// Ensure directory exists
mkdirSync(join(DB_PATH, '..'), { recursive: true });

const db = new Database(DB_PATH);

// Enable WAL mode for better concurrent read performance
db.pragma('journal_mode = WAL');

// Create tables on first access
db.exec(`
  CREATE TABLE IF NOT EXISTS registrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    typ TEXT NOT NULL CHECK(typ IN ('investor', 'makler', 'tippgeber', 'bewertung', 'lead-magnet')),
    name TEXT,
    email TEXT NOT NULL,
    telefon TEXT,
    investor_typ TEXT,
    erfahrung TEXT,
    gewerk TEXT,
    maklerbuero TEXT,
    tippgeber_typ TEXT,
    tippgeber_plz TEXT,
    plz TEXT,
    immobilientyp TEXT,
    lead_magnet_typ TEXT,
    lead_magnet_data TEXT,
    source TEXT DEFAULT 'website',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    sequence_day3_sent DATETIME,
    sequence_day7_sent DATETIME
  );
  CREATE TABLE IF NOT EXISTS _migrations (id TEXT PRIMARY KEY);
`);

// Add sequence columns to existing DBs (idempotent)
try { db.exec(`ALTER TABLE registrations ADD COLUMN sequence_day3_sent DATETIME`); } catch {}
try { db.exec(`ALTER TABLE registrations ADD COLUMN sequence_day7_sent DATETIME`); } catch {}

// Objekt-Daten für Erstbewertung (idempotent)
try { db.exec(`ALTER TABLE registrations ADD COLUMN baujahr INTEGER`); } catch {}
try { db.exec(`ALTER TABLE registrations ADD COLUMN wohnflaeche REAL`); } catch {}
try { db.exec(`ALTER TABLE registrations ADD COLUMN energieklasse TEXT`); } catch {}
try { db.exec(`ALTER TABLE registrations ADD COLUMN heizung_baujahr INTEGER`); } catch {}
try { db.exec(`ALTER TABLE registrations ADD COLUMN sanierungsstand TEXT`); } catch {}
try { db.exec(`ALTER TABLE registrations ADD COLUMN was_saniert TEXT`); } catch {}
try { db.exec(`ALTER TABLE registrations ADD COLUMN zustand TEXT`); } catch {}
try { db.exec(`ALTER TABLE registrations ADD COLUMN besonderheit TEXT`); } catch {}
try { db.exec(`ALTER TABLE registrations ADD COLUMN stellplatz INTEGER`); } catch {}
try { db.exec(`ALTER TABLE registrations ADD COLUMN vermietet INTEGER`); } catch {}
try { db.exec(`ALTER TABLE registrations ADD COLUMN etage TEXT`); } catch {}
try { db.exec(`ALTER TABLE registrations ADD COLUMN objekt_step_done INTEGER DEFAULT 0`); } catch {}
try { db.exec(`ALTER TABLE registrations ADD COLUMN pain_freitext TEXT`); } catch {}

// DOI tracking columns
try { db.exec(`ALTER TABLE registrations ADD COLUMN doi_confirmed INTEGER DEFAULT 0`); } catch {}
try { db.exec(`ALTER TABLE registrations ADD COLUMN ref_nr TEXT`); } catch {}
try { db.exec(`ALTER TABLE registrations ADD COLUMN pdf_base64 TEXT`); } catch {}

db.exec(`
  CREATE TABLE IF NOT EXISTS leads_kapitalanleger (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ref_nr TEXT NOT NULL,
    vorname TEXT NOT NULL,
    email TEXT NOT NULL,
    kaufpreis INTEGER,
    baujahr INTEGER,
    wohnflaeche REAL,
    kaltmiete INTEGER,
    hausgeld INTEGER,
    darlehen INTEGER,
    zinssatz REAL,
    tilgung REAL,
    grenzsteuersatz REAL,
    haltedauer INTEGER,
    gebaeudeanteil REAL,
    netto_cashflow_monat REAL,
    kaufpreisfaktor REAL,
    afa_jahr REAL,
    npv_10j REAL,
    npv_20j REAL,
    brutto_rendite REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// DOI tracking columns for leads_kapitalanleger (must run after CREATE TABLE)
try { db.exec(`ALTER TABLE leads_kapitalanleger ADD COLUMN doi_confirmed INTEGER DEFAULT 0`); } catch {}
try { db.exec(`ALTER TABLE leads_kapitalanleger ADD COLUMN ref_nr TEXT`); } catch {}
try { db.exec(`ALTER TABLE leads_kapitalanleger ADD COLUMN pdf_base64 TEXT`); } catch {}

// Admin columns for status tracking and notes (idempotent)
try { db.exec(`ALTER TABLE registrations ADD COLUMN status TEXT DEFAULT 'neu'`); } catch {}
try { db.exec(`ALTER TABLE registrations ADD COLUMN notiz TEXT`); } catch {}

export function insertRegistration(data: Record<string, unknown>) {
  const columns = Object.keys(data);
  const placeholders = columns.map(() => '?').join(', ');
  const values = columns.map(k => data[k] ?? null);

  const stmt = db.prepare(
    `INSERT INTO registrations (${columns.join(', ')}) VALUES (${placeholders})`
  );
  const result = stmt.run(...values);

  // Fire-and-forget webhook to N8N for notifications
  notifyN8N({ ...data, id: result.lastInsertRowid });

  return result;
}

const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || '';
const BREVO_API_KEY = process.env.BREVO_API_KEY || '';
const NOTIFY_EMAIL = process.env.NOTIFY_EMAIL || 'office@wirkaufendeineimmobilie.de';

// Brevo Double Opt-In (DOI) template ID — erstellt in Brevo unter
// "Transactional > Templates". Das Template enthält den Bestätigungslink
// {{ doubleoptin }} den Brevo automatisch einfügt.
const BREVO_DOI_TEMPLATE_ID = Number(process.env.BREVO_DOI_TEMPLATE_ID) || 0;

// Brevo-Listen-IDs pro Registrierungstyp — angelegt in Brevo unter
// "Contacts > Lists". Jeder Typ bekommt eine eigene Liste für
// saubere Segmentierung.
const BREVO_LIST_IDS: Record<string, number> = {
  investor: Number(process.env.BREVO_LIST_ID_INVESTOR) || 0,
  makler: Number(process.env.BREVO_LIST_ID_MAKLER) || 0,
  tippgeber: Number(process.env.BREVO_LIST_ID_TIPPGEBER) || 0,
};

// URL auf die Brevo nach Klick auf den Bestätigungslink weiterleitet
const BREVO_DOI_REDIRECT_URL = process.env.BREVO_DOI_REDIRECT_URL
  || 'https://wirkaufendeineimmobilie.de/api/confirm-welcome';

function notifyN8N(data: Record<string, unknown>) {
  // N8N webhook (if configured)
  if (N8N_WEBHOOK_URL) {
    fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).catch(() => {});
  }

  // Brevo email notification to Joachim (if configured)
  if (BREVO_API_KEY) {
    const typ = data.typ as string || 'unbekannt';
    const name = data.name as string || 'Unbekannt';
    const email = data.email as string || '';

    // Notify Joachim
    sendBrevoEmail({
      to: NOTIFY_EMAIL,
      subject: `Neue Registrierung: ${typ} — ${name}`,
      text: `Neue ${typ}-Registrierung auf wirkaufendeineimmobilie.de\n\nName: ${name}\nE-Mail: ${email}\nTelefon: ${data.telefon || 'nicht angegeben'}\nTyp: ${typ}\n${data.investor_typ ? 'Investor-Typ: ' + data.investor_typ + '\n' : ''}${data.erfahrung ? 'Erfahrung: ' + data.erfahrung + '\n' : ''}${data.maklerbuero ? 'Maklerbüro: ' + data.maklerbuero + '\n' : ''}${data.tippgeber_typ ? 'Tippgeber-Typ: ' + data.tippgeber_typ + '\n' : ''}${data.tippgeber_plz ? 'PLZ: ' + data.tippgeber_plz + '\n' : ''}${data.plz ? 'PLZ: ' + data.plz + '\n' : ''}\nZeitpunkt: ${new Date().toISOString()}\n\n— wirkaufendeineimmobilie.de`,
    });

    // Double Opt-In für investor, makler, tippgeber — Brevo sendet eine
    // Bestätigungsmail mit Klick-Link. Der Kontakt wird erst nach
    // Bestätigung als aktiv markiert (DSGVO-konform).
    // Für bewertung und lead-magnet wird KEIN DOI gesendet — das sind
    // einmalige vorvertragliche Maßnahmen bzw. Einmal-Downloads.
    if (email && ['investor', 'makler', 'tippgeber'].includes(typ)) {
      const listId = BREVO_LIST_IDS[typ];
      if (BREVO_DOI_TEMPLATE_ID && listId) {
        triggerBrevoDoubleOptIn({
          email,
          name,
          typ,
          listId,
          templateId: BREVO_DOI_TEMPLATE_ID,
          redirectionUrl: BREVO_DOI_REDIRECT_URL,
        });
      } else {
        // Fallback: Direkte Bestätigungsmail wenn DOI noch nicht konfiguriert
        sendBrevoEmail({
          to: email,
          subject: 'Deine Registrierung bei wirkaufendeineimmobilie.de',
          text: `Hallo ${name},\n\nvielen Dank für deine Registrierung bei wirkaufendeineimmobilie.de!\n\nWir haben deine Daten erhalten und melden uns innerhalb von 48 Stunden bei dir.\n\nBei Fragen erreichst du uns unter:\nTel: 0341 — 800 900 0\n\nViele Grüße\nJoachim Kleinke\nwirkaufendeineimmobilie.de\n\n---\nDu möchtest keine E-Mails mehr erhalten? Schreib uns an datenschutz@wirkaufendeineimmobilie.de`,
        });
      }
    }
  }
}

// Brevo Double Opt-In — erstellt einen Kontakt mit Bestätigungsmail.
// Der Kontakt wird erst aktiv nachdem der Empfänger auf den Link in
// der Bestätigungsmail klickt.
// API-Dokumentation: https://developers.brevo.com/reference/createdoicontact
export async function triggerBrevoDoubleOptIn(opts: {
  email: string;
  name: string;
  typ: string;
  listId: number;
  templateId: number;
  redirectionUrl: string;
}): Promise<void> {
  await fetch('https://api.brevo.com/v3/contacts/doubleOptinConfirmation', {
    method: 'POST',
    headers: {
      'api-key': BREVO_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: opts.email,
      attributes: {
        VORNAME: opts.name,
        TYP: opts.typ,
      },
      includeListIds: [opts.listId],
      templateId: opts.templateId,
      redirectionUrl: opts.redirectionUrl,
    }),
  });
}

function sendBrevoEmail(opts: { to: string; subject: string; text: string }) {
  fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': BREVO_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sender: { name: 'Joachim Kleinke — wirkaufendeineimmobilie.de', email: 'office@wirkaufendeineimmobilie.de' },
      to: [{ email: opts.to }],
      subject: opts.subject,
      textContent: opts.text,
    }),
  }).catch(() => {
    // Silent fail — notification is not critical
  });
}

export function insertKapitalanlegerLead(data: Record<string, unknown>) {
  const columns = Object.keys(data);
  const placeholders = columns.map(() => '?').join(', ');
  const values = columns.map(k => data[k] ?? null);
  const stmt = db.prepare(
    `INSERT INTO leads_kapitalanleger (${columns.join(', ')}) VALUES (${placeholders})`
  );
  return stmt.run(...values);
}

export function findRegistrationByRef(refNr: string): Record<string, unknown> | undefined {
  return db.prepare('SELECT * FROM registrations WHERE ref_nr = ?').get(refNr) as Record<string, unknown> | undefined;
}

export function confirmRegistrationByRef(refNr: string): void {
  db.prepare('UPDATE registrations SET doi_confirmed = 1 WHERE ref_nr = ?').run(refNr);
}

export function findKapitalanlegerByRef(refNr: string): Record<string, unknown> | undefined {
  return db.prepare('SELECT * FROM leads_kapitalanleger WHERE ref_nr = ?').get(refNr) as Record<string, unknown> | undefined;
}

export function confirmKapitalanlegerByRef(refNr: string): void {
  db.prepare('UPDATE leads_kapitalanleger SET doi_confirmed = 1 WHERE ref_nr = ?').run(refNr);
}

export function getRegistrations(opts: {
  typ?: string;
  status?: string;
  limit?: number;
  offset?: number;
  sort?: string;
  dir?: 'ASC' | 'DESC';
} = {}) {
  const ALLOWED_SORT = ['created_at', 'name', 'typ', 'status', 'email'];
  const col = opts.sort && ALLOWED_SORT.includes(opts.sort) ? opts.sort : 'created_at';
  const dir = opts.dir === 'ASC' ? 'ASC' : 'DESC';

  const conditions: string[] = [];
  const params: unknown[] = [];

  if (opts.typ) { conditions.push('typ = ?'); params.push(opts.typ); }
  if (opts.status) { conditions.push('status = ?'); params.push(opts.status); }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const limit = opts.limit ?? 50;
  const offset = opts.offset ?? 0;

  return db.prepare(
    `SELECT id, typ, name, email, telefon, status, notiz, pain_freitext,
            lead_magnet_data, investor_typ, erfahrung, maklerbuero,
            tippgeber_typ, tippgeber_plz, plz, immobilientyp, doi_confirmed, created_at
     FROM registrations ${where}
     ORDER BY ${col} ${dir} LIMIT ? OFFSET ?`
  ).all(...params, limit, offset) as Record<string, unknown>[];
}

export function countRegistrations(opts: { typ?: string; status?: string } = {}) {
  const conditions: string[] = [];
  const params: unknown[] = [];
  if (opts.typ) { conditions.push('typ = ?'); params.push(opts.typ); }
  if (opts.status) { conditions.push('status = ?'); params.push(opts.status); }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  return (db.prepare(`SELECT COUNT(*) as count FROM registrations ${where}`).get(...params) as { count: number }).count;
}

export function getRegistrationById(id: number) {
  return db.prepare(`SELECT * FROM registrations WHERE id = ?`).get(id) as Record<string, unknown> | undefined;
}

export function updateRegistration(id: number, fields: { status?: string; notiz?: string }) {
  const ALLOWED = ['status', 'notiz'];
  const keys = Object.keys(fields).filter(k => ALLOWED.includes(k));
  if (!keys.length) return;
  const sets = keys.map(k => `${k} = ?`).join(', ');
  const values = keys.map(k => (fields as Record<string, unknown>)[k]);
  db.prepare(`UPDATE registrations SET ${sets} WHERE id = ?`).run(...values, id);
}

export function getDashboardStats() {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7).toISOString();

  const typen = ['investor', 'makler', 'tippgeber', 'bewertung', 'lead-magnet'];
  const result: Record<string, { heute: number; woche: number; gesamt: number }> = {};

  for (const typ of typen) {
    result[typ] = {
      heute: (db.prepare(`SELECT COUNT(*) as c FROM registrations WHERE typ=? AND created_at >= ?`).get(typ, todayStart) as { c: number }).c,
      woche: (db.prepare(`SELECT COUNT(*) as c FROM registrations WHERE typ=? AND created_at >= ?`).get(typ, weekStart) as { c: number }).c,
      gesamt: (db.prepare(`SELECT COUNT(*) as c FROM registrations WHERE typ=?`).get(typ) as { c: number }).c,
    };
  }
  return result;
}

export function getKapitalanlegerLeads(opts: { limit?: number; offset?: number } = {}) {
  return db.prepare(
    `SELECT id, ref_nr, vorname, email, brutto_rendite, netto_cashflow_monat,
            kaufpreis, doi_confirmed, created_at
     FROM leads_kapitalanleger ORDER BY created_at DESC LIMIT ? OFFSET ?`
  ).all(opts.limit ?? 50, opts.offset ?? 0) as Record<string, unknown>[];
}

export default db;

