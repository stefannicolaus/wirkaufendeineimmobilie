# ROI Rechner — Multi-Step Quiz Funnel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the ROI Rechner als 4-Schritt Quiz-Funnel mit Email-Gate, serverside PDF-Generierung und Brevo-Versand — plus Teaser-Sektion auf index.astro.

**Architecture:** Multi-step quiz in vanilla JS (no framework), Astro SSR API endpoint generiert HTML→PDF via Puppeteer, Brevo Transactional API versendet PDF als Attachment. Szenarien-Cards nutzen das bestehende Glassmorphism-Design (ANF-Pattern von index.astro). Neue images werden per Gemini generiert.

**Tech Stack:** Astro SSR (@astrojs/node), Puppeteer (PDF), Brevo REST API, vanilla JS, CSS-Variablen aus bestehendem Design-System

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `src/pages/roi-rechner.astro` | **Rewrite** | Quiz UI (4 Schritte + Blur Gate + Result) |
| `src/pages/api/roi-report.ts` | **Create** | POST endpoint: validate → PDF → Brevo → DB |
| `src/lib/roi-pdf.ts` | **Create** | HTML-Template für PDF (inline CSS, WKDI-Brand) |
| `src/lib/brevo.ts` | **Create** | Brevo API helper (transactional email + attachment) |
| `src/lib/roi-calc.ts` | **Create** | Kalkulationslogik (shared server+client) |
| `src/pages/index.astro` | **Modify** | ROI-Teaser Sektion hinzufügen |
| `public/images/wkdi-roi-preview.jpg` | **Generate** | Teaser-Bild: renovierte Gründerzeit-Wohnung |
| `public/images/wkdi-roi-quiz-hero.jpg` | **Generate** | Quiz-Hero: Leipzig Dachterrasse / Stadtblick |

---

## Task 1: Dependencies installieren

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Puppeteer installieren**

```bash
cd ~/code/wkdi-temp/website
npm install puppeteer
```

- [ ] **Step 2: Build-Test**

```bash
npm run build 2>&1 | tail -5
```
Expected: `build complete` ohne Fehler

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add puppeteer for server-side PDF generation"
```

---

## Task 2: Kalkulations-Logik (shared)

**Files:**
- Create: `src/lib/roi-calc.ts`

- [ ] **Step 1: roi-calc.ts erstellen**

```typescript
// src/lib/roi-calc.ts

export interface RoiInput {
  objekt_typ: 'messie' | 'erbengemeinschaft' | 'insolvenz' | 'geg' | 'standard';
  stadtteil: string;
  kaufpreis: number;
  wohnflaeche: number;
  sanierungskosten: number;
  exit_strategie: 'flip' | 'langfrist';
  eigenkapital_pct: number;
}

export interface RoiResult {
  // Inputs (echoed)
  kaufpreis: number;
  sanierungskosten: number;
  wohnflaeche: number;
  // Nebenkosten
  grunderwerbsteuer: number;  // 3.5% Sachsen
  notar: number;              // 2%
  provision_kauf: number;     // 2.38% (inkl. MwSt)
  nebenkosten_gesamt: number;
  // Totals
  gesamtinvestition: number;
  // ARV
  qm_preis_saniert: number;   // Marktpreis nach Sanierung
  verkaufspreis: number;
  provision_verkauf: number;  // 3.57%
  // Profit
  brutto_gewinn: number;
  netto_gewinn: number;
  roi_pct: number;
  // Checks
  regel_70_check: boolean;    // Kaufpreis ≤ 70% von ARV - Sanierung
  spekulationssteuer_check: boolean; // flip → immer steuerpflichtig
  beg_foerderung: number;     // GEG-Objekte: 40% auf Sanierung
  // Score
  deal_score: 'A' | 'B' | 'C' | 'D';
  deal_score_label: string;
}

// Marktpreise Leipzig nach Stadtteil (€/m² saniert)
const MARKTPREISE: Record<string, number> = {
  'plagwitz':    3200,
  'suedvorstadt':3100,
  'gohlis':      2800,
  'lindenau':    2600,
  'reudnitz':    2400,
  'neustadt':    2300,
  'volkmarsdorf':2000,
  'sellerhausen':1900,
};

export function calcRoi(input: RoiInput): RoiResult {
  const kp = input.kaufpreis;
  const san = input.sanierungskosten;
  const m2 = input.wohnflaeche;

  // Nebenkosten (Sachsen)
  const grunderwerbsteuer = Math.round(kp * 0.035);
  const notar = Math.round(kp * 0.02);
  const provision_kauf = Math.round(kp * 0.0238);
  const nebenkosten_gesamt = grunderwerbsteuer + notar + provision_kauf;

  // BEG-Förderung für GEG-Objekte
  const beg_foerderung = input.objekt_typ === 'geg'
    ? Math.round(san * 0.40)
    : 0;

  const san_netto = san - beg_foerderung;
  const gesamtinvestition = kp + nebenkosten_gesamt + san_netto;

  // ARV
  const qm_preis_saniert = MARKTPREISE[input.stadtteil] ?? 2400;
  const verkaufspreis = Math.round(m2 * qm_preis_saniert);
  const provision_verkauf = Math.round(verkaufspreis * 0.0357);

  // Profit
  const brutto_gewinn = verkaufspreis - gesamtinvestition;
  const netto_gewinn = brutto_gewinn - provision_verkauf;
  const roi_pct = Math.round((netto_gewinn / gesamtinvestition) * 100);

  // 70%-Regel: Kaufpreis ≤ 70% von ARV - Sanierungskosten
  const regel_70_check = kp <= (verkaufspreis * 0.70) - san;

  // Spekulationssteuer: bei Flip immer fällig (< 10 Jahre)
  const spekulationssteuer_check = input.exit_strategie === 'langfrist';

  // Deal Score
  let deal_score: 'A' | 'B' | 'C' | 'D';
  let deal_score_label: string;
  if (roi_pct >= 20 && regel_70_check) {
    deal_score = 'A'; deal_score_label = 'Sehr gutes Deal';
  } else if (roi_pct >= 12) {
    deal_score = 'B'; deal_score_label = 'Solides Potential';
  } else if (roi_pct >= 5) {
    deal_score = 'C'; deal_score_label = 'Grenzwertig';
  } else {
    deal_score = 'D'; deal_score_label = 'Überdenken';
  }

  return {
    kaufpreis: kp, sanierungskosten: san, wohnflaeche: m2,
    grunderwerbsteuer, notar, provision_kauf, nebenkosten_gesamt,
    beg_foerderung, gesamtinvestition, qm_preis_saniert,
    verkaufspreis, provision_verkauf,
    brutto_gewinn, netto_gewinn, roi_pct,
    regel_70_check, spekulationssteuer_check,
    deal_score, deal_score_label,
  };
}

