import type { APIRoute } from 'astro';
import puppeteer from 'puppeteer';
import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { calcRoi } from '../../lib/roi-calc';
import type { RoiInput } from '../../lib/roi-calc';
import { generatePdfHtml } from '../../lib/roi-pdf';
import { insertRegistration, triggerBrevoDoubleOptIn } from '../../lib/db';
import { generateRefNr, buildDoiRedirectUrl } from '../../lib/ref';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const portraitPath = join(__dirname, '../../../../public/images/joachim-kleinke-portrait.jpg');
let portraitB64 = '';
try {
  portraitB64 = `data:image/jpeg;base64,${readFileSync(portraitPath).toString('base64')}`;
} catch { /* portrait optional */ }

export const prerender = false;

const BREVO_DOI_TEMPLATE_ID = Number(process.env.BREVO_DOI_TEMPLATE_ID) || 0;
const BREVO_LIST_ID_ROI = Number(process.env.BREVO_LIST_ID_ROI) || 0;
const SITE_BASE_URL = process.env.SITE_URL || 'https://wirkaufendeineimmobilie.de';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();

    const { vorname, email, objekt_typ, stadtteil, kaufpreis, wohnflaeche, sanierungskosten, exit_strategie, eigenkapital_pct } = body;

    // Validate required fields
    const requiredFields = { vorname, email, objekt_typ, stadtteil, kaufpreis, wohnflaeche, sanierungskosten, exit_strategie, eigenkapital_pct };
    const missingFields = Object.entries(requiredFields)
      .filter(([, v]) => v === undefined || v === null || v === '')
      .map(([k]) => k);

    if (missingFields.length > 0) {
      return new Response(
        JSON.stringify({ success: false, error: `Pflichtfelder fehlen: ${missingFields.join(', ')}` }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Build RoiInput
    const input: RoiInput = {
      objekt_typ,
      stadtteil,
      kaufpreis: Number(kaufpreis),
      wohnflaeche: Number(wohnflaeche),
      sanierungskosten: Number(sanierungskosten),
      exit_strategie,
      eigenkapital_pct: Number(eigenkapital_pct),
    };

    const result = calcRoi(input);
    const refNr = generateRefNr('WKDI');
    const datum = new Date().toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

    const html = generatePdfHtml({ input, result, vorname, email, refNr, datum, portraitB64 });

    // Generate PDF and store as base64 — sent AFTER DOI confirmation
    const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
    const browser = await puppeteer.launch({
      executablePath: executablePath || undefined,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
      headless: true,
    });
    let pdfBase64: string;
    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });
      const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
      pdfBase64 = Buffer.from(pdfBuffer).toString('base64');
    } finally {
      await browser.close();
    }

    // Store in DB — doi_confirmed=0, pdf_base64 stored for retrieval in confirm-report
    insertRegistration({
      typ: 'lead-magnet',
      email,
      name: vorname,
      lead_magnet_typ: 'roi-rechner',
      ref_nr: refNr,
      doi_confirmed: 0,
      pdf_base64: pdfBase64,
      lead_magnet_data: JSON.stringify({ ...input, result, refNr }),
    });

    // Trigger DOI — Brevo sends confirmation email, user clicks → confirm-report
    if (BREVO_DOI_TEMPLATE_ID && BREVO_LIST_ID_ROI) {
      const redirectionUrl = buildDoiRedirectUrl(SITE_BASE_URL, 'confirm-report', refNr);
      try {
        await triggerBrevoDoubleOptIn({
          email,
          name: vorname,
          typ: 'roi-rechner',
          listId: BREVO_LIST_ID_ROI,
          templateId: BREVO_DOI_TEMPLATE_ID,
          redirectionUrl,
        });
      } catch (doiErr) {
        console.error('[roi-report] DOI trigger failed:', doiErr);
        // Fail the whole request — user must retry, otherwise they'll never receive the confirmation email
        throw doiErr;
      }
    }

    return new Response(
      JSON.stringify({ success: true, status: 'doi_pending', refNr }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unbekannter Fehler';
    console.error('[roi-report] Error:', message);
    return new Response(
      JSON.stringify({ success: false, error: 'Interner Fehler. Bitte erneut versuchen.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
