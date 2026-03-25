// src/pages/api/confirm-welcome.ts
import type { APIRoute } from 'astro';
import db from '../../lib/db';
import { sendTransactionalEmail } from '../../lib/brevo';

export const prerender = false;

const SITE_URL = process.env.SITE_URL || 'https://wirkaufendeineimmobilie.de';

// Template-IDs für Welcome-Mails pro Segment — in .env setzen
const WELCOME_TEMPLATE_IDS: Record<string, number> = {
  investor: Number(process.env.BREVO_TEMPLATE_ID_WELCOME_INVESTOR) || 0,
  tippgeber: Number(process.env.BREVO_TEMPLATE_ID_WELCOME_TIPPGEBER) || 0,
  makler: Number(process.env.BREVO_TEMPLATE_ID_WELCOME_MAKLER) || 0,
};

// Welcome-Mail-Texte als Fallback wenn Templates noch nicht in Brevo angelegt
const WELCOME_CONTENT: Record<string, { subject: string; benefits: string[] }> = {
  investor: {
    subject: '[Vorname], willkommen — was als nächstes passiert',
    benefits: [
      'Off-Market Objekte bevor sie auf ImmoScout landen',
      'Vorgeprüft mit Renditepotenzial & Sanierungskalkulation',
      'Kein Bietergefecht — diskretes Angebotsverfahren',
    ],
  },
  tippgeber: {
    subject: '[Vorname], willkommen — was als nächstes passiert',
    benefits: [
      'Provision bei Abschluss — du gibst Tipp, wir machen alles andere',
      'Du weißt immer was aus deinem Tipp wird',
      'Schnelle Abwicklung nach Notartermin',
    ],
  },
  makler: {
    subject: '[Vorname], willkommen — was als nächstes passiert',
    benefits: [
      'Off-Market Deal-Flow für deine Kunden',
      'Klare Provisionsteilung vorab vereinbart',
      'Kooperation, keine Konkurrenz',
    ],
  },
};

export const GET: APIRoute = async ({ url, redirect }) => {
  const email = url.searchParams.get('email') || '';

  if (!email) {
    return redirect(`${SITE_URL}/danke?typ=doi-bestaetigt`, 302);
  }

  // Lead in DB finden und doi_confirmed setzen
  const row = db.prepare(
    `SELECT * FROM registrations WHERE email = ? AND typ IN ('investor','makler','tippgeber')
     ORDER BY id DESC LIMIT 1`
  ).get(email) as Record<string, unknown> | undefined;

  if (row) {
    db.prepare(`UPDATE registrations SET doi_confirmed = 1 WHERE id = ?`).run(row.id);

    const typ = String(row.typ || '');
    const vorname = String(row.name || '').split(' ')[0] || String(row.name || '');
    const content = WELCOME_CONTENT[typ];
    const templateId = WELCOME_TEMPLATE_IDS[typ];

    if (content) {
      const subject = content.subject.replace('[Vorname]', vorname);
      const benefitsList = content.benefits.map(b => `<li>${b}</li>`).join('');
      const koopHinweis = ['investor', 'tippgeber'].includes(typ)
        ? `<p style="margin-top:1.5rem;font-style:italic;color:#6b7280">Nach Prüfung Ihrer Anmeldung erhalten Sie unsere Kooperationsvereinbarung — das ist unser Standard für alle Partner.</p>`
        : '';

      await sendTransactionalEmail({
        to: { email, name: vorname },
        subject,
        // Wenn Brevo-Template konfiguriert, dieses nutzen — sonst HTML-Fallback
        ...(templateId
          ? { templateId, params: { VORNAME: vorname } }
          : {
              htmlContent: `
                <p>Hallo ${vorname},</p>
                <p>deine Anmeldung ist bestätigt — willkommen bei wirkaufendeineimmobilie.de.</p>
                <p><strong>Was du von uns bekommst:</strong></p>
                <ul>${benefitsList}</ul>
                <p>Wir melden uns persönlich bei dir.</p>
                ${koopHinweis}
                <p>Joachim Kleinke & Team<br>wirkaufendeineimmobilie.de<br>Tel: 0341 — 800 900 0</p>
              `,
            }),
      });
    }
  }

  return redirect(`${SITE_URL}/danke?typ=doi-bestaetigt`, 302);
};
