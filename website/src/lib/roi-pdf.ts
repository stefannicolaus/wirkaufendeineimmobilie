// src/lib/roi-pdf.ts
import type { RoiInput, RoiResult } from './roi-calc.js';
import { formatEur } from './roi-calc.js';

const OBJEKT_LABELS: Record<string, string> = {
  messie: 'Messie-Objekt / Entrümpelungsbedarf',
  erbengemeinschaft: 'Erbengemeinschaft',
  insolvenz: 'Insolvenzverfahren',
  geg: 'Energetische Sanierung – Energieklasse E–H (gemäß Gebäudeenergiegesetz / GEG)',
  standard: 'Sanierungsobjekt (Standard)',
};

const STADTTEIL_LABELS: Record<string, string> = {
  plagwitz: 'Plagwitz',
  suedvorstadt: 'Südvorstadt',
  gohlis: 'Gohlis',
  lindenau: 'Lindenau',
  reudnitz: 'Reudnitz-Thonberg',
  neustadt: 'Neustadt-Neuschönefeld',
  volkmarsdorf: 'Volkmarsdorf',
  sellerhausen: 'Sellerhausen-Stünz',
};

export function generatePdfHtml(opts: {
  input: RoiInput;
  result: RoiResult;
  vorname: string;
  email: string;
  refNr: string;
  datum: string;
  portraitB64?: string;
}): string {
  const { input, result, vorname, refNr, datum, portraitB64 } = opts;
  const scoreColor = { A: '#16a34a', B: '#2563eb', C: '#d97706', D: '#dc2626' }[result.deal_score];
  const stadtLabel = STADTTEIL_LABELS[input.stadtteil] ?? input.stadtteil;
  const objektLabel = OBJEKT_LABELS[input.objekt_typ] ?? input.objekt_typ;

  const css = `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Georgia, 'Times New Roman', serif; color: #1e293b; background: white; }

    /* COVER */
    .cover {
      width: 100%; min-height: 100vh;
      background: linear-gradient(160deg, #0f172a 0%, #1e3a5f 60%, #0f172a 100%);
      color: white; padding: 56px 64px;
      display: flex; flex-direction: column;
      page-break-after: always; position: relative; overflow: hidden;
    }
    .cover-logo { font-size: 18px; font-weight: 700; letter-spacing: -0.5px; position: relative; z-index: 1; }
    .cover-logo span { color: #2563eb; }
    .cover-badge {
      position: absolute; top: 56px; right: 64px; z-index: 1;
      border: 1px solid rgba(255,255,255,0.3); padding: 6px 16px;
      font-size: 10px; letter-spacing: 2px; text-transform: uppercase; font-family: Arial, sans-serif;
    }
    .cover-eyebrow {
      font-size: 11px; letter-spacing: 3px; text-transform: uppercase;
      color: #2563eb; font-family: Arial, sans-serif;
      margin-top: auto; margin-bottom: 24px; position: relative; z-index: 1;
    }
    .cover-title { font-size: 52px; line-height: 1.1; font-weight: 700; margin-bottom: 24px; position: relative; z-index: 1; }
    .cover-sub {
      font-size: 16px; color: rgba(255,255,255,0.65); max-width: 480px;
      line-height: 1.6; position: relative; z-index: 1; margin-bottom: 64px;
    }
    .cover-meta {
      display: flex; gap: 40px; padding-top: 32px;
      border-top: 1px solid rgba(255,255,255,0.15);
      font-size: 12px; font-family: Arial, sans-serif; position: relative; z-index: 1; flex-wrap: wrap;
    }
    .cover-meta-item span { display: block; color: rgba(255,255,255,0.45); font-size: 10px; margin-bottom: 4px; letter-spacing: 1px; text-transform: uppercase; }

    /* CONTENT PAGES */
    .page { padding: 56px 64px; page-break-after: always; }
    .page-header {
      background: #0f172a; color: white;
      margin: -56px -64px 48px -64px; padding: 20px 64px;
      display: flex; justify-content: space-between; align-items: center;
    }
    .page-header-logo { font-size: 14px; font-weight: 700; }
    .page-header-logo span { color: #2563eb; }
    .page-header-section { font-size: 10px; letter-spacing: 2px; text-transform: uppercase; font-family: Arial, sans-serif; color: rgba(255,255,255,0.5); }
    .section-eyebrow { font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: #2563eb; font-family: Arial, sans-serif; margin-bottom: 12px; }
    .section-title { font-size: 36px; line-height: 1.15; font-weight: 700; margin-bottom: 16px; }
    .section-sub { font-size: 14px; color: #64748b; line-height: 1.6; margin-bottom: 40px; }

    /* CARDS */
    .cards-2col { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 32px; }
    .card { border: 1px solid #e2e8f0; padding: 20px 24px; border-radius: 8px; }
    .card-label { font-size: 9px; letter-spacing: 2px; text-transform: uppercase; color: #94a3b8; font-family: Arial, sans-serif; margin-bottom: 8px; }
    .card-value { font-size: 15px; font-weight: 600; color: #1e293b; }
    .card-highlight { background: #eff6ff; border-color: #bfdbfe; }
    .card-highlight .card-label { color: #1d4ed8; }
    .card-highlight .card-value { color: #1d4ed8; }

    /* CALC TABLE */
    .calc-table { width: 100%; border-collapse: collapse; margin-bottom: 32px; font-size: 13px; }
    .calc-table th { background: #0f172a; color: white; text-align: left; padding: 12px 16px; font-size: 10px; letter-spacing: 1px; text-transform: uppercase; font-family: Arial, sans-serif; }
    .calc-table th:last-child { text-align: right; }
    .calc-table td { padding: 14px 16px; border-bottom: 1px solid #f1f5f9; }
    .calc-table td:last-child { text-align: right; font-weight: 500; }
    .calc-table .row-total td { background: #f8fafc; font-weight: 700; font-size: 15px; }
    .calc-table .row-profit td { background: #0f172a; color: white; font-weight: 700; font-size: 16px; }
    .calc-table .col-green { color: #16a34a; }
    .calc-table .col-blue { color: #2563eb; }
    .calc-table .col-red { color: #dc2626; }
    .calc-table .col-note { color: #94a3b8; font-size: 12px; }

    /* DEAL SCORE */
    .deal-score-box {
      background: #0f172a; color: white; padding: 32px 40px;
      border-radius: 12px; display: flex; align-items: center; gap: 32px; margin-bottom: 32px;
    }
    .deal-score-badge {
      width: 80px; height: 80px; border-radius: 50%;
      background: ${scoreColor}; display: flex; align-items: center; justify-content: center;
      font-size: 36px; font-weight: 700; color: white; flex-shrink: 0;
    }
    .deal-score-text h3 { font-size: 22px; margin-bottom: 8px; }
    .deal-score-text p { font-size: 13px; color: rgba(255,255,255,0.65); line-height: 1.5; }

    /* TRAFFIC LIGHTS */
    .checks { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-bottom: 40px; }
    .check { border: 1px solid #e2e8f0; padding: 20px; border-radius: 8px; text-align: center; }
    .check-icon { font-size: 24px; margin-bottom: 8px; }
    .check-label { font-size: 10px; letter-spacing: 1px; text-transform: uppercase; color: #94a3b8; font-family: Arial, sans-serif; margin-bottom: 6px; }
    .check-value { font-size: 14px; font-weight: 700; }
    .check.ok { border-color: #86efac; background: #f0fdf4; }
    .check.warn { border-color: #fcd34d; background: #fffbeb; }
    .check.fail { border-color: #fca5a5; background: #fef2f2; }

    /* STEPS */
    .steps { list-style: none; margin-bottom: 40px; }
    .step { display: flex; gap: 20px; padding: 20px 0; border-bottom: 1px solid #f1f5f9; align-items: flex-start; }
    .step-num {
      width: 36px; height: 36px; border-radius: 50%;
      background: #2563eb; color: white; display: flex; align-items: center; justify-content: center;
      font-size: 14px; font-weight: 700; flex-shrink: 0; font-family: Arial, sans-serif;
    }
    .step-content h4 { font-size: 15px; font-weight: 700; margin-bottom: 4px; }
    .step-content p { font-size: 13px; color: #64748b; line-height: 1.5; }
    .step-link { font-size: 12px; color: #2563eb; font-family: Arial, sans-serif; margin-top: 4px; }

    /* CTA BOX */
    .cta-box {
      background: #f8fafc; border: 1px solid #e2e8f0;
      border-radius: 12px; padding: 32px 40px;
      display: flex; justify-content: space-between; align-items: center; gap: 24px;
    }
    .cta-info h4 { font-size: 18px; font-weight: 700; margin-bottom: 4px; }
    .cta-info p { font-size: 13px; color: #64748b; }
    .cta-info .phone { color: #2563eb; font-size: 15px; font-weight: 700; margin-top: 8px; display: block; }
    .cta-btn {
      background: #2563eb; color: white; padding: 14px 28px;
      border-radius: 6px; font-size: 14px; font-weight: 700;
      font-family: Arial, sans-serif; text-decoration: none; white-space: nowrap;
    }

    /* FOOTER */
    .page-footer {
      border-top: 1px solid #e2e8f0; margin-top: 48px; padding-top: 16px;
      display: flex; justify-content: space-between; font-size: 10px;
      color: #94a3b8; font-family: Arial, sans-serif;
    }
    .page-footer-logo { font-weight: 700; }
    .page-footer-logo span { color: #2563eb; }
    .disclaimer { font-size: 10px; color: #94a3b8; line-height: 1.6; font-family: Arial, sans-serif; margin-top: 24px; }
  `;

  const roiClass = result.roi_pct >= 15 ? 'ok' : result.roi_pct >= 8 ? 'warn' : 'fail';
  const roiIcon = result.roi_pct >= 15 ? '✅' : result.roi_pct >= 8 ? '⚠️' : '❌';

  return `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8">
<style>${css}</style>
</head>
<body>

<!-- COVER -->
<div class="cover">
  <div class="cover-logo">wirkaufen<span>deine</span>immobilie</div>
  <div class="cover-badge">VERTRAULICH</div>
  <div class="cover-eyebrow">Ihre persönliche Fix &amp; Flip Kalkulation</div>
  <div class="cover-title">Ihr Deal.<br>Durchgerechnet.</div>
  <div class="cover-sub">Individuelle Rendite-Analyse für Ihr Objekt in Leipzig — mit echten Marktdaten, BEG-Förderprüfung und Deal-Score.</div>
  <div class="cover-meta">
    <div class="cover-meta-item"><span>Erstellt für</span>${vorname}</div>
    <div class="cover-meta-item"><span>Objekt-Typ</span>${objektLabel}</div>
    <div class="cover-meta-item"><span>Stadtteil</span>Leipzig-${stadtLabel}</div>
    <div class="cover-meta-item"><span>Datum</span>${datum}</div>
    <div class="cover-meta-item"><span>Ref</span>${refNr}</div>
  </div>
</div>

<!-- PAGE 1: SITUATION -->
<div class="page">
  <div class="page-header">
    <div class="page-header-logo">wirkaufen<span>deine</span>immobilie</div>
    <div class="page-header-section">Ihre Situation</div>
  </div>
  <div class="section-eyebrow">Analyse Ihrer Lage</div>
  <div class="section-title">Was wir für Sie berechnet haben.</div>
  <div class="section-sub">Basierend auf Ihren Angaben und aktuellen Vergleichspreisen in Leipzig-${stadtLabel}.</div>
  <div class="cards-2col">
    <div class="card"><div class="card-label">Objekt-Typ</div><div class="card-value">${objektLabel}</div></div>
    <div class="card"><div class="card-label">Stadtteil</div><div class="card-value">Leipzig-${stadtLabel}</div></div>
    <div class="card"><div class="card-label">Kaufpreis (Ist-Zustand)</div><div class="card-value">${formatEur(input.kaufpreis)}</div></div>
    <div class="card"><div class="card-label">Wohnfläche</div><div class="card-value">${input.wohnflaeche} m²</div></div>
    <div class="card"><div class="card-label">Sanierungskosten</div><div class="card-value">${formatEur(input.sanierungskosten)}</div></div>
    <div class="card"><div class="card-label">Exit-Strategie</div><div class="card-value">${input.exit_strategie === 'flip' ? 'Fix &amp; Flip (Verkauf)' : 'Langfrist-Vermietung'}</div></div>
  </div>
  ${result.beg_foerderung > 0 ? `
  <div class="card card-highlight" style="margin-bottom:24px;">
    <div class="card-label">BEG-Förderung erkannt</div>
    <div class="card-value">Energetisch sanierungsbedürftiges Objekt (gemäß GEG) — bis zu ${formatEur(result.beg_foerderung)} BEG-Förderung (40% auf Sanierungskosten inkl. iSFP-Bonus)</div>
  </div>` : ''}
  <div class="page-footer">
    <div class="page-footer-logo">wirkaufen<span>deine</span>immobilie</div>
    <div>Vertraulich · Erstellt für ${vorname} · ${datum}</div>
    <div>Ref: ${refNr} · 1 / 3</div>
  </div>
</div>

<!-- PAGE 2: KALKULATION -->
<div class="page">
  <div class="page-header">
    <div class="page-header-logo">wirkaufen<span>deine</span>immobilie</div>
    <div class="page-header-section">Rendite-Kalkulation</div>
  </div>
  <div class="section-eyebrow">Ihre Zahlen</div>
  <div class="section-title">Was dieser Deal wirklich bringt.</div>
  <div class="section-sub">Alle Kosten, Steuern und Förderungen eingerechnet — auf Basis aktueller Marktpreise in Leipzig-${stadtLabel} (${formatEur(result.qm_preis_saniert)}/m² saniert).</div>
  <table class="calc-table">
    <thead>
      <tr><th>Position</th><th>Anmerkung</th><th>Betrag</th></tr>
    </thead>
    <tbody>
      <tr><td>Kaufpreis (Ist-Zustand)</td><td class="col-note">${objektLabel}</td><td>${formatEur(result.kaufpreis)}</td></tr>
      <tr><td>Grunderwerbsteuer (3,5% — Sachsen)</td><td class="col-note">Kaufnebenkosten</td><td>${formatEur(result.grunderwerbsteuer)}</td></tr>
      <tr><td>Notar + Grundbuch (2%)</td><td class="col-note">Kaufnebenkosten</td><td>${formatEur(result.notar)}</td></tr>
      <tr><td>Maklerprovision Kauf (2,38%)</td><td class="col-note">inkl. MwSt</td><td>${formatEur(result.provision_kauf)}</td></tr>
      <tr><td>Sanierungskosten</td><td class="col-note">Brutto</td><td>${formatEur(result.sanierungskosten)}</td></tr>
      ${result.beg_foerderung > 0 ? `<tr><td class="col-green">BEG-Förderung (iSFP, 40%)</td><td class="col-note">KfW/BAFA-Förderung</td><td class="col-green">−${formatEur(result.beg_foerderung)}</td></tr>` : ''}
      <tr class="row-total"><td>Gesamtinvestition netto</td><td></td><td class="col-blue">${formatEur(result.gesamtinvestition)}</td></tr>
      <tr><td>Marktwert nach Sanierung (ARV)</td><td class="col-note">${result.wohnflaeche} m² × ${formatEur(result.qm_preis_saniert)}/m²</td><td>${formatEur(result.verkaufspreis)}</td></tr>
      <tr><td>Maklerprovision Verkauf (3,57%)</td><td class="col-note">inkl. MwSt</td><td class="col-red">−${formatEur(result.provision_verkauf)}</td></tr>
      <tr class="row-profit"><td>Netto-Gewinn (Fix &amp; Flip)</td><td></td><td class="col-green">+${formatEur(result.netto_gewinn)} (+${result.roi_pct}% ROI)</td></tr>
    </tbody>
  </table>
  <div class="page-footer">
    <div class="page-footer-logo">wirkaufen<span>deine</span>immobilie</div>
    <div>Vertraulich · Erstellt für ${vorname} · ${datum}</div>
    <div>Ref: ${refNr} · 2 / 3</div>
  </div>
</div>

<!-- PAGE 3: VERDICT + CTA -->
<div class="page">
  <div class="page-header">
    <div class="page-header-logo">wirkaufen<span>deine</span>immobilie</div>
    <div class="page-header-section">Deal-Verdict &amp; Nächste Schritte</div>
  </div>
  <div class="section-eyebrow">Ihr Deal-Score</div>
  <div class="section-title">Unsere Einschätzung.</div>
  <div class="deal-score-box">
    <div class="deal-score-badge">${result.deal_score}</div>
    <div class="deal-score-text">
      <h3>${result.deal_score_label}</h3>
      <p>ROI: ${result.roi_pct}% · Netto-Gewinn: ${formatEur(result.netto_gewinn)} · Gesamtinvestition: ${formatEur(result.gesamtinvestition)}</p>
    </div>
  </div>
  <div class="checks">
    <div class="check ${roiClass}">
      <div class="check-icon">${roiIcon}</div>
      <div class="check-label">ROI</div>
      <div class="check-value">${result.roi_pct}%</div>
    </div>
    <div class="check ${result.regel_70_check ? 'ok' : 'fail'}">
      <div class="check-icon">${result.regel_70_check ? '✅' : '❌'}</div>
      <div class="check-label">70%-Regel</div>
      <div class="check-value">${result.regel_70_check ? 'Bestanden' : 'Nicht bestanden'}</div>
    </div>
    <div class="check ${result.spekulationssteuer_check ? 'ok' : 'warn'}">
      <div class="check-icon">${result.spekulationssteuer_check ? '✅' : '⚠️'}</div>
      <div class="check-label">Spekulationssteuer</div>
      <div class="check-value">${result.spekulationssteuer_check ? 'Steuerfrei (10J+)' : 'Fällig bei Verkauf'}</div>
    </div>
  </div>
  <div class="section-eyebrow">Nächste Schritte</div>
  <ol class="steps">
    <li class="step">
      <div class="step-num">1</div>
      <div class="step-content">
        <h4>Kostenlose Erstbewertung anfragen</h4>
        <p>Wir prüfen Ihr konkretes Objekt — und nennen Ihnen einen realistischen Kaufpreiskorridor. Kostenlos, innerhalb von 48h.</p>
        <div class="step-link">→ wirkaufendeineimmobilie.de · 0341 — 800 900 0</div>
      </div>
    </li>
    <li class="step">
      <div class="step-num">2</div>
      <div class="step-content">
        <h4>Objekt im Off-Market-Verfahren prüfen lassen</h4>
        <p>Zugang zu 200+ verifizierten Käufern — kein ImmoScout, kein Bieterkrieg, diskretes Angebotsverfahren.</p>
      </div>
    </li>
    <li class="step">
      <div class="step-num">3</div>
      <div class="step-content">
        <h4>Notariellen Abschluss koordinieren</h4>
        <p>Wir übernehmen die gesamte Koordination — Notar, Übergabe, GEG-Dokumentation.</p>
      </div>
    </li>
  </ol>
  <div class="cta-box">
    ${portraitB64 ? `<img src="${portraitB64}" alt="Joachim Kleinke" style="width:72px;height:72px;border-radius:50%;object-fit:cover;object-position:center top;flex-shrink:0;border:2px solid #2563eb;" />` : ''}
    <div class="cta-info">
      <h4>Joachim Kleinke</h4>
      <p>Immobilienvermittler · § 34c Maklererlaubnis · 35+ Jahre Leipzig</p>
      <span class="phone">0341 — 800 900 0</span>
      <p style="margin-top:4px;font-size:12px;color:#94a3b8;">office@wirkaufendeineimmobilie.de · Kein Callcenter — ich selbst.</p>
    </div>
    <a href="https://wirkaufendeineimmobilie.de" class="cta-btn">Jetzt Gespräch vereinbaren →</a>
  </div>
  <p class="disclaimer">* Beispielkalkulation auf Basis Ihrer Angaben und aktueller Marktdaten Leipzig ${new Date().getFullYear()}. Individuelle Objekte können abweichen. Steuerliche Beratung durch einen Steuerberater empfohlen. Provision 2,5% des Kaufpreises (Käuferseite), nur bei erfolgreichem Abschluss fällig.</p>
  <div class="page-footer">
    <div class="page-footer-logo">wirkaufen<span>deine</span>immobilie</div>
    <div>Vertraulich · Erstellt für ${vorname} · ${datum}</div>
    <div>Ref: ${refNr} · 3 / 3</div>
  </div>
</div>

</body>
</html>`;
}
