// src/lib/kapitalanleger-pdf.ts
import type { KapitalanlegerInput, KapitalanlegerResult, TilgungsplanRow } from './kapitalanleger-calc';
import { formatEur } from './kapitalanleger-calc';

export function generateKapitalanlegerPdfHtml(opts: {
  input: KapitalanlegerInput;
  result: KapitalanlegerResult;
  tilgungsplan: TilgungsplanRow[];
  vorname: string;
  refNr: string;
  datum: string;
  portraitB64?: string;
}): string {
  const { input, result, tilgungsplan, vorname, refNr, datum, portraitB64 } = opts;
  const afaRatePct = (result.afaRate * 100).toFixed(1);

  const tilgungsRows = tilgungsplan.map(row => `
    <tr>
      <td>${row.jahr}</td>
      <td>${formatEur(row.restschuld)}</td>
      <td>${formatEur(row.zinsen)}</td>
      <td>${formatEur(row.tilgung)}</td>
      <td style="color:${row.cashflow >= 0 ? '#1a7a4a' : '#b91c1c'}">${formatEur(row.cashflow)}</td>
    </tr>
  `).join('');

  return `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8">
<style>
  body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #1a1a1a; font-size: 12px; margin: 0; padding: 32px; }
  h1 { font-size: 22px; color: #1a1a1a; margin-bottom: 4px; }
  .subtitle { color: #666; font-size: 12px; margin-bottom: 24px; }
  .meta { font-size: 11px; color: #999; margin-bottom: 32px; }
  .section-title { font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #444; border-bottom: 1px solid #e5e5e5; padding-bottom: 6px; margin: 24px 0 12px; }
  .kpi-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-bottom: 24px; }
  .kpi { background: #f8f8f8; border: 1px solid #e8e8e8; border-radius: 6px; padding: 12px; }
  .kpi-label { font-size: 10px; color: #888; text-transform: uppercase; letter-spacing: 0.4px; }
  .kpi-value { font-size: 20px; font-weight: 700; color: #1a1a1a; margin: 2px 0; }
  .kpi-formula { font-size: 10px; color: #aaa; }
  table { width: 100%; border-collapse: collapse; font-size: 11px; }
  th { background: #f0f0f0; padding: 6px 8px; text-align: left; font-weight: 600; font-size: 10px; text-transform: uppercase; }
  td { padding: 5px 8px; border-bottom: 1px solid #f0f0f0; }
  .disclaimer { font-size: 10px; color: #999; margin-top: 24px; line-height: 1.5; border-top: 1px solid #e5e5e5; padding-top: 12px; }
  .footer { font-size: 10px; color: #bbb; text-align: center; margin-top: 32px; }
</style>
</head>
<body>
  <h1>Kapitalanleger-Analyse</h1>
  <p class="subtitle">Buy &amp; Hold — AfA, Cashflow nach Steuer, DCF-Rendite</p>
  <div class="meta">Ref-Nr: ${refNr} · Erstellt: ${datum} · Für: ${vorname}</div>

  <div class="section-title">Kernergebnisse</div>
  <div class="kpi-grid">
    <div class="kpi">
      <div class="kpi-label">Kaufpreisfaktor</div>
      <div class="kpi-value">${result.kaufpreisfaktor.toFixed(1)}×</div>
      <div class="kpi-formula">${formatEur(input.kaufpreis)} ÷ (${formatEur(input.kaltmiete)} × 12)</div>
    </div>
    <div class="kpi">
      <div class="kpi-label">Cashflow/Monat netto</div>
      <div class="kpi-value" style="color:${result.nettoMonat >= 0 ? '#1a7a4a' : '#b91c1c'}">${formatEur(result.nettoMonat)}</div>
      <div class="kpi-formula">nach Zinsen, Tilgung, Hausgeld, Steuer</div>
    </div>
    <div class="kpi">
      <div class="kpi-label">AfA Steuerersparnis/Jahr</div>
      <div class="kpi-value">${formatEur(result.jahresAfA)}</div>
      <div class="kpi-formula">${formatEur(input.kaufpreis)} × ${input.gebaeudeanteil}% × ${afaRatePct}% · §7 EStG · Bj. ${input.baujahr}</div>
    </div>
    <div class="kpi">
      <div class="kpi-label">Brutto-Rendite</div>
      <div class="kpi-value">${result.bruttoRendite.toFixed(1)}%</div>
      <div class="kpi-formula">(${formatEur(input.kaltmiete)} × 12) ÷ ${formatEur(input.kaufpreis)}</div>
    </div>
    <div class="kpi">
      <div class="kpi-label">NPV 10 Jahre</div>
      <div class="kpi-value">${formatEur(result.npv10j)}</div>
      <div class="kpi-formula">DCF · Diskontrate ${input.diskontRate}% · Mietstg. ${input.mietsteigerung}%/J</div>
    </div>
    <div class="kpi">
      <div class="kpi-label">NPV 20 Jahre</div>
      <div class="kpi-value">${formatEur(result.npv20j)}</div>
      <div class="kpi-formula">DCF · Exit-Faktor: ${result.kaufpreisfaktor.toFixed(1)}×</div>
    </div>
  </div>

  <div class="section-title">Steuerliche Berechnung §21 EStG</div>
  <table>
    <tr><th>Position</th><th>Betrag/Jahr</th></tr>
    <tr><td>Bruttomiete (${(100 - input.leerstand)}% belegt)</td><td>${formatEur(result.bruttoMieteJahr)}</td></tr>
    <tr><td>− Jahreszinsen</td><td>−${formatEur(result.zinsen)}</td></tr>
    <tr><td>− Nicht umlagefähiges Hausgeld (30%)</td><td>−${formatEur(result.nichtUmlagefaehig)}</td></tr>
    <tr><td>− AfA §7 EStG</td><td>−${formatEur(result.jahresAfA)}</td></tr>
    <tr><td><strong>= Zu versteuernde Einkünfte §21</strong></td><td><strong>${formatEur(result.zuVersteuern)}</strong></td></tr>
    <tr><td>Einkommensteuer (${input.grenzsteuersatz}% Grenzsteuersatz)</td><td>${formatEur(result.einkommensteuer)}</td></tr>
  </table>

  <div class="section-title">Tilgungsplan (${input.haltedauer} Jahre) — amortisierende Berechnung</div>
  <table>
    <thead>
      <tr>
        <th>Jahr</th>
        <th>Restschuld</th>
        <th>Zinsen</th>
        <th>Tilgung</th>
        <th>Cashflow netto</th>
      </tr>
    </thead>
    <tbody>
      ${tilgungsRows}
    </tbody>
  </table>

  <div style="display:flex;align-items:center;gap:16px;background:#f8f8f8;border:1px solid #e8e8e8;border-radius:6px;padding:16px 20px;margin-top:24px;margin-bottom:0;">
    ${portraitB64 ? `<img src="${portraitB64}" alt="Joachim Kleinke" style="width:56px;height:56px;border-radius:50%;object-fit:cover;object-position:center top;flex-shrink:0;border:2px solid #1a7a4a;" />` : ''}
    <div>
      <div style="font-size:13px;font-weight:700;color:#1a1a1a;">Joachim Kleinke</div>
      <div style="font-size:11px;color:#666;margin-top:2px;">§ 34c Maklererlaubnis · 35+ Jahre Leipzig</div>
      <div style="font-size:11px;color:#666;margin-top:1px;">office@wirkaufendeineimmobilie.de · 0341 — 800 900 0</div>
    </div>
  </div>
  <div class="disclaimer">
    <strong>Hinweise:</strong> Diese Analyse dient der Orientierung und ersetzt keine Steuerberatung.
    AfA-Rate basiert auf dem Fertigstellungsjahr (§7 Abs. 4 EStG). Gebäudeanteil ${input.gebaeudeanteil}% — kein gesetzlicher Standard
    (BFH IX R 12/21, 2022); bitte mit Steuerberater abstimmen. WEG-Rücklagen sind nicht als Werbungskosten berücksichtigt
    (BFH IX R 19/24, 14.01.2025: nur bei tatsächlicher Verwendung abzugsfähig). NPV-Berechnung verwendet vereinfachte
    Zinsen (nicht-amortisierend); Tilgungsplan zeigt exakten amortisierenden Verlauf. Keine Haftung für Vollständigkeit.
  </div>
  <div class="footer">wirkaufendeineimmobilie.de · Ref: ${refNr}</div>
</body>
</html>`;
}