export function formatEur(n: number): string {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/roi-calc.ts
git commit -m "feat: roi calculation logic with Leipzig market data and deal score"
```

---

## Task 3: Brevo Helper

**Files:**
- Create: `src/lib/brevo.ts`

- [ ] **Step 1: brevo.ts erstellen**

```typescript
// src/lib/brevo.ts

const BREVO_API_KEY = import.meta.env.BREVO_API_KEY;
const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

export interface BrevoAttachment {
  content: string; // base64
  name: string;
}

export async function sendTransactionalEmail(opts: {
  to: { email: string; name?: string };
  subject: string;
  htmlContent: string;
  attachments?: BrevoAttachment[];
  replyTo?: string;
}) {
  const body = {
    sender: { name: 'Joachim Kleinke — wirkaufendeineimmobilie', email: 'joachim@wirkaufendeineimmobilie.de' },
    to: [opts.to],
    subject: opts.subject,
    htmlContent: opts.htmlContent,
    replyTo: { email: opts.replyTo ?? 'joachim@wirkaufendeineimmobilie.de' },
    ...(opts.attachments ? { attachment: opts.attachments } : {}),
  };

  const res = await fetch(BREVO_API_URL, {
    method: 'POST',
    headers: {
      'api-key': BREVO_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Brevo error ${res.status}: ${err}`);
  }

  return await res.json();
}
```

- [ ] **Step 2: BREVO_API_KEY in .env eintragen**

```bash
echo 'BREVO_API_KEY=BREVO_API_KEY_REDACTED' >> ~/code/wkdi-temp/website/.env
```

- [ ] **Step 3: .env in Coolify als Environment Variable setzen**
(In Coolify UI: Environment Variables → `BREVO_API_KEY` = key oben)

- [ ] **Step 4: Commit**

```bash
git add src/lib/brevo.ts
git commit -m "feat: brevo transactional email helper with attachment support"
```

---

## Task 4: PDF Template

**Files:**
- Create: `src/lib/roi-pdf.ts`

- [ ] **Step 1: roi-pdf.ts erstellen**

Das Template matcht exakt den Design-Stil der 3 Beispiel-PDFs: Dark navy Cover, serif Headings, blaue Akzentfarbe, "Vertraulich" Badge, Ref-Nummer.

```typescript
// src/lib/roi-pdf.ts
import type { RoiInput, RoiResult } from './roi-calc.js';
import { formatEur } from './roi-calc.js';

const OBJEKT_LABELS: Record<string, string> = {
  messie: 'Messie-Objekt / Entrümpelungsbedarf',
  erbengemeinschaft: 'Erbengemeinschaft',
  insolvenz: 'Insolvenzverfahren',
  geg: 'GEG-Sanierungsstau (Energieklasse E–H)',
  standard: 'Sanierungsobjekt (Standard)',
};

const STADTTEIL_LABELS: Record<string, string> = {
  plagwitz: 'Plagwitz', suedvorstadt: 'Südvorstadt', gohlis: 'Gohlis',
  lindenau: 'Lindenau', reudnitz: 'Reudnitz-Thonberg',
  neustadt: 'Neustadt-Neuschönefeld', volkmarsdorf: 'Volkmarsdorf',
  sellerhausen: 'Sellerhausen-Stünz',
};

export function generatePdfHtml(opts: {
  input: RoiInput;
  result: RoiResult;
  vorname: string;
  email: string;
  refNr: string;
  datum: string;
}): string {
  const { input, result, vorname, refNr, datum } = opts;
  const score_color = { A: '#16a34a', B: '#2563eb', C: '#d97706', D: '#dc2626' }[result.deal_score];

  return `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Georgia, 'Times New Roman', serif; color: #1e293b; background: white; }

  /* Cover Page */
  .cover {
    width: 100%; height: 100vh; min-height: 900px;
    background: linear-gradient(160deg, #0f172a 0%, #1e3a5f 60%, #0f172a 100%);
    color: white; padding: 56px 64px; display: flex; flex-direction: column;
    page-break-after: always;
    position: relative; overflow: hidden;
  }
  .cover::before {
    content: ''; position: absolute; inset: 0;
    background-image: url('https://wirkaufendeineimmobilie.de/images/wkdi-pdf-cover-fassade.png');
    background-size: cover; background-position: center;
    opacity: 0.12;
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
    color: #2563eb; font-family: Arial, sans-serif; margin-top: auto; margin-bottom: 24px;
    position: relative; z-index: 1;
  }
  .cover-title {
    font-size: 52px; line-height: 1.1; font-weight: 700; margin-bottom: 24px;
    position: relative; z-index: 1;
  }
  .cover-sub {
    font-size: 16px; color: rgba(255,255,255,0.65); max-width: 480px; line-height: 1.6;
    position: relative; z-index: 1; margin-bottom: 64px;
  }
  .cover-meta {
    display: flex; gap: 48px; padding-top: 32px;
    border-top: 1px solid rgba(255,255,255,0.15);
    font-size: 12px; font-family: Arial, sans-serif; position: relative; z-index: 1;
  }
  .cover-meta-item span { display: block; color: rgba(255,255,255,0.45); font-size: 10px; margin-bottom: 4px; letter-spacing: 1px; text-transform: uppercase; }

  /* Content Pages */
  .page { padding: 56px 64px; page-break-after: always; }
  .page-header {
    background: #0f172a; color: white; margin: -56px -64px 48px -64px;
    padding: 20px 64px; display: flex; justify-content: space-between; align-items: center;
  }
  .page-header-logo { font-size: 14px; font-weight: 700; }
  .page-header-logo span { color: #2563eb; }
  .page-header-section { font-size: 10px; letter-spacing: 2px; text-transform: uppercase; font-family: Arial, sans-serif; color: rgba(255,255,255,0.5); }

  .section-eyebrow { font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: #2563eb; font-family: Arial, sans-serif; margin-bottom: 12px; }
  .section-title { font-size: 36px; line-height: 1.15; font-weight: 700; margin-bottom: 16px; }
  .section-sub { font-size: 14px; color: #64748b; line-height: 1.6; margin-bottom: 40px; }

  /* Situation Cards */
  .cards-2col { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 32px; }
  .card { border: 1px solid #e2e8f0; padding: 20px 24px; border-radius: 8px; }
  .card-label { font-size: 9px; letter-spacing: 2px; text-transform: uppercase; color: #94a3b8; font-family: Arial, sans-serif; margin-bottom: 8px; }
  .card-value { font-size: 15px; font-weight: 600; color: #1e293b; }

  /* Kalkulations-Tabelle */
  .calc-table { width: 100%; border-collapse: collapse; margin-bottom: 32px; }
  .calc-table th { background: #0f172a; color: white; text-align: left; padding: 12px 16px; font-size: 10px; letter-spacing: 1px; text-transform: uppercase; font-family: Arial, sans-serif; }
  .calc-table td { padding: 14px 16px; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
  .calc-table tr:last-child td { border-bottom: none; }
  .calc-table .total-row td { background: #f8fafc; font-weight: 700; font-size: 15px; }
  .calc-table .profit-row td { background: #0f172a; color: white; font-weight: 700; font-size: 16px; }
  .calc-table .green { color: #16a34a; }
  .calc-table .red { color: #dc2626; }
  .calc-table .blue { color: #2563eb; }
  .calc-table td:last-child { text-align: right; }

  /* Deal Score */
  .deal-score-box {
    background: #0f172a; color: white; padding: 32px 40px;
    border-radius: 12px; display: flex; align-items: center; gap: 32px; margin-bottom: 32px;
  }
  .deal-score-badge {
    width: 80px; height: 80px; border-radius: 50%;
    background: ${score_color}; display: flex; align-items: center; justify-content: center;
    font-size: 36px; font-weight: 700; color: white; flex-shrink: 0;
  }
  .deal-score-text h3 { font-size: 22px; margin-bottom: 8px; }
  .deal-score-text p { font-size: 13px; color: rgba(255,255,255,0.65); line-height: 1.5; }

  /* Traffic Lights */
  .checks { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-bottom: 40px; }
  .check { border: 1px solid #e2e8f0; padding: 20px; border-radius: 8px; text-align: center; }
  .check-icon { font-size: 24px; margin-bottom: 8px; }
  .check-label { font-size: 10px; letter-spacing: 1px; text-transform: uppercase; color: #94a3b8; font-family: Arial, sans-serif; margin-bottom: 6px; }
  .check-value { font-size: 14px; font-weight: 700; }
  .check.ok { border-color: #86efac; background: #f0fdf4; }
  .check.warn { border-color: #fcd34d; background: #fffbeb; }
  .check.fail { border-color: #fca5a5; background: #fef2f2; }

  /* Nächste Schritte */
  .steps { list-style: none; margin-bottom: 40px; }
  .step { display: flex; gap: 20px; padding: 20px 0; border-bottom: 1px solid #f1f5f9; align-items: flex-start; }
  .step-num {
    width: 36px; height: 36px; border-radius: 50%;
    background: #2563eb; color: white; display: flex; align-items: center; justify-content: center;
    font-size: 14px; font-weight: 700; flex-shrink: 0; font-family: Arial, sans-serif;
  }
  .step-content h4 { font-size: 15px; font-weight: 700; margin-bottom: 4px; }
  .step-content p { font-size: 13px; color: #64748b; line-height: 1.5; }
  .step-link { font-size: 12px; color: #2563eb; font-family: Arial, sans-serif; }

  /* Joachim CTA */
  .cta-box {
    background: #f8fafc; border: 1px solid #e2e8f0;
    border-radius: 12px; padding: 32px 40px;
    display: flex; justify-content: space-between; align-items: center;
  }
  .cta-info h4 { font-size: 18px; font-weight: 700; margin-bottom: 4px; }
  .cta-info p { font-size: 13px; color: #64748b; }
  .cta-info .phone { color: #2563eb; font-size: 15px; font-weight: 700; margin-top: 8px; }
  .cta-btn {
    background: #2563eb; color: white; padding: 14px 28px;
    border-radius: 6px; font-size: 14px; font-weight: 700; font-family: Arial, sans-serif;
    text-decoration: none;
  }

  /* Footer */
  .page-footer {
    border-top: 1px solid #e2e8f0; margin-top: 48px; padding-top: 16px;
    display: flex; justify-content: space-between; font-size: 10px;
    color: #94a3b8; font-family: Arial, sans-serif;
  }
  .page-footer .logo { font-weight: 700; }
  .page-footer .logo span { color: #2563eb; }
</style>
</head>
<body>

<!-- COVER -->
<div class="cover">
  <div class="cover-logo">wirkaufen<span>deine</span>immobilie</div>
  <div class="cover-badge">VERTRAULICH</div>

  <div class="cover-eyebrow">Ihre persönliche Fix &amp; Flip Kalkulation</div>
  <div class="cover-title">Ihr Deal.<br />Durchgerechnet.</div>
  <div class="cover-sub">Individuelle Rendite-Analyse für Ihr Objekt in Leipzig — mit echten Marktdaten, BEG-Förderprüfung und Deal-Score.</div>

  <div class="cover-meta">
    <div class="cover-meta-item"><span>Erstellt für</span>${vorname}</div>
    <div class="cover-meta-item"><span>Objekt-Typ</span>${OBJEKT_LABELS[input.objekt_typ]}</div>
    <div class="cover-meta-item"><span>Stadtteil</span>${STADTTEIL_LABELS[input.stadtteil] ?? input.stadtteil}</div>
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
  <div class="section-sub">Basierend auf Ihren Angaben und aktuellen Vergleichspreisen in Leipzig ${STADTTEIL_LABELS[input.stadtteil] ?? input.stadtteil}.</div>

  <div class="cards-2col">
    <div class="card"><div class="card-label">Objekt-Typ</div><div class="card-value">${OBJEKT_LABELS[input.objekt_typ]}</div></div>
    <div class="card"><div class="card-label">Stadtteil</div><div class="card-value">Leipzig-${STADTTEIL_LABELS[input.stadtteil] ?? input.stadtteil}</div></div>
    <div class="card"><div class="card-label">Kaufpreis (Ist-Zustand)</div><div class="card-value">${formatEur(input.kaufpreis)}</div></div>
    <div class="card"><div class="card-label">Wohnfläche</div><div class="card-value">${input.wohnflaeche} m²</div></div>
    <div class="card"><div class="card-label">Sanierungskosten</div><div class="card-value">${formatEur(input.sanierungskosten)}</div></div>
    <div class="card"><div class="card-label">Exit-Strategie</div><div class="card-value">${input.exit_strategie === 'flip' ? 'Fix & Flip (Verkauf)' : 'Langfrist-Vermietung'}</div></div>
  </div>

  ${result.beg_foerderung > 0 ? `
  <div class="card" style="background:#eff6ff;border-color:#bfdbfe;margin-bottom:24px;">
    <div class="card-label" style="color:#1d4ed8;">BEG-Förderung erkannt</div>
    <div class="card-value" style="color:#1d4ed8;">GEG-Sanierungsobjekt — Sie erhalten bis zu ${formatEur(result.beg_foerderung)} Förderung (40% auf Sanierungskosten inkl. iSFP-Bonus)</div>
  </div>` : ''}

  <div class="page-footer">
    <div class="logo">wirkaufen<span>deine</span>immobilie</div>
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
  <div class="section-sub">Alle Kosten, Steuern und Förderungen eingerechnet — auf Basis aktueller Marktpreise in Leipzig-${STADTTEIL_LABELS[input.stadtteil] ?? input.stadtteil} (${formatEur(result.qm_preis_saniert)}/m² saniert).</div>

  <table class="calc-table">
    <thead>
      <tr><th>Position</th><th>Betrag</th><th>Anmerkung</th></tr>
    </thead>
    <tbody>
      <tr><td>Kaufpreis (Ist-Zustand)</td><td style="text-align:right">${formatEur(result.kaufpreis)}</td><td>${OBJEKT_LABELS[input.objekt_typ]}</td></tr>
      <tr><td>Grunderwerbsteuer (3,5% — Sachsen)</td><td style="text-align:right">${formatEur(result.grunderwerbsteuer)}</td><td>Kaufnebenkosten</td></tr>
      <tr><td>Notar + Grundbuch (2%)</td><td style="text-align:right">${formatEur(result.notar)}</td><td>Kaufnebenkosten</td></tr>
      <tr><td>Maklerprovision Kauf (2,38%)</td><td style="text-align:right">${formatEur(result.provision_kauf)}</td><td>inkl. MwSt</td></tr>
      <tr><td>Sanierungskosten</td><td style="text-align:right">${formatEur(result.sanierungskosten)}</td><td>Brutto</td></tr>
      ${result.beg_foerderung > 0 ? `<tr><td class="green">BEG-Förderung (iSFP, 40%)</td><td class="green" style="text-align:right">−${formatEur(result.beg_foerderung)}</td><td>40% auf Sanierungskosten</td></tr>` : ''}
      <tr class="total-row"><td>Gesamtinvestition netto</td><td class="blue" style="text-align:right">${formatEur(result.gesamtinvestition)}</td><td></td></tr>
      <tr><td>Marktwert nach Sanierung</td><td style="text-align:right">${formatEur(result.verkaufspreis)}</td><td>${result.wohnflaeche} m² × ${formatEur(result.qm_preis_saniert)}/m²</td></tr>
      <tr><td>Maklerprovision Verkauf (3,57%)</td><td class="red" style="text-align:right">−${formatEur(result.provision_verkauf)}</td><td>inkl. MwSt</td></tr>
      <tr class="profit-row"><td>Netto-Gewinn (Fix &amp; Flip)</td><td class="green" style="text-align:right">+${formatEur(result.netto_gewinn)}</td><td>+${result.roi_pct}% ROI auf Gesamtinvestition</td></tr>
    </tbody>
  </table>

  <div class="page-footer">
    <div class="logo">wirkaufen<span>deine</span>immobilie</div>
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
    <div class="check ${result.roi_pct >= 15 ? 'ok' : result.roi_pct >= 8 ? 'warn' : 'fail'}">
      <div class="check-icon">${result.roi_pct >= 15 ? '✅' : result.roi_pct >= 8 ? '⚠️' : '❌'}</div>
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
  <ol class="steps" style="list-style:none;">
    <li class="step">
      <div class="step-num">1</div>
      <div class="step-content">
        <h4>Kostenlose Erstbewertung anfragen</h4>
        <p>Wir prüfen Ihr konkretes Objekt — und nennen Ihnen einen realistischen Kaufpreiskorridor. Kostenlos, 48h.</p>
        <div class="step-link">→ wirkaufendeineimmobilie.de oder 0341 — 800 900 0</div>
      </div>
    </li>
    <li class="step">
      <div class="step-num">2</div>
      <div class="step-content">
        <h4>Objekt im Off-Market-Verfahren prüfen lassen</h4>
        <p>Zugang zu unseren 200+ verifizierten Käufern — kein ImmoScout, kein Bieterkrieg.</p>
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
    <div class="cta-info">
      <h4>Joachim Kleinke</h4>
      <p>Immobilienvermittler · § 34c Maklererlaubnis · 35+ Jahre Leipzig</p>
      <div class="phone">0341 — 800 900 0</div>
      <p style="margin-top:4px;font-size:12px;color:#94a3b8;">joachim@wirkaufendeineimmobilie.de · Kein Callcenter, ich selbst.</p>
    </div>
    <a href="https://wirkaufendeineimmobilie.de" class="cta-btn">Jetzt Gespräch vereinbaren →</a>
  </div>

  <p style="font-size:10px;color:#94a3b8;margin-top:24px;font-family:Arial,sans-serif;line-height:1.6;">
    * Beispielkalkulation auf Basis Ihrer Angaben und aktueller Marktdaten Leipzig ${new Date().getFullYear()}. Individuelle Objekte können abweichen. Steuerliche Beratung durch Fachmann empfohlen. Provision 2,5% des Kaufpreises (Käuferseite), nur bei erfolgreichem Abschluss.
  </p>

  <div class="page-footer">
    <div class="logo">wirkaufen<span>deine</span>immobilie</div>
    <div>Vertraulich · Erstellt für ${vorname} · ${datum}</div>
    <div>Ref: ${refNr} · 3 / 3</div>
  </div>
</div>

</body>
</html>`;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/roi-pdf.ts
git commit -m "feat: WKDI-branded PDF template matching Handlungsempfehlung design style"
```

---

## Task 5: API Endpoint

**Files:**
- Create: `src/pages/api/roi-report.ts`

- [ ] **Step 1: API Route erstellen**

```typescript
// src/pages/api/roi-report.ts
import type { APIRoute } from 'astro';
import puppeteer from 'puppeteer';
import { calcRoi } from '../../lib/roi-calc.js';
import { generatePdfHtml } from '../../lib/roi-pdf.js';
import { sendTransactionalEmail } from '../../lib/brevo.js';
import { insertRegistration } from '../../lib/db.js';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();

    // Validate required fields
    const required = ['vorname', 'email', 'objekt_typ', 'stadtteil', 'kaufpreis', 'wohnflaeche', 'sanierungskosten', 'exit_strategie'];
    for (const f of required) {
      if (!data[f]) {
        return new Response(JSON.stringify({ error: `Missing: ${f}` }), { status: 400 });
      }
    }

    // Calculate
    const input = {
      objekt_typ: data.objekt_typ,
      stadtteil: data.stadtteil,
      kaufpreis: Number(data.kaufpreis),
      wohnflaeche: Number(data.wohnflaeche),
      sanierungskosten: Number(data.sanierungskosten),
      exit_strategie: data.exit_strategie,
      eigenkapital_pct: Number(data.eigenkapital_pct ?? 30),
    };
    const result = calcRoi(input);

    // Generate PDF
    const refNr = `WKDI-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const datum = new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date());

    const html = generatePdfHtml({ input, result, vorname: data.vorname, email: data.email, refNr, datum });

    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
    });
    await browser.close();

    const pdfBase64 = Buffer.from(pdfBuffer).toString('base64');

    // Send via Brevo
    await sendTransactionalEmail({
      to: { email: data.email, name: data.vorname },
      subject: `Ihre Fix & Flip Kalkulation — ${refNr}`,
      htmlContent: `
        <p>Guten Tag ${data.vorname},</p>
        <p>anbei Ihre persönliche Fix &amp; Flip Kalkulation für Leipzig-${data.stadtteil}.</p>
        <p>Ihr Deal-Score: <strong>${result.deal_score} — ${result.deal_score_label}</strong><br>
        ROI: ${result.roi_pct}% · Netto-Gewinn: ${new Intl.NumberFormat('de-DE',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(result.netto_gewinn)}</p>
        <p>Falls Sie ein konkretes Objekt besprechen möchten — ich bin direkt erreichbar:<br>
        <a href="tel:+493418009000">0341 — 800 900 0</a> · Kein Callcenter, ich selbst.</p>
        <p>Mit freundlichen Grüßen aus Leipzig,<br><strong>Joachim Kleinke</strong><br>
        Immobilienvermittler · § 34c Maklererlaubnis · wirkaufendeineimmobilie.de</p>
      `,
      attachments: [{ content: pdfBase64, name: `WKDI-Fix-Flip-Kalkulation-${refNr}.pdf` }],
    });

    // Save to DB
    insertRegistration({
      typ: 'roi-rechner',
      email: data.email,
      vorname: data.vorname ?? null,
      lead_magnet_data: JSON.stringify({ ...input, result: { roi_pct: result.roi_pct, deal_score: result.deal_score, netto_gewinn: result.netto_gewinn }, refNr }),
    });

    return new Response(JSON.stringify({ success: true, result, refNr }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('roi-report error:', err);
    return new Response(JSON.stringify({ error: 'Interner Fehler' }), { status: 500 });
  }
};
```

- [ ] **Step 2: DB-Schema prüfen** — sicherstellen dass `insertRegistration` `vorname` akzeptiert

```bash
cat ~/code/wkdi-temp/website/src/lib/db.ts | grep -A 20 "insertRegistration"
```

Falls `vorname` fehlt: DB-Schema und `insertRegistration` anpassen.

- [ ] **Step 3: Build-Test**

```bash
cd ~/code/wkdi-temp/website && npm run build 2>&1 | tail -10
```

- [ ] **Step 4: Commit**

```bash
git add src/pages/api/roi-report.ts
git commit -m "feat: roi-report API endpoint with puppeteer PDF + brevo email"
```

---

## Task 6: Neue Images generieren

**Files:**
- Create: `public/images/wkdi-roi-quiz-hero.jpg`
- Create: `public/images/wkdi-roi-teaser-preview.jpg`

- [ ] **Step 1: Quiz-Hero generieren** (Gemini Image Generation)

Prompt:
```
Photorealistic documentary photography. Scene: Rooftop terrace of a Gründerzeit apartment building in Leipzig, Germany, renovation in progress. View over Leipzig rooftops with church spires visible. Renovation tools and blueprints on a table, morning golden light. 85mm, f/2.8, golden hour warm light, amber glow. Landscape orientation 16:9, wider than tall. ABSOLUTELY NO TEXT anywhere in the image, no words, no letters, no numbers, no watermarks.
```

```bash
GOOGLE_API_KEY=AIzaSyDDc0-YTMNv_bEtDPssmFrBh_0aPLK8-5I \
node /tmp/generate-roi-hero.mjs \
  "Photorealistic documentary photography. Scene: Rooftop terrace of a Gründerzeit apartment building in Leipzig, Germany, renovation in progress. View over Leipzig rooftops with church spires visible. Renovation tools and blueprints on a table, morning golden light. 85mm, f/2.8, golden hour warm light, amber glow. Landscape orientation 16:9, wider than tall. ABSOLUTELY NO TEXT anywhere in the image, no words, no letters, no numbers, no watermarks." \
  "/Users/stefan/code/wkdi-temp/website/public/images/wkdi-roi-quiz-hero.jpg"
```

- [ ] **Step 2: Teaser-Preview generieren** (renoviertes Interieur — vorher/nachher Stimmung)

Prompt:
```
Photorealistic documentary photography. Scene: Renovated Gründerzeit apartment interior, Leipzig Germany. Beautiful high ceilings with stucco elements, large windows with wooden frames, warm afternoon light flooding in. Modern minimalist furniture, plants. Fujifilm Pro 400H color palette. 50mm, f/2.8. Landscape orientation 16:9. ABSOLUTELY NO TEXT anywhere in the image, no words, no letters, no numbers, no watermarks.
```

- [ ] **Step 3: Commit**

```bash
git add public/images/wkdi-roi-quiz-hero.jpg public/images/wkdi-roi-teaser-preview.jpg
git commit -m "feat: add roi rechner hero and teaser images"
```

---

## Task 7: ROI Rechner — Quiz UI

**Files:**
- Rewrite: `src/pages/roi-rechner.astro`

Das Quiz nutzt das **bestehende Glassmorphism/ANF-Design-System** von index.astro:
- Dark background (`#0B1426`)
- Glassmorphism-Cards wie die Szenarien-Cards auf index
- Mouse-tracking glow bei den Objekt-Typ-Cards
- Szenarien-Images als Card-Backgrounds
- Blaue Akzentfarbe `#2B6CB0`
- Serif-Typo für Headlines

**Quiz-Struktur (4 Steps + Gate + Result):**

```astro
---
// src/pages/roi-rechner.astro
import Layout from '../layouts/Layout.astro';
---
<Layout title="Fix & Flip Rechner Leipzig — Ihre persönliche Rendite-Analyse | wirkaufendeineimmobilie.de"
        description="Berechnen Sie Ihren Fix & Flip ROI in 3 Minuten — mit echten Leipziger Marktdaten. Email-Report inkl. BEG-Förderprüfung und Deal-Score.">

<!-- HERO: Split Layout (text left, image right — wie makler/tippgeber) -->
<section class="roi-hero">
  <div class="container roi-hero__split">
    <div class="roi-hero__text">
      <div class="label">Fix &amp; Flip Analyse · Leipzig</div>
      <h1>Was bringt<br /><span class="text-accent">dieser Deal wirklich?</span></h1>
      <p>3 Minuten. Echte Marktdaten. Persönlicher Report per E-Mail.</p>
      <div class="roi-hero__stats">
        <div class="roi-stat"><span>3 Min.</span>Quiz</div>
        <div class="roi-stat"><span>48h</span>Marktdaten-Update</div>
        <div class="roi-stat"><span>PDF</span>Report per Mail</div>
      </div>
    </div>
    <div class="roi-hero__img" aria-hidden="true">
      <img src="/images/wkdi-roi-quiz-hero.jpg" alt="Fix und Flip Leipzig" />
    </div>
  </div>
</section>

<!-- PROGRESS BAR -->
<div class="roi-progress-bar">
  <div class="container">
    <div class="roi-progress-steps">
      <div class="roi-progress-step active" data-step="1"><span>1</span>Objekt-Typ</div>
      <div class="roi-progress-step" data-step="2"><span>2</span>Kaufdaten</div>
      <div class="roi-progress-step" data-step="3"><span>3</span>Strategie</div>
      <div class="roi-progress-step" data-step="4"><span>4</span>Report</div>
    </div>
    <div class="roi-progress-fill"><div class="roi-progress-fill__bar" id="progress-bar" style="width:25%"></div></div>
  </div>
</div>

<!-- QUIZ CONTAINER (dark background, ANF-style) -->
<section class="roi-quiz-section">
  <div class="container">

    <!-- STEP 1: Objekt-Typ (Glassmorphism Cards mit Szenarien-Images) -->
    <div class="quiz-step active" id="step-1">
      <div class="quiz-step__header">
        <h2>Welche Situation trifft auf Ihr Objekt zu?</h2>
        <p>Das bestimmt Förderoptionen und Einstiegspreis-Korridor.</p>
      </div>
      <div class="objekt-cards">
        <!-- 5 Cards, each with background image from existing scenario images -->
        <button class="objekt-card" data-value="messie">
          <div class="objekt-card__bg"><img src="/images/wkdi-szenario-messie.jpg" alt="" /></div>
          <div class="objekt-card__content">
            <div class="objekt-card__icon">🏚️</div>
            <h3>Messie-Objekt</h3>
            <p>Entrümpelung nötig. Größter Abschlag, höchste Marge.</p>
          </div>
        </button>
        <button class="objekt-card" data-value="erbengemeinschaft">
          <div class="objekt-card__bg"><img src="/images/wkdi-szenario-erbengemeinschaft.jpg" alt="" /></div>
          <div class="objekt-card__content">
            <div class="objekt-card__icon">👨‍👩‍👧</div>
            <h3>Erbengemeinschaft</h3>
            <p>Einigungsdruck. Off-Market mit Zeitvorteil.</p>
          </div>
        </button>
        <button class="objekt-card" data-value="insolvenz">
          <div class="objekt-card__bg"><img src="/images/wkdi-szenario-insolvenz.jpg" alt="" /></div>
          <div class="objekt-card__content">
            <div class="objekt-card__icon">⚖️</div>
            <h3>Insolvenzverfahren</h3>
            <p>Schneller Abschluss gewünscht. Bonitätsprüfung nötig.</p>
          </div>
        </button>
        <button class="objekt-card" data-value="geg">
          <div class="objekt-card__bg"><img src="/images/wkdi-szenario-geg.jpg" alt="" /></div>
          <div class="objekt-card__content">
            <div class="objekt-card__icon">🌿</div>
            <h3>GEG-Sanierungsstau</h3>
            <p>Energieklasse E–H. BEG-Förderung bis 40% möglich.</p>
          </div>
        </button>
        <button class="objekt-card" data-value="standard">
          <div class="objekt-card__bg"><img src="/images/wkdi-szenario-kapitalanleger.jpg" alt="" /></div>
          <div class="objekt-card__content">
            <div class="objekt-card__icon">🏗️</div>
            <h3>Sanierungsobjekt</h3>
            <p>Normaler Renovierungsbedarf ohne Sonderfälle.</p>
          </div>
        </button>
      </div>
    </div>

    <!-- STEP 2: Zahlen -->
    <div class="quiz-step" id="step-2">
      <div class="quiz-step__header">
        <h2>Ihre Kaufdaten</h2>
        <p>Grobe Schätzungen reichen — wir rechnen mit echten Marktpreisen.</p>
      </div>
      <div class="quiz-inputs-grid">
        <div class="quiz-input-group">
          <label>Stadtteil Leipzig</label>
          <select id="stadtteil">
            <option value="plagwitz">Plagwitz (3.200 €/m²)</option>
            <option value="suedvorstadt">Südvorstadt (3.100 €/m²)</option>
            <option value="gohlis">Gohlis (2.800 €/m²)</option>
            <option value="lindenau" selected>Lindenau (2.600 €/m²)</option>
            <option value="reudnitz">Reudnitz-Thonberg (2.400 €/m²)</option>
            <option value="neustadt">Neustadt-Neuschönefeld (2.300 €/m²)</option>
            <option value="volkmarsdorf">Volkmarsdorf (2.000 €/m²)</option>
            <option value="sellerhausen">Sellerhausen (1.900 €/m²)</option>
          </select>
        </div>
        <div class="quiz-input-group">
          <label>Kaufpreis (€)</label>
          <div class="quiz-slider-group">
            <input type="range" id="kaufpreis-slider" min="20000" max="200000" step="5000" value="65000" />
            <input type="number" id="kaufpreis" value="65000" min="0" step="1000" />
          </div>
        </div>
        <div class="quiz-input-group">
          <label>Wohnfläche (m²)</label>
          <div class="quiz-slider-group">
            <input type="range" id="wohnflaeche-slider" min="20" max="200" step="5" value="55" />
            <input type="number" id="wohnflaeche" value="55" min="1" step="1" />
          </div>
        </div>
        <div class="quiz-input-group">
          <label>Sanierungskosten (€)</label>
          <div class="quiz-slider-group">
            <input type="range" id="sanierung-slider" min="5000" max="150000" step="5000" value="35000" />
            <input type="number" id="sanierungskosten" value="35000" min="0" step="1000" />
          </div>
        </div>
      </div>
      <!-- Live preview mini-result -->
      <div class="quiz-live-preview">
        <span>Geschätzte Gesamtinvestition: <strong id="live-invest">—</strong></span>
        <span>Erwarteter ARV: <strong id="live-arv">—</strong></span>
      </div>
      <div class="quiz-nav">
        <button class="quiz-btn-back" onclick="goStep(1)">← Zurück</button>
        <button class="quiz-btn-next" onclick="goStep(3)">Weiter →</button>
      </div>
    </div>

    <!-- STEP 3: Strategie -->
    <div class="quiz-step" id="step-3">
      <div class="quiz-step__header">
        <h2>Ihre Exit-Strategie</h2>
        <p>Das bestimmt Steuer und langfristige Rendite.</p>
      </div>
      <div class="strategy-cards">
        <button class="strategy-card" data-value="flip">
          <div class="strategy-card__icon">⚡</div>
          <h3>Fix &amp; Flip</h3>
          <p>Sanieren und innerhalb von 12 Monaten verkaufen. Schneller Cashflow, Spekulationssteuer fällig.</p>
          <div class="strategy-card__tag">Schneller Return</div>
        </button>
        <button class="strategy-card" data-value="langfrist">
          <div class="strategy-card__icon">📈</div>
          <h3>Langfrist-Vermietung</h3>
          <p>Halten und vermieten. Nach 10 Jahren steuerfreier Exit. Stabile Mietrendite.</p>
          <div class="strategy-card__tag">Steuerfreier Exit</div>
        </button>
      </div>
      <div class="quiz-input-group" style="max-width:400px;margin-top:32px">
        <label>Eigenkapitalanteil: <strong id="ek-label">30%</strong></label>
        <input type="range" id="eigenkapital" min="10" max="100" step="5" value="30" />
      </div>
      <div class="quiz-nav">
        <button class="quiz-btn-back" onclick="goStep(2)">← Zurück</button>
        <button class="quiz-btn-next" onclick="showGate()">Ergebnis anzeigen →</button>
      </div>
    </div>

    <!-- BLUR GATE -->
    <div class="quiz-step" id="step-gate">
      <div class="gate-container">
        <div class="gate-blurred" aria-hidden="true">
          <!-- Blurred placeholder of result -->
          <div class="gate-fake-score">B+</div>
          <div class="gate-fake-bars">
            <div class="gate-fake-bar" style="width:70%"></div>
            <div class="gate-fake-bar" style="width:45%"></div>
            <div class="gate-fake-bar" style="width:85%"></div>
          </div>
        </div>
        <div class="gate-overlay">
          <h2>Ihre Analyse ist fertig.</h2>
          <p>Erhalten Sie Ihren Deal-Score, die vollständige Kalkulation und den personalisierten PDF-Report.</p>
          <div class="gate-form">
            <input type="text" id="vorname" placeholder="Ihr Vorname" />
            <input type="email" id="email" placeholder="Ihre E-Mail-Adresse" />
            <button class="gate-submit" id="submit-btn" onclick="submitReport()">
              <span class="gate-submit__text">Persönlichen Report erhalten →</span>
              <span class="gate-submit__loading" style="display:none">Wird generiert…</span>
            </button>
            <p class="gate-disclaimer">Kostenlos. Kein Spam. Nur der Report.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- RESULT (after email submission) -->
    <div class="quiz-step" id="step-result">
      <div class="result-header">
        <div class="result-score-badge" id="result-score-badge">B</div>
        <div>
          <h2 id="result-score-label">Solides Potential</h2>
          <p id="result-ref">Ref: WKDI-2026-XXXXXX — Report wurde an Ihre E-Mail gesendet</p>
        </div>
      </div>
      <!-- Waterfall visual -->
      <div class="result-waterfall" id="result-waterfall">
        <!-- Injected by JS -->
      </div>
      <!-- Traffic Lights -->
      <div class="result-checks" id="result-checks">
        <!-- Injected by JS -->
      </div>
      <!-- CTA -->
      <div class="result-cta">
        <h3>Haben Sie ein konkretes Objekt?</h3>
        <p>Joachim Kleinke prüft es persönlich — kostenlos, 48h.</p>
        <a href="/#contact" class="btn btn-primary">Kostenlose Erstbewertung anfragen →</a>
        <a href="tel:+493418009000" class="btn btn-secondary">0341 — 800 900 0</a>
      </div>
    </div>

  </div><!-- /container -->
</section>

<!-- Alle CSS + JS inline in der Datei -->
<style>
/* ... komplettes CSS hier (Dark Theme, Glassmorphism-Cards, ANF-Glow,
   Blur-Gate, Result, Sliders, Progress Bar) ... */
</style>

<script>
/* ... Quiz State Machine, Live-Calc, Gate-Submit, Result-Render ... */
</script>

</Layout>
```

**Wichtige CSS-Regeln (vollständig implementieren):**

```css
/* Dark Background matching index.astro */
.roi-quiz-section {
  background: #0B1426;
  padding: var(--space-16) 0;
  min-height: 60vh;
}

/* Objekt-Cards (Glassmorphism wie Szenarien-Cards) */
.objekt-card {
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,0.08);
  background: rgba(255,255,255,0.04);
  backdrop-filter: blur(8px);
  border-radius: var(--radius-lg);
  padding: 32px 24px;
  cursor: pointer;
  transition: border-color 0.3s, transform 0.2s;
  text-align: left;
  color: white;
}
.objekt-card__bg {
  position: absolute; inset: 0; z-index: 0;
}
.objekt-card__bg img {
  width: 100%; height: 100%;
  object-fit: cover;
  opacity: 0.15;
  filter: grayscale(30%);
  transition: opacity 0.4s;
}
.objekt-card:hover .objekt-card__bg img { opacity: 0.45; }
.objekt-card.selected {
  border-color: #2B6CB0;
  background: rgba(43,108,176,0.15);
}
.objekt-card__content { position: relative; z-index: 1; }

/* Blur Gate */
.gate-container { position: relative; }
.gate-blurred {
  filter: blur(12px);
  opacity: 0.4;
  pointer-events: none;
  padding: 48px;
}
.gate-overlay {
  position: absolute; inset: 0;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  text-align: center; color: white;
  padding: 32px;
}
.gate-form input {
  display: block; width: 100%; max-width: 360px;
  margin: 8px auto;
  padding: 14px 18px;
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 8px; color: white; font-size: 16px;
}
.gate-submit {
  width: 100%; max-width: 360px;
  margin-top: 16px;
  padding: 16px 32px;
  background: #2B6CB0; color: white;
  border-radius: 8px; font-size: 16px; font-weight: 700;
  cursor: pointer; border: none;
  transition: background 0.2s;
}

/* Result Score Badge */
.result-score-badge {
  width: 72px; height: 72px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 32px; font-weight: 800; color: white;
  /* color set by JS based on score */
}

/* Progress Bar */
.roi-progress-fill { height: 3px; background: rgba(255,255,255,0.1); margin-top: 12px; }
.roi-progress-fill__bar { height: 100%; background: #2B6CB0; transition: width 0.4s ease; }
```

**JS State Machine:**

```javascript
const state = {
  step: 1,
  objekt_typ: null,
  stadtteil: 'lindenau',
  kaufpreis: 65000,
  wohnflaeche: 55,
  sanierungskosten: 35000,
  exit_strategie: null,
  eigenkapital_pct: 30,
};

function goStep(n) {
  document.querySelectorAll('.quiz-step').forEach(s => s.classList.remove('active'));
  document.getElementById(`step-${n}`)?.classList.add('active');
  document.getElementById('progress-bar').style.width = `${n * 25}%`;
  document.querySelectorAll('.roi-progress-step').forEach((s, i) => {
    s.classList.toggle('active', i < n);
  });
  state.step = n;
  window.scrollTo({ top: document.querySelector('.roi-quiz-section').offsetTop - 80, behavior: 'smooth' });
}

function showGate() {
  // Validate step 3
  if (!state.exit_strategie) { alert('Bitte Strategie wählen'); return; }
  document.querySelectorAll('.quiz-step').forEach(s => s.classList.remove('active'));
  document.getElementById('step-gate').classList.add('active');
}

async function submitReport() {
  const vorname = document.getElementById('vorname').value.trim();
  const email = document.getElementById('email').value.trim();
  if (!vorname || !email) { alert('Bitte Name und E-Mail eingeben'); return; }
  if (!email.includes('@')) { alert('Bitte gültige E-Mail eingeben'); return; }

  const btn = document.getElementById('submit-btn');
  btn.querySelector('.gate-submit__text').style.display = 'none';
  btn.querySelector('.gate-submit__loading').style.display = 'inline';
  btn.disabled = true;

  try {
    const res = await fetch('/api/roi-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...state, vorname, email }),
    });
    const data = await res.json();
    if (data.success) {
      showResult(data.result, data.refNr, vorname);
    } else {
      alert('Fehler: ' + (data.error || 'Unbekannter Fehler'));
    }
  } catch(e) {
    alert('Verbindungsfehler. Bitte erneut versuchen.');
  } finally {
    btn.querySelector('.gate-submit__text').style.display = 'inline';
    btn.querySelector('.gate-submit__loading').style.display = 'none';
    btn.disabled = false;
  }
}

function showResult(result, refNr, vorname) {
  document.querySelectorAll('.quiz-step').forEach(s => s.classList.remove('active'));
  document.getElementById('step-result').classList.add('active');
  document.getElementById('progress-bar').style.width = '100%';

  const scoreColors = { A: '#16a34a', B: '#2563eb', C: '#d97706', D: '#dc2626' };
  const badge = document.getElementById('result-score-badge');
  badge.textContent = result.deal_score;
  badge.style.background = scoreColors[result.deal_score];

  document.getElementById('result-score-label').textContent = result.deal_score_label;
  document.getElementById('result-ref').textContent = `Ref: ${refNr} — Report wurde an Ihre E-Mail gesendet`;

  // Waterfall bars
  const fmt = n => new Intl.NumberFormat('de-DE',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(n);
  const maxVal = result.verkaufspreis;
  document.getElementById('result-waterfall').innerHTML = `
    <div class="wf-bar"><div class="wf-fill wf-fill--neg" style="width:${(result.kaufpreis/maxVal*100).toFixed(1)}%"></div><span>Kaufpreis: ${fmt(result.kaufpreis)}</span></div>
    <div class="wf-bar"><div class="wf-fill wf-fill--neg" style="width:${(result.nebenkosten_gesamt/maxVal*100).toFixed(1)}%"></div><span>Nebenkosten: ${fmt(result.nebenkosten_gesamt)}</span></div>
    <div class="wf-bar"><div class="wf-fill wf-fill--neg" style="width:${(result.sanierungskosten/maxVal*100).toFixed(1)}%"></div><span>Sanierung: ${fmt(result.sanierungskosten)}</span></div>
    ${result.beg_foerderung > 0 ? `<div class="wf-bar"><div class="wf-fill wf-fill--pos" style="width:${(result.beg_foerderung/maxVal*100).toFixed(1)}%"></div><span>BEG-Förderung: +${fmt(result.beg_foerderung)}</span></div>` : ''}
    <div class="wf-bar wf-bar--total"><div class="wf-fill wf-fill--total" style="width:${(result.netto_gewinn/maxVal*100).toFixed(1)}%"></div><span>Netto-Gewinn: +${fmt(result.netto_gewinn)} (${result.roi_pct}% ROI)</span></div>
  `;

  // Traffic lights
  document.getElementById('result-checks').innerHTML = `
    <div class="rcheck ${result.roi_pct >= 15 ? 'ok' : result.roi_pct >= 8 ? 'warn' : 'fail'}">
      <div>${result.roi_pct >= 15 ? '✅' : result.roi_pct >= 8 ? '⚠️' : '❌'}</div>
      <div class="rcheck-label">ROI</div>
      <div class="rcheck-val">${result.roi_pct}%</div>
    </div>
    <div class="rcheck ${result.regel_70_check ? 'ok' : 'fail'}">
      <div>${result.regel_70_check ? '✅' : '❌'}</div>
      <div class="rcheck-label">70%-Regel</div>
      <div class="rcheck-val">${result.regel_70_check ? 'Bestanden' : 'Nicht bestanden'}</div>
    </div>
    <div class="rcheck ${result.spekulationssteuer_check ? 'ok' : 'warn'}">
      <div>${result.spekulationssteuer_check ? '✅' : '⚠️'}</div>
      <div class="rcheck-label">Spekulationssteuer</div>
      <div class="rcheck-val">${result.spekulationssteuer_check ? 'Steuerfrei' : 'Fällig'}</div>
    </div>
  `;
}
```

- [ ] **Step 2: Quiz vollständig implementieren** (alle CSS-Variablen, Slider-Sync, Card-Selection, ANF Mouse-Glow)

- [ ] **Step 3: Build-Test**

```bash
npm run build 2>&1 | tail -10
```

- [ ] **Step 4: Lokaler Funktionstest** (localhost:4399/roi-rechner)

Testen: Step-Navigation, Card-Selection, Slider-Sync, Gate-Overlay

- [ ] **Step 5: Commit**

```bash
git add src/pages/roi-rechner.astro
git commit -m "feat: roi rechner multi-step quiz funnel with glassmorphism design and blur gate"
```

---

## Task 8: Teaser auf index.astro

**Files:**
- Modify: `src/pages/index.astro`

Füge eine neue Sektion **vor dem Footer** ein (nach den Szenario-Cards):

```html
<!-- ROI RECHNER TEASER -->
<section class="section roi-teaser">
  <div class="container roi-teaser__split">
    <div class="roi-teaser__pdf-preview">
      <!-- PDF Cover Mockup (angewinkelt) -->
      <div class="roi-teaser__pdf-card">
        <div class="roi-teaser__pdf-header">
          <span class="roi-teaser__pdf-logo">wirkaufendeineimmobilie</span>
          <span class="roi-teaser__pdf-badge">VERTRAULICH</span>
        </div>
        <div class="roi-teaser__pdf-eyebrow">Ihre persönliche Fix & Flip Kalkulation</div>
        <div class="roi-teaser__pdf-title">Ihr Deal.<br>Durchgerechnet.</div>
        <div class="roi-teaser__pdf-meta">
          <span>Max M. · Leipzig-Lindenau · 21.03.2026</span>
        </div>
        <div class="roi-teaser__pdf-score">
          <div class="roi-teaser__score-badge">B</div>
          <div>
            <div class="roi-teaser__score-label">Solides Potential</div>
            <div class="roi-teaser__score-sub">ROI: 17% · Netto: +24.800 €</div>
          </div>
        </div>
        <img src="/images/wkdi-pdf-cover-fassade.png" class="roi-teaser__pdf-bg" alt="" aria-hidden="true" />
      </div>
    </div>
    <div class="roi-teaser__text">
      <div class="label">Fix & Flip Analyse · Kostenlos</div>
      <h2>3 Minuten.<br /><span class="text-accent">Persönlicher Report.</span></h2>
      <p>Geben Sie Kaufpreis, Fläche und Sanierungskosten ein — wir berechnen ROI, BEG-Förderung, 70%-Regel-Check und senden Ihnen das Ergebnis als professionelles PDF per E-Mail.</p>
      <ul class="roi-teaser__benefits">
        <li>✓ Echte Leipziger Marktpreise nach Stadtteil</li>
        <li>✓ BEG-Förderungsprüfung (bis 40% auf Sanierung)</li>
        <li>✓ Deal-Score A–D + 70%-Regel-Check</li>
        <li>✓ Persönliches PDF-Report per E-Mail</li>
      </ul>
      <a href="/roi-rechner" class="btn btn-primary">Zur Fix & Flip Analyse →</a>
    </div>
  </div>
</section>
```

**CSS für Teaser:**

```css
.roi-teaser { background: #0B1426; padding: var(--space-20) 0; }
.roi-teaser__split {
  display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-16); align-items: center;
}
.roi-teaser__pdf-card {
  background: linear-gradient(160deg, #0f172a, #1e3a5f);
  border-radius: var(--radius-lg); padding: 40px; color: white;
  position: relative; overflow: hidden;
  transform: rotate(-2deg); box-shadow: 0 32px 80px rgba(0,0,0,0.5);
}
.roi-teaser__pdf-bg {
  position: absolute; inset: 0; width: 100%; height: 100%;
  object-fit: cover; opacity: 0.08;
}
```

- [ ] **Step 2: Build + visuell prüfen** (localhost:4399)

- [ ] **Step 3: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat: add roi rechner teaser section to index.astro with pdf preview mockup"
```

---

## Task 9: DB Schema Update

**Files:**
- Modify: `src/lib/db.ts`

- [ ] **Step 1: Prüfen ob `vorname` Spalte existiert**

```bash
cd ~/code/wkdi-temp/website && node -e "
const db = require('better-sqlite3')('src/data/wkdi.db');
console.log(db.prepare(\"PRAGMA table_info(registrations)\").all().map(c=>c.name));
"
```

- [ ] **Step 2: Falls fehlend — Migration**

```bash
node -e "
const db = require('better-sqlite3')('src/data/wkdi.db');
try { db.exec('ALTER TABLE registrations ADD COLUMN vorname TEXT'); console.log('Added vorname'); }
catch(e) { console.log('Already exists or error:', e.message); }
"
```

- [ ] **Step 3: insertRegistration in db.ts prüfen + vorname ergänzen falls nötig**

- [ ] **Step 4: Commit**

```bash
git add src/lib/db.ts
git commit -m "chore: add vorname field to registrations db"
```

---

## Task 10: Deploy + Test

- [ ] **Step 1: Alle Changes committen**

```bash
cd ~/code/wkdi-temp/website && git status && git add -A && git commit -m "feat: complete roi rechner quiz funnel with pdf + brevo integration"
```

- [ ] **Step 2: Push + Coolify Deploy**

```bash
git push origin feat/website-build
# Coolify Deploy via API:
curl -s -X GET "http://178.104.15.187:8000/api/v1/applications/wisjftvt2q9b53z13nciq9dh/deploy" \
  -H "Authorization: Bearer 5|CiJKjAOYbqBEVIHSWVUgQJf1D1sGKxC8z2DJvITl1aa0bd5e" | jq '.message'
```

- [ ] **Step 3: End-to-End Test**

1. wirkaufendeineimmobilie.de/roi-rechner aufrufen
2. Quiz komplett durchlaufen (alle 4 Steps)
3. Email eingeben → Report wird generiert
4. Email erhalten mit PDF Attachment prüfen
5. PDF öffnen: Cover, Kalkulation, Verdict — alle 3 Seiten

- [ ] **Step 4: BREVO_API_KEY in Coolify Environment Variables setzen**

```
BREVO_API_KEY=BREVO_API_KEY_REDACTED
```

---

## Zusammenfassung

| Task | Aufwand | Output |
|------|---------|--------|
| 1. Puppeteer | 5 min | PDF-Generierung möglich |
| 2. roi-calc.ts | 10 min | Kalkulationslogik |
| 3. brevo.ts | 5 min | Email-Helper |
| 4. roi-pdf.ts | 15 min | 3-seitiges WKDI-PDF |
| 5. api/roi-report.ts | 10 min | API Endpoint |
| 6. Images generieren | 10 min | 2 neue Bilder |
| 7. roi-rechner.astro | 30 min | Vollständiger Quiz-Funnel |
| 8. index.astro Teaser | 10 min | PDF-Preview Sektion |
| 9. DB Schema | 5 min | vorname Feld |
| 10. Deploy + Test | 10 min | Live + E2E-Test |
