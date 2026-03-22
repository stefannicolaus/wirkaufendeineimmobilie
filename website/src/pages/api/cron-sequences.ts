// src/pages/api/cron-sequences.ts
// Daily cron endpoint — sends Day-3 and Day-7 emails to ROI leads
// Call via: GET /api/cron-sequences?secret=CRON_SECRET
// Set up on Coolify: cron job daily 08:00 → curl https://domain/api/cron-sequences?secret=...

import type { APIRoute } from 'astro';
import db from '../../lib/db';
import { sendTransactionalEmail } from '../../lib/brevo';

export const prerender = false;

const DAY3_SUBJECT = 'Dein ROI-Bericht: Der Steuereffekt, den die meisten Investoren unterschätzen';
const DAY7_SUBJECT = 'Bankgespräch vorbereiten — die eine Kennzahl, die Banken sehen wollen';

function day3Html(name: string): string {
  const firstName = name.split(' ')[0];
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  body { margin: 0; padding: 0; background: #f4f4f0; font-family: Georgia, serif; }
  .wrap { max-width: 620px; margin: 40px auto; background: #fff; }
  .header { background: #1a2744; padding: 32px 40px; }
  .logo { color: #fff; font-size: 16px; font-weight: 700; }
  .logo span { color: #c9a84c; }
  .body { padding: 40px; }
  .eyebrow { font-size: 11px; color: #999; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 12px; }
  h1 { font-size: 24px; color: #1a2744; line-height: 1.3; margin: 0 0 20px; }
  p { font-size: 16px; color: #444; line-height: 1.75; margin: 0 0 18px; }
  .dark-box { background: #1a2744; padding: 28px; margin: 24px 0; }
  .dark-box p { color: rgba(255,255,255,0.85); margin: 0 0 12px; }
  .dark-box p:last-child { margin: 0; }
  .cta { display: inline-block; background: #c9a84c; color: #1a2744; font-weight: 700; font-size: 15px; padding: 14px 28px; text-decoration: none; margin-top: 8px; }
  .sig { font-size: 14px; color: #888; margin-top: 32px; }
  .foot { padding: 24px 40px; border-top: 1px solid #eee; }
  .foot p { font-size: 11px; color: #bbb; margin: 0 0 6px; }
  .foot a { color: #999; }
</style>
</head>
<body>
<div class="wrap">
  <div class="header"><div class="logo">wirkaufen<span>deine</span>immobilie</div></div>
  <div class="body">
    <p class="eyebrow">Tag 3 &middot; Dein ROI-Bericht</p>
    <h1>Der Steuereffekt, den die meisten Investoren &uuml;bersehen</h1>

    <p>Hallo ${firstName},</p>

    <p>du hast vor 3 Tagen deinen ROI-Bericht angefordert. Ich hoffe, die Zahlen haben dir einen ersten &Uuml;berblick gegeben.</p>

    <p>Heute m&ouml;chte ich dir etwas zeigen, das in deinem Bericht noch nicht drin ist &mdash; aber f&uuml;r die echte Rendite entscheidend ist: <strong>die AfA</strong> (Absetzung f&uuml;r Abnutzung, &sect;&nbsp;7 EStG).</p>

    <p>Das Finanzamt erlaubt dir, den Geb&auml;udeanteil deiner Wohnung &uuml;ber 40&ndash;50 Jahre abzuschreiben. Praktisch bedeutet das:</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f6f0; border-left:3px solid #c9a84c; margin:24px 0; border-collapse:collapse;">
      <tr><td colspan="2" style="padding:16px 20px 8px; font-size:11px; text-transform:uppercase; letter-spacing:1px; color:#888;">Beispiel: Kaufpreis 180.000 &euro;, Baujahr 1960</td></tr>
      <tr><td style="padding:7px 20px; font-size:14px; color:#333; border-bottom:1px solid #ede9de;">Kaufpreis &times; 80% Geb&auml;ude &times; 2% AfA-Satz</td><td style="padding:7px 20px; font-size:14px; color:#333; text-align:right; border-bottom:1px solid #ede9de;">2.880 &euro;/Jahr</td></tr>
      <tr><td style="padding:7px 20px; font-size:14px; color:#333; border-bottom:1px solid #ede9de;">Monatliche AfA</td><td style="padding:7px 20px; font-size:14px; color:#333; text-align:right; border-bottom:1px solid #ede9de;">240 &euro;/Monat</td></tr>
      <tr><td style="padding:7px 20px; font-size:14px; color:#333; border-bottom:1px solid #ede9de;">Miete &minus; Zinsen &minus; Hausgeld &minus; AfA</td><td style="padding:7px 20px; font-size:14px; color:#c0392b; text-align:right; border-bottom:1px solid #ede9de;">&minus;60 &euro;/Monat steuerlich</td></tr>
      <tr><td style="padding:7px 20px 16px; font-size:14px; font-weight:700; color:#1a2744;">Steuererstattung (40% Satz)</td><td style="padding:7px 20px 16px; font-size:14px; font-weight:700; color:#1a2744; text-align:right;">+24 &euro;/Monat</td></tr>
    </table>

    <div class="dark-box">
      <p>Das ist kein Steuertrick &mdash; das ist Standard-Steuerrecht f&uuml;r jeden Immobilienk&auml;ufer.</p>
      <p>In Leipzig mit Kaufpreisen von 1.900&ndash;3.200 &euro;/m&sup2; rechnen sich Objekte, die auf den ersten Blick &ldquo;zu teuer&rdquo; wirken, nach Steuer oft deutlich besser.</p>
    </div>

    <p>N&auml;chste Email (Tag 7): Wie du das Bankgespr&auml;ch vorbereitest &mdash; und welche Kennzahl Banken wirklich sehen wollen.</p>

    <p>Fragen zum konkreten Objekt? Ruf einfach an:</p>

    <a href="tel:+493418009000" class="cta">0341 &mdash; 800 900 0 &middot; Kostenlos</a>

    <p class="sig">Joachim Kleinke<br>wirkaufendeineimmobilie.de &middot; Leipzig</p>
  </div>
  <div class="foot">
    <p>Du erh&auml;ltst diese Email, weil du unseren ROI-Bericht angefordert hast.</p>
    <p><a href="https://wirkaufendeineimmobilie.de/impressum">Impressum</a></p>
  </div>
</div>
</body></html>`;
}

function day7Html(name: string): string {
  const firstName = name.split(' ')[0];
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  body { margin: 0; padding: 0; background: #f4f4f0; font-family: Georgia, serif; }
  .wrap { max-width: 620px; margin: 40px auto; background: #fff; }
  .header { background: #1a2744; padding: 32px 40px; }
  .logo { color: #fff; font-size: 16px; font-weight: 700; }
  .logo span { color: #c9a84c; }
  .body { padding: 40px; }
  .eyebrow { font-size: 11px; color: #999; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 12px; }
  h1 { font-size: 24px; color: #1a2744; line-height: 1.3; margin: 0 0 20px; }
  p { font-size: 16px; color: #444; line-height: 1.75; margin: 0 0 18px; }
  .metric-row { display: flex; gap: 16px; margin: 24px 0; }
  .metric { flex: 1; background: #f8f6f0; border-top: 3px solid #c9a84c; padding: 20px; }
  .metric-label { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #888; margin-bottom: 8px; }
  .metric-value { font-size: 22px; font-weight: 700; color: #1a2744; }
  .metric-desc { font-size: 12px; color: #888; margin-top: 4px; }
  .cta { display: inline-block; background: #c9a84c; color: #1a2744; font-weight: 700; font-size: 15px; padding: 14px 28px; text-decoration: none; margin-top: 8px; }
  .sig { font-size: 14px; color: #888; margin-top: 32px; }
  .foot { padding: 24px 40px; border-top: 1px solid #eee; }
  .foot p { font-size: 11px; color: #bbb; margin: 0 0 6px; }
  .foot a { color: #999; }
</style>
</head>
<body>
<div class="wrap">
  <div class="header"><div class="logo">wirkaufen<span>deine</span>immobilie</div></div>
  <div class="body">
    <p class="eyebrow">Tag 7 &middot; Dein ROI-Bericht</p>
    <h1>Das Bankgespr&auml;ch: Die eine Zahl, die &uuml;ber Finanzierung entscheidet</h1>

    <p>Hallo ${firstName},</p>

    <p>letzte Woche haben wir &uuml;ber die AfA gesprochen &mdash; den Steuereffekt, der deine echte Rendite deutlich besser macht als sie auf dem Papier aussieht.</p>

    <p>Heute geht es ums Bankgespr&auml;ch. Viele Investoren kommen zur Bank mit ROI und Rendite &mdash; und wundern sich, warum die Finanzierung trotzdem schwierig ist. Der Grund: Banken denken in einer anderen Kennzahl.</p>

    <p><strong>DSCR &mdash; Debt Service Coverage Ratio</strong></p>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0; border-collapse:collapse;">
      <tr>
        <td width="48%" style="background:#f8f6f0; border-top:3px solid #c9a84c; padding:20px; vertical-align:top;">
          <div style="font-size:11px; text-transform:uppercase; letter-spacing:1px; color:#888; margin-bottom:8px;">DSCR-Formel</div>
          <div style="font-size:16px; font-weight:700; color:#1a2744;">Netto-Mieteinnahmen</div>
          <div style="font-size:14px; color:#888; margin:4px 0;">&divide; Schuldendienst (Zins + Tilgung)</div>
        </td>
        <td width="4%"></td>
        <td width="48%" style="background:#1a2744; padding:20px; vertical-align:top;">
          <div style="font-size:11px; text-transform:uppercase; letter-spacing:1px; color:rgba(255,255,255,0.5); margin-bottom:8px;">Banken wollen sehen</div>
          <div style="font-size:22px; font-weight:700; color:#c9a84c;">&ge; 1,2</div>
          <div style="font-size:13px; color:rgba(255,255,255,0.7); margin-top:4px;">Mieteinnahmen 20% &uuml;ber Schuldendienst</div>
        </td>
      </tr>
    </table>

    <p>In Leipzig ist das bei sani&shy;erungs&shy;bed&uuml;rftigen Objekten oft das Hauptargument f&uuml;r den Kauf: Sie kosten weniger, die Mietpotenziale nach Renovierung sind h&ouml;her &mdash; das f&uuml;hrt zu besseren DSCR-Werten als bei teuren Neubauten.</p>

    <p>Soll ich dir eine Muster-Kalkulation f&uuml;r dein Bankgespr&auml;ch erstellen? Das ist der n&auml;chste Schritt, den wir gemeinsam angehen k&ouml;nnen:</p>

    <a href="tel:+493418009000" class="cta">0341 &mdash; 800 900 0 &middot; Termin vereinbaren</a>

    <p class="sig">Joachim Kleinke<br>wirkaufendeineimmobilie.de &middot; Leipzig</p>
  </div>
  <div class="foot">
    <p>Du erh&auml;ltst diese Email, weil du unseren ROI-Bericht angefordert hast.</p>
    <p><a href="https://wirkaufendeineimmobilie.de/impressum">Impressum</a></p>
  </div>
</div>
</body></html>`;
}

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const secret = url.searchParams.get('secret');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || secret !== cronSecret) {
    return new Response('Unauthorized', { status: 401 });
  }

  const now = new Date();
  const results: string[] = [];

  // Day-3: leads registered 3 days ago (between 71h and 73h ago)
  const day3Start = new Date(now.getTime() - 73 * 3600 * 1000).toISOString();
  const day3End   = new Date(now.getTime() - 71 * 3600 * 1000).toISOString();
  const day3Leads = db.prepare(
    `SELECT id, name, email FROM registrations WHERE typ = 'lead-magnet' AND created_at BETWEEN ? AND ? AND sequence_day3_sent IS NULL`
  ).all(day3Start, day3End) as { id: number; name: string; email: string }[];

  for (const lead of day3Leads) {
    try {
      await sendTransactionalEmail({
        to: { email: lead.email, name: lead.name },
        subject: DAY3_SUBJECT,
        htmlContent: day3Html(lead.name),
      });
      db.prepare(`UPDATE registrations SET sequence_day3_sent = datetime('now') WHERE id = ?`).run(lead.id);
      results.push(`Day3 sent: ${lead.email}`);
    } catch (e) {
      results.push(`Day3 FAILED: ${lead.email} — ${e}`);
    }
  }

  // Day-7: leads registered 7 days ago (between 167h and 169h ago)
  const day7Start = new Date(now.getTime() - 169 * 3600 * 1000).toISOString();
  const day7End   = new Date(now.getTime() - 167 * 3600 * 1000).toISOString();
  const day7Leads = db.prepare(
    `SELECT id, name, email FROM registrations WHERE typ = 'lead-magnet' AND created_at BETWEEN ? AND ? AND sequence_day7_sent IS NULL`
  ).all(day7Start, day7End) as { id: number; name: string; email: string }[];

  for (const lead of day7Leads) {
    try {
      await sendTransactionalEmail({
        to: { email: lead.email, name: lead.name },
        subject: DAY7_SUBJECT,
        htmlContent: day7Html(lead.name),
      });
      db.prepare(`UPDATE registrations SET sequence_day7_sent = datetime('now') WHERE id = ?`).run(lead.id);
      results.push(`Day7 sent: ${lead.email}`);
    } catch (e) {
      results.push(`Day7 FAILED: ${lead.email} — ${e}`);
    }
  }

  return new Response(JSON.stringify({ ok: true, processed: results.length, results }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
