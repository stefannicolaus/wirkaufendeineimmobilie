// src/lib/preisindikation/pdf.ts
import puppeteer from 'puppeteer';
import { sendTransactionalEmail } from '../brevo.js';
import type { PreisindikationResult } from './calc.js';
import { formatEur } from './calc.js';

const AMPEL_FARBEN = { gruen: '#16a34a', gelb: '#d97706', rot: '#dc2626' };
const AMPEL_LABEL = {
  gruen: 'Günstig', gelb: 'Im Blick behalten', rot: 'Handlungsbedarf',
};

const AMPEL_TEXTE = {
  preispotenzial: {
    gruen: 'Energiestandard und Zustand sprechen für einen guten Marktpreis.',
    gelb: 'Einige Faktoren beeinflussen den Preis — aber das ist verhandelbar.',
    rot: 'Energieklasse und Zustand drücken auf den Preis. Das ist kein Makel — es ist ein kalkulierbarer Faktor, wenn man weiß was er bedeutet.',
  },
  vermarktungsdauer: {
    gruen: 'Gute Voraussetzungen für eine zügige Vermarktung.',
    gelb: 'Mit der richtigen Strategie ist eine gute Vermarktung möglich.',
    rot: 'Vermietungsstatus oder Lage verlängern typischerweise die Vermarktungszeit. Joachim kennt die passenden Käufer.',
  },
  aufwertungspotenzial: {
    gruen: 'Die Immobilie ist bereits gut aufgestellt — wenig Aufwertungsbedarf.',
    gelb: 'Gezielte Maßnahmen könnten den Verkaufspreis spürbar verbessern.',
    rot: 'Größere Modernisierungen wären möglich — ob sie sich lohnen, hängt vom Ziel ab.',
  },
};

export interface PdfInput {
  vorname: string;
  nachname: string;
  email: string;
  plz: string;
  immobilientyp: string;
  wohnflaeche?: number | null;
  baujahr?: number | null;
  energieklasse?: string | null;
  zustand?: string | null;
  sanierungsstand?: string | null;
  vermietet?: boolean;
  etage?: string | null;
  stellplatz?: boolean;
  result: PreisindikationResult;
  datum: string;
  // Optionale Überschreibungen durch Joachim im Admin-Bereich
  customAnschreiben?: string | null;
  customPreisMin?: number | null;
  customPreisMax?: number | null;
}

function ampelDot(color: string): string {
  return `<span style="display:inline-block;width:12px;height:12px;border-radius:50%;background:${color};margin-right:8px;vertical-align:middle;"></span>`;
}

