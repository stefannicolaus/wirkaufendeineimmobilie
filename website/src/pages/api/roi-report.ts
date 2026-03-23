import type { APIRoute } from 'astro';
import puppeteer from 'puppeteer';
import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { calcRoi, formatEur } from '../../lib/roi-calc';
import type { RoiInput } from '../../lib/roi-calc';
import { generatePdfHtml } from '../../lib/roi-pdf';
import { sendTransactionalEmail } from '../../lib/brevo';
import { insertRegistration } from '../../lib/db';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const portraitPath = join(__dirname, '../../../../public/images/joachim-kleinke-portrait.jpg');
let portraitB64 = '';
try {
  portraitB64 = `data:image/jpeg;base64,${readFileSync(portraitPath).toString('base64')}`;
} catch { /* portrait optional */ }

export const prerender = false;

function generateRefNr(): string {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `WKDI-${date}-${rand}`;
}

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

    // Calculate ROI
    const result = calcRoi(input);

    // Generate reference number and datum
    const refNr = generateRefNr();
    const datum = new Date().toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

    // Generate PDF HTML
    const html = generatePdfHtml({ input, result, vorname, email, refNr, datum, portraitB64 });

    // Launch Puppeteer to convert HTML → PDF
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

    const pdfAttachment = {
      content: pdfBase64,
      name: `ROI-Analyse-${refNr}.pdf`,
    };

    // Send email to user with PDF attachment
    await sendTransactionalEmail({
      to: { email, name: vorname },
      subject: `Ihre persönliche Deal-Analyse — Ref ${refNr}`,
      htmlContent: `<p>Hallo ${vorname},</p>
<p>anbei Ihre persönliche Deal-Analyse mit der Referenznummer <strong>${refNr}</strong>.</p>
<p>Das PDF enthält Ihre vollständige Kalkulation, den Deal Score und nächste Empfehlungen.</p>
<p>Bei Fragen melden Sie sich gerne direkt: office@wirkaufendeineimmobilie.de</p>
<br><p>Beste Grüße,<br>Joachim Kleinke</p>`,
      attachments: [pdfAttachment],
    });

    // Send notification to Joachim (no attachment needed)
    await sendTransactionalEmail({
      to: { email: 'office@wirkaufendeineimmobilie.de', name: 'Joachim Kleinke' },
      subject: `Neuer ROI-Rechner Lead: ${vorname} — ${refNr}`,
      htmlContent: `<p>Neuer ROI-Rechner Lead: ${vorname} (${email})</p>
<p>Ref-Nr: ${refNr}</p>
<p>Deal Score: ${result.deal_score} — ROI: ${result.roi_pct}%</p>
<p>Stadtteil: ${input.stadtteil}, Kaufpreis: ${formatEur(input.kaufpreis)}</p>`,
    });

    // Store in DB
    insertRegistration({
      typ: 'lead-magnet',
      email,
      name: vorname,
      lead_magnet_typ: 'roi-rechner',
      lead_magnet_data: JSON.stringify({ ...input, result, refNr }),
    });

    return new Response(
      JSON.stringify({ success: true, result, refNr }),
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
