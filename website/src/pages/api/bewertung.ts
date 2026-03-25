import type { APIRoute } from 'astro';
import { insertRegistration } from '../../lib/db';
import db from '../../lib/db';
import { checkRateLimit } from '../../lib/rate-limit';
import { sendTransactionalEmail } from '../../lib/brevo';
import { calcPreisindikation } from '../../lib/preisindikation/calc';
import { generatePreisindikationPdf } from '../../lib/preisindikation/pdf';

export const prerender = false;

const SITE_URL = process.env.SITE_URL || 'https://wirkaufendeineimmobilie.de';

// POST /api/bewertung — Step 1: Kontaktdaten
// Speichert Lead, schickt Brevo-Mail mit Link zu /unterlagen
export const POST: APIRoute = async ({ request, clientAddress }) => {
  const ip = clientAddress || request.headers.get('x-forwarded-for') || 'unknown';
  if (!checkRateLimit(ip)) {
    return new Response(JSON.stringify({ error: 'Zu viele Anfragen.' }), {
      status: 429, headers: { 'Content-Type': 'application/json' },
    });
  }

  const data = await request.formData();

  // Honeypot
  if (data.get('website')) {
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const email = String(data.get('email') || '');
  const vorname = String(data.get('vorname') || '');
  const nachname = String(data.get('nachname') || '');
  const name = `${vorname} ${nachname}`.trim();
  const telefon = String(data.get('telefon') || '');
  const plz = String(data.get('plz') || '');

  const dringlichkeit = String(data.get('dringlichkeit') || '');
  const vermietet_form = data.get('vermietet_form'); // 'ja' oder 'nein' aus Formular-Dropdown

  const lead_magnet_data_obj: Record<string, string> = {};
  if (dringlichkeit) lead_magnet_data_obj.dringlichkeit = dringlichkeit;
  if (vermietet_form) lead_magnet_data_obj.vermietet_form = String(vermietet_form);

  const result = insertRegistration({
    typ: 'bewertung',
    name,
    email,
    telefon,
    plz,
    immobilientyp: data.get('typ') || null,
    lead_magnet_data: Object.keys(lead_magnet_data_obj).length ? JSON.stringify(lead_magnet_data_obj) : null,
    pain_freitext: data.get('pain_freitext') || null,
  });

  const id = result.lastInsertRowid;

  // Brevo-Mail mit Link zu /unterlagen (Step 2)
  const unterlagenUrl = `${SITE_URL}/unterlagen?email=${encodeURIComponent(email)}&plz=${encodeURIComponent(plz)}&ref=${id}&name=${encodeURIComponent(name)}`;

  if (email) {
    await sendTransactionalEmail({
      to: { email, name: vorname || name },
      subject: 'Ihre Erstbewertung — Schritt 2: Objekt-Details eingeben',
      htmlContent: `<p>Hallo ${vorname || name},</p>
<p>vielen Dank für Ihre Anfrage bei wirkaufendeineimmobilie.de.</p>
<p>Für Ihre kostenlose Erstbewertung benötigen wir noch ein paar Details zu Ihrer Immobilie. Das dauert etwa 2 Minuten:</p>
<p style="margin:24px 0">
  <a href="${unterlagenUrl}" style="background:#2563eb;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600;display:inline-block">Jetzt Objekt-Details eingeben →</a>
</p>
<p style="color:#6b7280;font-size:14px">Kein Dokument ist Pflicht. Was Sie haben, reicht.<br>Bei Fragen ruft Joachim Kleinke Sie persönlich zurück.</p>`,
    });
  }

  return new Response(JSON.stringify({ success: true, id }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

// PATCH /api/bewertung — Step 2: Objekt-Daten nachreichen
// Wird von /unterlagen aufgerufen wenn der User die Objekt-Details eingibt
export const PATCH: APIRoute = async ({ request }) => {
  const body = await request.json();

  const { ref, email, baujahr, wohnflaeche, energieklasse, heizung_baujahr,
          was_saniert, zustand, besonderheit, stellplatz,
          vermietet, etage, pain_freitext, situation, energieausweis_base64 } = body;

  if (!ref && !email) {
    return new Response(JSON.stringify({ success: false, error: 'ref oder email fehlt' }), {
      status: 400, headers: { 'Content-Type': 'application/json' },
    });
  }

  // Update per ref (ID) oder email (Fallback)
  const stmt = ref
    ? db.prepare(`UPDATE registrations SET
        baujahr=?, wohnflaeche=?, energieklasse=?, heizung_baujahr=?,
        was_saniert=?, zustand=?, besonderheit=?,
        stellplatz=?, vermietet=?, etage=?, pain_freitext=?,
        energieausweis_base64=?, objekt_step_done=1
        WHERE id=?`)
    : db.prepare(`UPDATE registrations SET
        baujahr=?, wohnflaeche=?, energieklasse=?, heizung_baujahr=?,
        was_saniert=?, zustand=?, besonderheit=?,
        stellplatz=?, vermietet=?, etage=?, pain_freitext=?,
        energieausweis_base64=?, objekt_step_done=1
        WHERE email=? AND typ='bewertung' ORDER BY id DESC LIMIT 1`);

  stmt.run(
    baujahr ?? null,
    wohnflaeche ?? null,
    energieklasse ?? null,
    heizung_baujahr ?? null,
    was_saniert ? JSON.stringify(was_saniert) : null,
    zustand ?? null,
    besonderheit ?? null,
    stellplatz ? 1 : 0,
    vermietet ? 1 : 0,
    etage ?? null,
    pain_freitext ?? null,
    energieausweis_base64 ?? null,
    ref || email,
  );

  // Merge situation into lead_magnet_data JSON
  if (situation && Array.isArray(situation) && situation.length > 0) {
    const existingRow = ref
      ? (db.prepare(`SELECT lead_magnet_data FROM registrations WHERE id=?`).get(ref) as any)
      : (db.prepare(`SELECT lead_magnet_data FROM registrations WHERE email=? AND typ='bewertung' ORDER BY id DESC LIMIT 1`).get(email) as any);
    const current = existingRow?.lead_magnet_data ? JSON.parse(existingRow.lead_magnet_data) : {};
    current.situation = situation;
    const updated = JSON.stringify(current);
    if (ref) {
      db.prepare(`UPDATE registrations SET lead_magnet_data=? WHERE id=?`).run(updated, ref);
    } else {
      db.prepare(`UPDATE registrations SET lead_magnet_data=? WHERE email=? AND typ='bewertung' ORDER BY id DESC LIMIT 1`).run(updated, email);
    }
  }

  // Benachrichtigung an Joachim mit allen Daten
  const row = ref
    ? db.prepare(`SELECT * FROM registrations WHERE id=?`).get(ref)
    : db.prepare(`SELECT * FROM registrations WHERE email=? AND typ='bewertung' ORDER BY id DESC LIMIT 1`).get(email);

  if (row) {
    const r = row as Record<string, unknown>;
    await sendTransactionalEmail({
      to: { email: 'office@wirkaufendeineimmobilie.de', name: 'Joachim Kleinke' },
      subject: `Bewertung komplett: ${r.name} — PLZ ${r.plz}`,
      htmlContent: `
        <h2>Neue vollständige Bewertungsanfrage</h2>
        <table style="border-collapse:collapse;width:100%">
          <tr><td style="padding:6px;font-weight:600">Name</td><td style="padding:6px">${r.name}</td></tr>
          <tr><td style="padding:6px;font-weight:600">E-Mail</td><td style="padding:6px">${r.email}</td></tr>
          <tr><td style="padding:6px;font-weight:600">Telefon</td><td style="padding:6px">${r.telefon || '—'}</td></tr>
          <tr><td style="padding:6px;font-weight:600">PLZ</td><td style="padding:6px">${r.plz}</td></tr>
          <tr><td style="padding:6px;font-weight:600">Baujahr</td><td style="padding:6px">${r.baujahr || '—'}</td></tr>
          <tr><td style="padding:6px;font-weight:600">Wohnfläche</td><td style="padding:6px">${r.wohnflaeche ? r.wohnflaeche + ' m²' : '—'}</td></tr>
          <tr><td style="padding:6px;font-weight:600">Energieklasse</td><td style="padding:6px">${r.energieklasse || '—'}</td></tr>
          <tr><td style="padding:6px;font-weight:600">Sanierungsstand</td><td style="padding:6px">${r.sanierungsstand || '—'}</td></tr>
          <tr><td style="padding:6px;font-weight:600">Was saniert</td><td style="padding:6px">${r.was_saniert || '—'}</td></tr>
          <tr><td style="padding:6px;font-weight:600">Zustand</td><td style="padding:6px">${r.zustand || '—'}</td></tr>
          <tr><td style="padding:6px;font-weight:600">Besonderheit</td><td style="padding:6px">${r.besonderheit || '—'}</td></tr>
          <tr><td style="padding:6px;font-weight:600">Stellplatz</td><td style="padding:6px">${r.stellplatz ? 'Ja' : 'Nein'}</td></tr>
          <tr><td style="padding:6px;font-weight:600">Vermietet</td><td style="padding:6px">${r.vermietet ? 'Ja' : 'Nein'}</td></tr>
          <tr><td style="padding:6px;font-weight:600">Etage</td><td style="padding:6px">${r.etage || '—'}</td></tr>
          ${r.pain_freitext ? `<tr><td style="padding:6px;font-weight:600;color:#dc2626">Pain (Freitext)</td><td style="padding:6px;color:#dc2626">${r.pain_freitext}</td></tr>` : ''}
          ${(() => {
            try {
              const lmd = r.lead_magnet_data ? JSON.parse(r.lead_magnet_data as string) : {};
              return lmd.situation?.length > 0 ? `<tr><td style="padding:6px;font-weight:600">Situation</td><td style="padding:6px">${(lmd.situation as string[]).join(', ')}</td></tr>` : '';
            } catch { return ''; }
          })()}
          ${r.energieausweis_base64 ? `<tr><td style="padding:6px;font-weight:600">Energieausweis</td><td style="padding:6px">✓ Hochgeladen</td></tr>` : ''}
        </table>
      `,
    });

    // Preisindikation berechnen + PDF generieren + an Eigentümer mailen
    try {
      const piResult = calcPreisindikation({
        plz: String(r.plz ?? ''),
        immobilientyp: String(r.immobilientyp ?? 'etw') as any,
        wohnflaeche: Number(r.wohnflaeche) || 0,
        baujahr: Number(r.baujahr) || 1970,
        energieklasse: r.energieklasse as string | null,
        zustand: r.zustand as string | null,
        sanierungsstand: r.sanierungsstand as string | null,
        vermietet: Boolean(r.vermietet),
      });

      const nameParts = String(r.name ?? '').split(' ');
      const vorname = nameParts[0] ?? '';
      const nachname = nameParts.slice(1).join(' ') || vorname;
      const datum = new Date().toLocaleDateString('de-DE');

      await generatePreisindikationPdf({
        vorname,
        nachname,
        email: String(r.email ?? ''),
        plz: String(r.plz ?? ''),
        immobilientyp: String(r.immobilientyp ?? 'etw'),
        wohnflaeche: r.wohnflaeche as number | null,
        baujahr: r.baujahr as number | null,
        energieklasse: r.energieklasse as string | null,
        zustand: r.zustand as string | null,
        sanierungsstand: r.sanierungsstand as string | null,
        vermietet: Boolean(r.vermietet),
        etage: r.etage as string | null,
        stellplatz: Boolean(r.stellplatz),
        result: piResult,
        datum,
      });
    } catch (err) {
      console.error('[PDF] Fehler bei PDF-Generierung:', err);
    }
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
