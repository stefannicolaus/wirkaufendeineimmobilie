import type { APIRoute } from 'astro';
import puppeteer from 'puppeteer';
import { calcKapitalanleger, buildTilgungsplan, formatEur } from '../../lib/kapitalanleger-calc';
import type { KapitalanlegerInput } from '../../lib/kapitalanleger-calc';
import { generateKapitalanlegerPdfHtml } from '../../lib/kapitalanleger-pdf';
import { sendTransactionalEmail } from '../../lib/brevo';
import { insertKapitalanlegerLead } from '../../lib/db';

export const prerender = false;

function generateRefNr(): string {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `KA-${date}-${rand}`;
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();

    const {
      vorname, email,
      kaufpreis, baujahr, wohnflaeche, kaltmiete, hausgeld,
      darlehen, zinssatz, tilgung,
      grenzsteuersatz, haltedauer, gebaeudeanteil,
      diskontRate, mietsteigerung, leerstand,
    } = body;

    // Validate required fields
    const required = { vorname, email, kaufpreis, baujahr, wohnflaeche, kaltmiete, hausgeld, darlehen, zinssatz, tilgung, grenzsteuersatz };
    const missing = Object.entries(required)
      .filter(([, v]) => v === undefined || v === null || v === '')
      .map(([k]) => k);

    if (missing.length > 0) {
      return new Response(
        JSON.stringify({ success: false, error: `Pflichtfelder fehlen: ${missing.join(', ')}` }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const input: KapitalanlegerInput = {
      kaufpreis: Number(kaufpreis),
      baujahr: Number(baujahr),
      wohnflaeche: Number(wohnflaeche),
      kaltmiete: Number(kaltmiete),
      hausgeld: Number(hausgeld),
      darlehen: Number(darlehen),
      zinssatz: Number(zinssatz),
      tilgung: Number(tilgung),
      grenzsteuersatz: Number(grenzsteuersatz),
      haltedauer: Number(haltedauer ?? 10),
      gebaeudeanteil: Number(gebaeudeanteil ?? 80),
      diskontRate: Number(diskontRate ?? 5),
      mietsteigerung: Number(mietsteigerung ?? 2),
      leerstand: Number(leerstand ?? 3),
    };

    const result = calcKapitalanleger(input);
    const tilgungsplan = buildTilgungsplan(input);

    const refNr = generateRefNr();
    const datum = new Date().toLocaleDateString('de-DE', {
      day: '2-digit', month: '2-digit', year: 'numeric',
    });

    const html = generateKapitalanlegerPdfHtml({ input, result, tilgungsplan, vorname, refNr, datum });

    // Puppeteer → PDF
    let pdfBase64: string;
    const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
    const browser = await puppeteer.launch({
      executablePath: executablePath || undefined,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
      headless: true,
    });
    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });
      const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
      pdfBase64 = Buffer.from(pdfBuffer).toString('base64');
    } finally {
      await browser.close();
    }

    // Email to user
    await sendTransactionalEmail({
      to: { email, name: vorname },
      subject: `Ihre Kapitalanleger-Analyse — Ref ${refNr}`,
      htmlContent: `<p>Hallo ${vorname},</p>
<p>anbei Ihre persönliche Kapitalanleger-Analyse für ein Objekt mit Kaufpreis ${formatEur(input.kaufpreis)} (Ref: <strong>${refNr}</strong>).</p>
<p>Das PDF enthält: AfA-Berechnung §7 EStG, Cashflow nach Steuer §21 EStG, DCF-Rendite und Tilgungsplan.</p>
<p>Bei Fragen melden Sie sich gerne: office@wirkaufendeineimmobilie.de</p>
<br><p>Beste Grüße,<br>Joachim Kleinke</p>`,
      attachments: [{ content: pdfBase64, name: `Kapitalanleger-Analyse-${refNr}.pdf` }],
    });

    // Notification to Joachim
    await sendTransactionalEmail({
      to: { email: 'office@wirkaufendeineimmobilie.de', name: 'Joachim Kleinke' },
      subject: `Neuer Kapitalanleger-Lead: ${vorname} — ${refNr}`,
      htmlContent: `<p>Neuer Kapitalanleger-Rechner Lead: ${vorname} (${email})</p>
<p>Kaufpreis: ${formatEur(input.kaufpreis)} · Faktor: ${result.kaufpreisfaktor.toFixed(1)}× · Cashflow: ${formatEur(result.nettoMonat)}/Mo</p>
<p>AfA/J: ${formatEur(result.jahresAfA)} · NPV 10J: ${formatEur(result.npv10j)} · Ref: ${refNr}</p>`,
    });

    // DB
    insertKapitalanlegerLead({
      ref_nr: refNr,
      vorname,
      email,
      kaufpreis: input.kaufpreis,
      baujahr: input.baujahr,
      wohnflaeche: input.wohnflaeche,
      kaltmiete: input.kaltmiete,
      hausgeld: input.hausgeld,
      darlehen: input.darlehen,
      zinssatz: input.zinssatz,
      tilgung: input.tilgung,
      grenzsteuersatz: input.grenzsteuersatz,
      haltedauer: input.haltedauer,
      gebaeudeanteil: input.gebaeudeanteil,
      netto_cashflow_monat: result.nettoMonat,
      kaufpreisfaktor: result.kaufpreisfaktor,
      afa_jahr: result.jahresAfA,
      npv_10j: result.npv10j,
      npv_20j: result.npv20j,
      brutto_rendite: result.bruttoRendite,
    });

    return new Response(
      JSON.stringify({ success: true, result, refNr }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unbekannter Fehler';
    console.error('[kapitalanleger-report]', message);
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
};