function generateHtml(opts: PdfInput): string {
  const { vorname, nachname, plz, immobilientyp, wohnflaeche, baujahr, energieklasse, zustand, vermietet, result, datum } = opts;
  const name = `${vorname} ${nachname}`;
  const typLabel = immobilientyp === 'etw' ? 'Eigentumswohnung' : immobilientyp === 'efh' ? 'Einfamilienhaus' : immobilientyp === 'mfh' ? 'Mehrfamilienhaus' : 'Grundstück';
  const anchor = `Ihre ${wohnflaeche ? wohnflaeche + 'm² ' : ''}${typLabel} in ${plz}`;

  // Joachim kann Preis im Admin überschreiben
  const preisMin = opts.customPreisMin ?? result.preisMin;
  const preisMax = opts.customPreisMax ?? result.preisMax;

  const preisBlock = result.aufAnfrage && !opts.customPreisMin
    ? `<p style="font-size:22px;font-weight:700;color:#1e293b;">Auf persönliche Anfrage</p>
       <p style="color:#64748b;margin-top:8px;">Für Mehrfamilienhäuser und Grundstücke erstellt Joachim Kleinke die Kalkulation individuell.</p>`
    : `<p style="font-size:32px;font-weight:800;color:#1e3a5f;letter-spacing:-1px;">
         ${formatEur(preisMin)} – ${formatEur(preisMax)}
       </p>
       <p style="color:#64748b;margin-top:4px;">ca. ${formatEur(Math.round(preisMin / (wohnflaeche || 1)))} – ${formatEur(Math.round(preisMax / (wohnflaeche || 1)))} / m²</p>`;

  return `<!DOCTYPE html><html lang="de"><head><meta charset="UTF-8">
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: Georgia, serif; color: #1e293b; background: white; }
  .cover { width:100%; min-height:100vh; background: linear-gradient(160deg,#0f172a 0%,#1e3a5f 60%,#0f172a 100%);
    color:white; padding:56px 64px; display:flex; flex-direction:column; page-break-after:always; }
  .cover-logo { font-size:16px; font-weight:700; letter-spacing:-0.5px; }
  .cover-logo span { color:#2563eb; }
  .cover-eyebrow { font-size:11px; letter-spacing:3px; text-transform:uppercase; color:#2563eb;
    font-family:Arial,sans-serif; margin-top:auto; margin-bottom:16px; }
  .cover-title { font-size:40px; font-weight:800; line-height:1.1; margin-bottom:24px; }
  .cover-meta { font-size:14px; color:rgba(255,255,255,0.7); font-family:Arial,sans-serif; }
  .page { padding:48px 64px; page-break-after:always; }
  .section-label { font-size:10px; letter-spacing:3px; text-transform:uppercase; color:#64748b;
    font-family:Arial,sans-serif; margin-bottom:24px; }
  h2 { font-size:24px; font-weight:700; margin-bottom:16px; color:#0f172a; }
  .ampel-card { border-left:4px solid; padding:16px 20px; margin-bottom:16px; border-radius:0 6px 6px 0; }
  .ampel-card.gruen { border-color:#16a34a; background:#f0fdf4; }
  .ampel-card.gelb { border-color:#d97706; background:#fffbeb; }
  .ampel-card.rot { border-color:#dc2626; background:#fef2f2; }
  .ampel-title { font-size:13px; font-weight:700; margin-bottom:6px; font-family:Arial,sans-serif; }
  .ampel-text { font-size:13px; color:#374151; line-height:1.5; }
  table { width:100%; border-collapse:collapse; margin-top:16px; }
  td { padding:10px 0; border-bottom:1px solid #f1f5f9; font-size:13px; }
  td:first-child { color:#64748b; width:40%; font-family:Arial,sans-serif; }
  .preis-block { background:#f8fafc; border-radius:8px; padding:32px; text-align:center; margin:24px 0; }
  .disclaimer { font-size:11px; color:#94a3b8; line-height:1.6; margin-top:32px; font-family:Arial,sans-serif; }
  .cta-box { background:#1e3a5f; color:white; border-radius:8px; padding:32px; margin-top:32px; text-align:center; }
</style>
</head><body>

<!-- COVER -->
<div class="cover">
  <div class="cover-logo">wirkaufen<span>deine</span>immobilie.de</div>
  <div class="cover-eyebrow">Persönliche Preisindikation</div>
  <div class="cover-title">Ihre Immobilie.<br>Ihr Marktpreis.</div>
  <div class="cover-meta">
    Erstellt für: ${name}<br>
    Objekt: ${anchor}<br>
    Datum: ${datum}
  </div>
</div>

<!-- ANSCHREIBEN -->
<div class="page">
  <div class="section-label">Einschätzung</div>
  <h2>Hallo ${vorname},</h2>
  <p style="margin-bottom:24px;line-height:1.7;">${result.einleitungssatz}</p>
  <p style="margin-bottom:32px;line-height:1.7;color:#374151;">
    Hier sind die drei Faktoren, die für <strong>${anchor}</strong> aktuell am stärksten auf den Preis wirken:
  </p>

  <div class="ampel-card ${result.ampeln.preispotenzial}">
    <div class="ampel-title">${ampelDot(AMPEL_FARBEN[result.ampeln.preispotenzial])}Preispotenzial — ${AMPEL_LABEL[result.ampeln.preispotenzial]}</div>
    <div class="ampel-text">${AMPEL_TEXTE.preispotenzial[result.ampeln.preispotenzial]}</div>
  </div>

  <div class="ampel-card ${result.ampeln.vermarktungsdauer}">
    <div class="ampel-title">${ampelDot(AMPEL_FARBEN[result.ampeln.vermarktungsdauer])}Vermarktungsdauer — ${AMPEL_LABEL[result.ampeln.vermarktungsdauer]}</div>
    <div class="ampel-text">${AMPEL_TEXTE.vermarktungsdauer[result.ampeln.vermarktungsdauer]}</div>
  </div>

  <div class="ampel-card ${result.ampeln.aufwertungspotenzial}">
    <div class="ampel-title">${ampelDot(AMPEL_FARBEN[result.ampeln.aufwertungspotenzial])}Aufwertungspotenzial — ${AMPEL_LABEL[result.ampeln.aufwertungspotenzial]}</div>
    <div class="ampel-text">${AMPEL_TEXTE.aufwertungspotenzial[result.ampeln.aufwertungspotenzial]}</div>
  </div>

  <p style="margin-top:32px;color:#374151;line-height:1.7;">
    Joachim Kleinke wird Sie in den nächsten <strong>48 Stunden</strong> persönlich zurückrufen, um Ihre Preisindikation zu besprechen.
  </p>
</div>

<!-- OBJEKT-ÜBERSICHT -->
<div class="page">
  <div class="section-label">Ihre Immobilie</div>
  <h2>${anchor}</h2>
  <table>
    <tr><td>Immobilientyp</td><td>${typLabel}</td></tr>
    ${wohnflaeche ? `<tr><td>Wohnfläche</td><td>${wohnflaeche} m²</td></tr>` : ''}
    ${baujahr ? `<tr><td>Baujahr</td><td>${baujahr}</td></tr>` : ''}
    ${energieklasse ? `<tr><td>Energieklasse</td><td>${energieklasse}</td></tr>` : ''}
    ${zustand ? `<tr><td>Zustand</td><td>${zustand}</td></tr>` : ''}
    ${opts.sanierungsstand ? `<tr><td>Sanierungsstand</td><td>${opts.sanierungsstand}</td></tr>` : ''}
    <tr><td>Vermietungsstatus</td><td>${vermietet ? 'Vermietet' : 'Selbst genutzt / leer'}</td></tr>
    ${opts.stellplatz ? `<tr><td>Stellplatz</td><td>Vorhanden</td></tr>` : ''}
    ${opts.etage ? `<tr><td>Etage</td><td>${opts.etage}</td></tr>` : ''}
  </table>
</div>

<!-- PREISINDIKATION -->
<div class="page">
  <div class="section-label">Preisindikation</div>
  <h2>Was Ihre Immobilie heute wert ist</h2>
  <div class="preis-block">
    <p style="font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#64748b;font-family:Arial,sans-serif;margin-bottom:16px;">
      Aktuelle Marktindikation für ${anchor}
    </p>
    ${preisBlock}
  </div>
  <p style="line-height:1.7;color:#374151;margin-bottom:16px;">
    Diese Indikation basiert auf den aktuellen Vergleichswerten des Gutachterausschusses Leipzig (Marktbericht 2025) und berücksichtigt Energiestandard, Zustand und Lage Ihrer Immobilie.
  </p>
  <div class="cta-box">
    <p style="font-size:18px;font-weight:700;margin-bottom:8px;">Nächster Schritt</p>
    <p style="opacity:0.85;line-height:1.6;">
      Joachim Kleinke ruft Sie persönlich zurück. Im Gespräch klären wir, ob und wie wir Ihnen helfen können — ohne Druck, ohne Verpflichtung.
    </p>
    <p style="margin-top:16px;font-size:13px;opacity:0.7;">0341 — 800 900 0 · office@wirkaufendeineimmobilie.de</p>
  </div>
  <p class="disclaimer">
    Diese Preisindikation wurde auf Basis von Marktdaten erstellt und stellt kein Gutachten im Sinne des § 194 BauGB dar.
    Sie dient ausschließlich der ersten Orientierung. Für eine rechtsverbindliche Wertermittlung ist ein Sachverständigengutachten erforderlich.
    Erstellt durch wirkaufendeineimmobilie.de — ${datum}
  </p>
</div>

</body></html>`;
}

