import type { APIRoute } from 'astro';
import puppeteer from 'puppeteer';
import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { calcKapitalanleger, buildTilgungsplan } from '../../lib/kapitalanleger-calc';
import type { KapitalanlegerInput } from '../../lib/kapitalanleger-calc';
import { generateKapitalanlegerPdfHtml } from '../../lib/kapitalanleger-pdf';
import { insertKapitalanlegerLead, triggerBrevoDoubleOptIn } from '../../lib/db';
import { generateRefNr, buildDoiRedirectUrl } from '../../lib/ref';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const portraitPath = join(__dirname, '../../../../public/images/joachim-kleinke-portrait.jpg');
let portraitB64 = '';
try {
  portraitB64 = `data:image/jpeg;base64,${readFileSync(portraitPath).toString('base64')}`;
} catch { /* portrait optional */ }

export const prerender = false;

const BREVO_DOI_TEMPLATE_ID = Number(process.env.BREVO_DOI_TEMPLATE_ID) || 0;
const BREVO_LIST_ID_KAPITALANLEGER = Number(process.env.BREVO_LIST_ID_KAPITALANLEGER) || 0;
const SITE_BASE_URL = process.env.SITE_URL || 'https://wirkaufendeineimmobilie.de';

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

    const refNr = generateRefNr('KA');
    const datum = new Date().toLocaleDateString('de-DE', {
      day: '2-digit', month: '2-digit', year: 'numeric',
    });

    const html = generateKapitalanlegerPdfHtml({ input, result, tilgungsplan, vorname, refNr, datum, portraitB64 });

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

    // Store in DB — doi_confirmed=0, pdf_base64 stored for retrieval in confirm-report
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
      doi_confirmed: 0,
      pdf_base64: pdfBase64,
    });

    // Trigger DOI — Brevo sends confirmation email, user clicks → confirm-report
    if (BREVO_DOI_TEMPLATE_ID && BREVO_LIST_ID_KAPITALANLEGER) {
      const redirectionUrl = buildDoiRedirectUrl(SITE_BASE_URL, 'confirm-report', refNr);
      try {
        await triggerBrevoDoubleOptIn({
          email,
          name: vorname,
          typ: 'kapitalanleger-rechner',
          listId: BREVO_LIST_ID_KAPITALANLEGER,
          templateId: BREVO_DOI_TEMPLATE_ID,
          redirectionUrl,
        });
      } catch (doiErr) {
        console.error('[kapitalanleger-report] DOI trigger failed:', doiErr);
        // Fail the whole request — user must retry, otherwise they'll never receive the confirmation email
        throw doiErr;
      }
    }

    return new Response(
      JSON.stringify({ success: true, status: 'doi_pending', refNr }),
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
