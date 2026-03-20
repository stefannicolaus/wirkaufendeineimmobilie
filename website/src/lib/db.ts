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
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

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

    // Confirm to registrant (only for investor, makler, tippgeber — not bewertung/lead-magnet)
    if (email && ['investor', 'makler', 'tippgeber'].includes(typ)) {
      sendBrevoEmail({
        to: email,
        subject: 'Deine Registrierung bei wirkaufendeineimmobilie.de',
        text: `Hallo ${name},\n\nvielen Dank für deine Registrierung bei wirkaufendeineimmobilie.de!\n\nWir haben deine Daten erhalten und melden uns innerhalb von 48 Stunden bei dir.\n\nBei Fragen erreichst du uns unter:\nTel: 0341 — 800 900 0\n\nViele Grüße\nJoachim Kleinke\nwirkaufendeineimmobilie.de`,
      });
    }
  }
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

export default db;