export async function generatePreisindikationPdf(opts: PdfInput): Promise<{ pdfBase64: string; dateiname: string }> {
  const html = generateHtml(opts);

  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });
  const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
  await browser.close();

  const pdfBase64 = Buffer.from(pdfBuffer).toString('base64');
  const dateiname = `Preisindikation-${opts.nachname}-${opts.datum.replace(/\./g, '')}.pdf`;

  return { pdfBase64, dateiname };
}

export async function sendPreisindikationToSeller(opts: PdfInput): Promise<void> {
  const { pdfBase64, dateiname } = await generatePreisindikationPdf(opts);

  const typLabel = opts.immobilientyp === 'etw' ? 'Eigentumswohnung' : opts.immobilientyp === 'efh' ? 'Einfamilienhaus' : 'Immobilie';

  const anschreiben = opts.customAnschreiben
    ? `<p>Hallo ${opts.vorname},</p>${opts.customAnschreiben}<p>Viele Grüße,<br>Joachim Kleinke<br>wirkaufendeineimmobilie.de</p>`
    : opts.result.aufAnfrage && !opts.customPreisMin
    ? `<p>Hallo ${opts.vorname},</p>
       <p>vielen Dank für deine Anfrage. Im Anhang findest du deine erste Objektübersicht. Joachim Kleinke erstellt die Preisindikation für deine Immobilie persönlich und meldet sich innerhalb von 48 Stunden bei dir.</p>
       <p>Viele Grüße,<br>Joachim Kleinke<br>wirkaufendeineimmobilie.de</p>`
    : `<p>Hallo ${opts.vorname},</p>
       <p>${opts.result.einleitungssatz}</p>
       <p>Im Anhang findest du deine persönliche Preisindikation für <strong>${opts.wohnflaeche ? opts.wohnflaeche + 'm² ' : ''}${typLabel} in ${opts.plz}</strong> — erstellt auf Basis der aktuellen Marktdaten des Gutachterausschusses Leipzig.</p>
       <p>Joachim Kleinke ruft dich in den nächsten 48 Stunden persönlich zurück.</p>
       <p>Viele Grüße,<br>Joachim Kleinke<br>wirkaufendeineimmobilie.de</p>`;

  await sendTransactionalEmail({
    to: { email: opts.email, name: opts.vorname },
    subject: `Deine persönliche Preisindikation — ${opts.wohnflaeche ? opts.wohnflaeche + 'm² ' : ''}in ${opts.plz}`,
    htmlContent: anschreiben,
    attachments: [{ content: pdfBase64, name: dateiname }],
  });
}
