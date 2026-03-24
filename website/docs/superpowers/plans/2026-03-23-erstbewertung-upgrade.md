# Erstbewertung Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 2-stufiger Bewertungs-Funnel mit automatischer Preisindikation-PDF — Eigentümer füllt Kontakt + Objekt-Daten aus und bekommt sofort ein personalisiertes PDF per Mail.

**Architecture:** Calc-Engine (marktdaten.ts + calc.ts) → PDF-Generator (pdf.ts) → direkt im PATCH-Handler von bewertung.ts aufgerufen (kein HTTP-Hop). Frontend: index.astro Step 1 fix + unterlagen.astro Step 0 entfernen + Pain-Freitext. Muster identisch zu roi-calc.ts / roi-pdf.ts.

**Tech Stack:** Astro SSR, better-sqlite3, Puppeteer, Brevo API, Vitest (Tests nur für calc.ts)

---

## File Map

| Datei | Aktion | Verantwortlichkeit |
|-------|--------|-------------------|
| `src/lib/preisindikation/marktdaten.ts` | Create | Alle Konstanten: MARKTDATEN_ETW, MARKTDATEN_EFH, PLZ_LAGE, ENERGIEKLASSE_FAKTOREN, ZUSTAND_FAKTOREN |
| `src/lib/preisindikation/calc.ts` | Create | calcPreisindikation(), calculateAmpeln(), getEinleitungssatz(), formatEur() |
| `src/lib/preisindikation/pdf.ts` | Create | generatePreisindikationPdf() — HTML-Template + Puppeteer + Brevo-Mail |
| `src/tests/preisindikation-calc.test.ts` | Create | Vitest-Tests für calcPreisindikation() |
| `src/lib/db.ts` | Modify | ALTER TABLE: pain_freitext TEXT Spalte hinzufügen |
| `src/pages/api/bewertung.ts` | Modify | PATCH: pain_freitext im UPDATE + calcPreisindikation() + generatePreisindikationPdf() aufrufen |
| `src/pages/unterlagen.astro` | Modify | Step 0 bei URL-Params überspringen, Pain-Freitext-Feld, Copy fixes |
| `src/pages/index.astro` | Modify | Schritt 02 + Schritt 03 Sales Copy |

---

## Task 1: Marktdaten-Konstanten

**Files:**
- Create: `src/lib/preisindikation/marktdaten.ts`

- [ ] **Step 1: Datei anlegen**

```typescript
// src/lib/preisindikation/marktdaten.ts

export type Lage = 'zentral' | 'gut' | 'randlage';
export type AmpelColor = 'gruen' | 'gelb' | 'rot';

// €/m² Median ETW — Gutachterausschuss Leipzig 2025
export const MARKTDATEN_ETW: Record<string, { min: number; max: number }> = {
  '042': { min: 1_800, max: 2_400 }, // Leipzig-West/Grünau
  '041': { min: 2_600, max: 3_200 }, // Leipzig-Mitte/Nord
  '044': { min: 2_200, max: 2_800 }, // Leipzig-Ost/Süd
  'default': { min: 2_000, max: 2_600 },
};

// EFH — ca. +25% über ETW (Gutachterausschuss Leipzig 2025)
export const MARKTDATEN_EFH: Record<string, { min: number; max: number }> = {
  '042': { min: 2_200, max: 3_000 },
  '041': { min: 3_200, max: 4_200 },
  '044': { min: 2_700, max: 3_500 },
  'default': { min: 2_500, max: 3_300 },
};

// PLZ-Prefix (3 Stellen) → Lage-Qualität
export const PLZ_LAGE: Record<string, Lage> = {
  '041': 'zentral',  // Mitte, Gohlis, Südvorstadt
  '044': 'gut',      // Connewitz, Reudnitz, Stötteritz
  '042': 'randlage', // Grünau, Lausen, Schönau
  'default': 'gut',
};

// Energieklasse → Preisfaktor
export const ENERGIEKLASSE_FAKTOREN: Record<string, number> = {
  'A+': 1.08, 'A': 1.05, 'B': 1.02, 'C': 1.00,
  'D': 0.97,  'E': 0.93, 'F': 0.88, 'G': 0.82, 'H': 0.64,
};

// Zustand → Preisfaktor
export const ZUSTAND_FAKTOREN: Record<string, number> = {
  'neuwertig': 1.10,
  'gut': 1.00,
  'mittel': 0.92,
  'renovierungsbeduerftig': 0.82,
};

// Vermietungsabschlag
export const VERMIETUNG_ABSCHLAG = 0.12; // 12% weniger bei vermietetem Objekt
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/preisindikation/marktdaten.ts
git commit -m "feat: Preisindikation Marktdaten Leipzig (Gutachterausschuss 2025)"
```

---

## Task 2: Calc-Engine + Tests (TDD)

**Files:**
- Create: `src/tests/preisindikation-calc.test.ts`
- Create: `src/lib/preisindikation/calc.ts`

- [ ] **Step 1: Failing tests schreiben**

```typescript
// src/tests/preisindikation-calc.test.ts
import { describe, it, expect } from 'vitest';
import { calcPreisindikation } from '../lib/preisindikation/calc';

const BASE = {
  plz: '04229',
  immobilientyp: 'etw' as const,
  wohnflaeche: 75,
  baujahr: 1975,
  energieklasse: 'C',
  zustand: 'gut',
  sanierungsstand: 'teilsaniert',
  vermietet: false,
};

describe('calcPreisindikation — Preisberechnung', () => {
  it('gibt ETW-Preisspanne für PLZ 042xx zurück', () => {
    const r = calcPreisindikation(BASE);
    // 75m² × 1800 = 135.000 min, 75m² × 2400 = 180.000 max (vor Faktoren)
    expect(r.preisMin).toBeGreaterThan(100_000);
    expect(r.preisMax).toBeLessThan(250_000);
    expect(r.preisMin).toBeLessThan(r.preisMax);
  });

  it('Energieklasse H gibt niedrigeren Preis als Klasse A', () => {
    const klassH = calcPreisindikation({ ...BASE, energieklasse: 'H' });
    const klassA = calcPreisindikation({ ...BASE, energieklasse: 'A' });
    expect(klassH.preisMax).toBeLessThan(klassA.preisMin);
  });

  it('Vermietet gibt niedrigeren Preis (12% Abschlag)', () => {
    const frei = calcPreisindikation({ ...BASE, vermietet: false });
    const vermietet = calcPreisindikation({ ...BASE, vermietet: true });
    expect(vermietet.preisMax).toBeLessThan(frei.preisMax);
  });

  it('MFH gibt preisMin=0 und preisMax=0 (auf Anfrage)', () => {
    const r = calcPreisindikation({ ...BASE, immobilientyp: 'mfh' });
    expect(r.preisMin).toBe(0);
    expect(r.preisMax).toBe(0);
    expect(r.aufAnfrage).toBe(true);
  });
});

describe('calcPreisindikation — Ampeln', () => {
  it('Energieklasse H + schlechter Zustand → Preispotenzial rot', () => {
    const r = calcPreisindikation({ ...BASE, energieklasse: 'H', zustand: 'renovierungsbeduerftig' });
    expect(r.ampeln.preispotenzial).toBe('rot');
  });

  it('Energieklasse A + guter Zustand → Preispotenzial grün', () => {
    const r = calcPreisindikation({ ...BASE, energieklasse: 'A', zustand: 'gut' });
    expect(r.ampeln.preispotenzial).toBe('gruen');
  });

  it('Vermietet + PLZ 042 (randlage) → Vermarktungsdauer rot', () => {
    const r = calcPreisindikation({ ...BASE, vermietet: true, plz: '04229' });
    expect(r.ampeln.vermarktungsdauer).toBe('rot');
  });

  it('gibt immer einen Einleitungssatz zurück', () => {
    const r = calcPreisindikation(BASE);
    expect(r.einleitungssatz).toBeTruthy();
    expect(r.einleitungssatz.length).toBeGreaterThan(20);
  });
});
```

- [ ] **Step 2: Tests ausführen — müssen FEHLSCHLAGEN**

```bash
cd /Users/stefan/code/brown2green/website && npm test -- preisindikation-calc
```

Expected: `Cannot find module '../lib/preisindikation/calc'`

- [ ] **Step 3: calc.ts implementieren**

```typescript
// src/lib/preisindikation/calc.ts
import {
  MARKTDATEN_ETW, MARKTDATEN_EFH, PLZ_LAGE, ENERGIEKLASSE_FAKTOREN,
  ZUSTAND_FAKTOREN, VERMIETUNG_ABSCHLAG, type AmpelColor, type Lage,
} from './marktdaten.js';

export type Immobilientyp = 'etw' | 'efh' | 'mfh' | 'grundstueck';

export interface PreisindikationInput {
  plz: string;
  immobilientyp: Immobilientyp;
  wohnflaeche: number;
  baujahr: number;
  energieklasse?: string | null;
  zustand?: string | null;
  sanierungsstand?: string | null;
  vermietet?: boolean;
}

export interface PreisindikationResult {
  preisMin: number;
  preisMax: number;
  qmPreisMin: number;
  qmPreisMax: number;
  aufAnfrage: boolean;
  ampeln: {
    preispotenzial: AmpelColor;
    vermarktungsdauer: AmpelColor;
    aufwertungspotenzial: AmpelColor;
  };
  einleitungssatz: string;
  lage: Lage;
}

function getPlzPrefix(plz: string): string {
  return plz.substring(0, 3);
}

function getLage(plz: string): Lage {
  const prefix = getPlzPrefix(plz);
  return PLZ_LAGE[prefix] ?? PLZ_LAGE['default'];
}

function getMarktdaten(prefix: string, typ: Immobilientyp) {
  if (typ === 'etw') return MARKTDATEN_ETW[prefix] ?? MARKTDATEN_ETW['default'];
  if (typ === 'efh') return MARKTDATEN_EFH[prefix] ?? MARKTDATEN_EFH['default'];
  return null; // MFH + Grundstück: auf Anfrage
}

function calcAmpelPreispotenzial(energieklasse: string | null | undefined, zustand: string | null | undefined): AmpelColor {
  const ekFaktor = ENERGIEKLASSE_FAKTOREN[energieklasse ?? 'C'] ?? 1.0;
  const zustandFaktor = ZUSTAND_FAKTOREN[zustand ?? 'gut'] ?? 1.0;
  const combined = ekFaktor * zustandFaktor;
  if (combined < 0.80) return 'rot';
  if (combined < 0.95) return 'gelb';
  return 'gruen';
}

function calcAmpelVermarktung(lage: Lage, vermietet: boolean, immobilientyp: Immobilientyp): AmpelColor {
  if (vermietet && lage === 'randlage') return 'rot';
  if (vermietet || (lage === 'randlage' && immobilientyp !== 'efh')) return 'gelb';
  return 'gruen';
}

function calcAmpelAufwertung(energieklasse: string | null | undefined, sanierungsstand: string | null | undefined): AmpelColor {
  const schlechteEk = ['F', 'G', 'H'].includes(energieklasse ?? '');
  const unsaniert = !sanierungsstand || sanierungsstand === 'unsaniert' || sanierungsstand === 'kaum-saniert';
  if (schlechteEk && unsaniert) return 'rot';
  if (schlechteEk || unsaniert) return 'gelb';
  return 'gruen';
}

function getEinleitungssatz(input: PreisindikationInput, lage: Lage): string {
  const typ = input.immobilientyp === 'etw' ? 'Eigentumswohnung' : input.immobilientyp === 'efh' ? 'Einfamilienhaus' : 'Immobilie';
  const baujahr = input.baujahr ? `Baujahr ${input.baujahr}` : '';
  const plzKurz = input.plz.substring(0, 5);
  const ek = input.energieklasse;

  if (ek && ['F', 'G', 'H'].includes(ek)) {
    return `Eine ${typ} mit Energieklasse ${ek} in ${plzKurz} — das kennen wir gut. Genau hier liegt oft mehr Potenzial als der erste Blick vermuten lässt.`;
  }
  if (ek && ['A+', 'A', 'B'].includes(ek)) {
    return `Eine ${typ} mit Energieklasse ${ek} in ${plzKurz} — das ist ein starkes Ausgangsprofil auf dem aktuellen Markt.`;
  }
  if (lage === 'randlage') {
    return `Eine ${typ}${baujahr ? ', ' + baujahr + ',' : ''} in ${plzKurz} — in dieser Lage kommt es auf die richtige Strategie an.`;
  }
  return `Eine ${typ}${baujahr ? ', ' + baujahr + ',' : ''} in ${plzKurz} — ${lage === 'zentral' ? 'eine gefragte Lage in Leipzig' : 'ein solides Profil'}.`;
}

export function calcPreisindikation(input: PreisindikationInput): PreisindikationResult {
  const prefix = getPlzPrefix(input.plz);
  const lage = getLage(input.plz);
  const markt = getMarktdaten(prefix, input.immobilientyp);

  // MFH / Grundstück: auf Anfrage
  if (!markt) {
    return {
      preisMin: 0, preisMax: 0, qmPreisMin: 0, qmPreisMax: 0,
      aufAnfrage: true,
      ampeln: {
        preispotenzial: calcAmpelPreispotenzial(input.energieklasse, input.zustand),
        vermarktungsdauer: calcAmpelVermarktung(lage, input.vermietet ?? false, input.immobilientyp),
        aufwertungspotenzial: calcAmpelAufwertung(input.energieklasse, input.sanierungsstand),
      },
      einleitungssatz: getEinleitungssatz(input, lage),
      lage,
    };
  }

  const ekFaktor = ENERGIEKLASSE_FAKTOREN[input.energieklasse ?? 'C'] ?? 1.0;
  const zustandFaktor = ZUSTAND_FAKTOREN[input.zustand ?? 'gut'] ?? 1.0;
  const vermietungFaktor = input.vermietet ? (1 - VERMIETUNG_ABSCHLAG) : 1.0;
  const gesamtFaktor = ekFaktor * zustandFaktor * vermietungFaktor;

  const m2 = input.wohnflaeche ?? 0;
  const qmMin = Math.round(markt.min * gesamtFaktor);
  const qmMax = Math.round(markt.max * gesamtFaktor);

  return {
    preisMin: Math.round(m2 * qmMin / 1000) * 1000,
    preisMax: Math.round(m2 * qmMax / 1000) * 1000,
    qmPreisMin: qmMin,
    qmPreisMax: qmMax,
    aufAnfrage: false,
    ampeln: {
      preispotenzial: calcAmpelPreispotenzial(input.energieklasse, input.zustand),
      vermarktungsdauer: calcAmpelVermarktung(lage, input.vermietet ?? false, input.immobilientyp),
      aufwertungspotenzial: calcAmpelAufwertung(input.energieklasse, input.sanierungsstand),
    },
    einleitungssatz: getEinleitungssatz(input, lage),
    lage,
  };
}

export function formatEur(n: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency', currency: 'EUR', maximumFractionDigits: 0,
  }).format(n);
}
```

- [ ] **Step 4: Tests ausführen — müssen GRÜN sein**

```bash
cd /Users/stefan/code/brown2green/website && npm test -- preisindikation-calc
```

Expected: All tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/preisindikation/calc.ts src/tests/preisindikation-calc.test.ts
git commit -m "feat: calcPreisindikation — Ampeln, Preisspanne, Einleitungssatz (TDD)"
```

---

## Task 3: PDF-Generator

**Files:**
- Create: `src/lib/preisindikation/pdf.ts`

- [ ] **Step 1: PDF-Lib anlegen**

Orientierung an `src/lib/roi-pdf.ts`. Das PDF hat 5 Abschnitte: Cover, Anschreiben (mit Ampeln), Objekt-Übersicht, Preisindikation, Disclaimer.

```typescript
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
}

function ampelDot(color: string): string {
  return `<span style="display:inline-block;width:12px;height:12px;border-radius:50%;background:${color};margin-right:8px;vertical-align:middle;"></span>`;
}

function generateHtml(opts: PdfInput): string {
  const { vorname, nachname, plz, immobilientyp, wohnflaeche, baujahr, energieklasse, zustand, vermietet, result, datum } = opts;
  const name = `${vorname} ${nachname}`;
  const typLabel = immobilientyp === 'etw' ? 'Eigentumswohnung' : immobilientyp === 'efh' ? 'Einfamilienhaus' : immobilientyp === 'mfh' ? 'Mehrfamilienhaus' : 'Grundstück';
  const anchor = `Ihre ${wohnflaeche ? wohnflaeche + 'm² ' : ''}${typLabel} in ${plz}`;

  const preisBlock = result.aufAnfrage
    ? `<p style="font-size:22px;font-weight:700;color:#1e293b;">Auf persönliche Anfrage</p>
       <p style="color:#64748b;margin-top:8px;">Für Mehrfamilienhäuser und Grundstücke erstellt Joachim Kleinke die Kalkulation individuell.</p>`
    : `<p style="font-size:32px;font-weight:800;color:#1e3a5f;letter-spacing:-1px;">
         ${formatEur(result.preisMin)} – ${formatEur(result.preisMax)}
       </p>
       <p style="color:#64748b;margin-top:4px;">ca. ${formatEur(result.qmPreisMin)} – ${formatEur(result.qmPreisMax)} / m²</p>`;

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

export async function generatePreisindikationPdf(opts: PdfInput): Promise<void> {
  const html = generateHtml(opts);

  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });
  const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
  await browser.close();

  const pdfBase64 = Buffer.from(pdfBuffer).toString('base64');
  const dateiname = `Preisindikation-${opts.nachname}-${opts.datum.replace(/\./g, '')}.pdf`;

  const anschreiben = opts.result.aufAnfrage
    ? `<p>Hallo ${opts.vorname},</p>
       <p>vielen Dank für Ihre Anfrage. Im Anhang finden Sie Ihre erste Objektübersicht. Joachim Kleinke erstellt die Preisindikation für Ihre Immobilie persönlich und meldet sich innerhalb von 48 Stunden bei Ihnen.</p>`
    : `<p>Hallo ${opts.vorname},</p>
       <p>${opts.result.einleitungssatz}</p>
       <p>Im Anhang finden Sie Ihre persönliche Preisindikation für <strong>${opts.wohnflaeche ? opts.wohnflaeche + 'm² ' : ''}${opts.immobilientyp === 'etw' ? 'Eigentumswohnung' : 'Immobilie'} in ${opts.plz}</strong> — erstellt auf Basis der aktuellen Marktdaten des Gutachterausschusses Leipzig.</p>
       <p>Joachim Kleinke ruft Sie in den nächsten 48 Stunden persönlich zurück.</p>
       <p>Viele Grüße,<br>Joachim Kleinke<br>wirkaufendeineimmobilie.de</p>`;

  await sendTransactionalEmail({
    to: { email: opts.email, name: opts.vorname },
    subject: `Ihre persönliche Preisindikation — ${opts.wohnflaeche ? opts.wohnflaeche + 'm² ' : ''}in ${opts.plz}`,
    htmlContent: anschreiben,
    attachments: [{ content: pdfBase64, name: dateiname }],
  });
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/preisindikation/pdf.ts
git commit -m "feat: generatePreisindikationPdf — Puppeteer + Brevo PDF-Mail"
```

---

## Task 4: DB-Migration (pain_freitext)

**Files:**
- Modify: `src/lib/db.ts`

- [ ] **Step 1: Idempotente Spalte hinzufügen**

In `src/lib/db.ts` nach dem letzten `try { db.exec(...objekt_step_done...) }` Block einfügen:

```typescript
try { db.exec(`ALTER TABLE registrations ADD COLUMN pain_freitext TEXT`); } catch {}
```

- [ ] **Step 2: Prüfen dass db.ts noch sauber kompiliert**

```bash
cd /Users/stefan/code/brown2green/website && npm run build 2>&1 | tail -5
```

Expected: Kein Fehler

- [ ] **Step 3: Commit**

```bash
git add src/lib/db.ts
git commit -m "feat: db migration — pain_freitext Spalte für Erstbewertung"
```

---

## Task 5: PATCH-Handler updaten (bewertung.ts)

**Files:**
- Modify: `src/pages/api/bewertung.ts`

- [ ] **Step 1: Import hinzufügen**

Am Anfang von `bewertung.ts` nach den bestehenden Imports:

```typescript
import { calcPreisindikation } from '../../lib/preisindikation/calc';
import { generatePreisindikationPdf } from '../../lib/preisindikation/pdf';
```

- [ ] **Step 2: PATCH-Body um pain_freitext erweitern**

In der PATCH-Handler-Funktion, die `const { ref, email, baujahr, ... } = body;` Zeile erweitern:

```typescript
const { ref, email, baujahr, wohnflaeche, energieklasse, heizung_baujahr,
        sanierungsstand, was_saniert, zustand, besonderheit, stellplatz,
        vermietet, etage, pain_freitext } = body;
```

- [ ] **Step 3: UPDATE-SQL um pain_freitext erweitern**

Beide UPDATE-Statements (ref-basiert und email-basiert) um `pain_freitext=?` erweitern und im `stmt.run(...)` Call `pain_freitext ?? null` an der richtigen Position einfügen (vor `ref || email`).

Beispiel für ref-basiertes Statement:
```typescript
const stmt = ref
  ? db.prepare(`UPDATE registrations SET
      baujahr=?, wohnflaeche=?, energieklasse=?, heizung_baujahr=?,
      sanierungsstand=?, was_saniert=?, zustand=?, besonderheit=?,
      stellplatz=?, vermietet=?, etage=?, pain_freitext=?, objekt_step_done=1
      WHERE id=?`)
  : db.prepare(`UPDATE registrations SET
      baujahr=?, wohnflaeche=?, energieklasse=?, heizung_baujahr=?,
      sanierungsstand=?, was_saniert=?, zustand=?, besonderheit=?,
      stellplatz=?, vermietet=?, etage=?, pain_freitext=?, objekt_step_done=1
      WHERE email=? AND typ='bewertung' ORDER BY id DESC LIMIT 1`);

stmt.run(
  baujahr ?? null, wohnflaeche ?? null, energieklasse ?? null, heizung_baujahr ?? null,
  sanierungsstand ?? null, was_saniert ? JSON.stringify(was_saniert) : null,
  zustand ?? null, besonderheit ?? null,
  stellplatz ? 1 : 0, vermietet ? 1 : 0,
  etage ?? null, pain_freitext ?? null,
  ref || email,
);
```

- [ ] **Step 4: PDF-Generierung nach DB-Update einfügen**

Nach dem `if (row)` Block der Joachim-Notification, aber VOR dem `return new Response(...)`:

```typescript
// Preisindikation berechnen + PDF generieren + an Eigentümer mailen
if (row) {
  const r = row as Record<string, unknown>;

  // Existing Joachim notification (already there — add pain_freitext to it)
  // ... existing notification code with pain_freitext added to the table ...

  // PDF generieren (await — Response erst danach)
  try {
    const piResult = calcPreisindikation({
      plz: String(r.plz ?? ''),
      immobilientyp: String(r.immobilientyp ?? 'etw') as any,
      wohnflaeche: Number(r.wohnflaeche) || undefined,
      baujahr: Number(r.baujahr) || undefined,
      energieklasse: r.energieklasse as string | null,
      zustand: r.zustand as string | null,
      sanierungsstand: r.sanierungsstand as string | null,
      vermietet: Boolean(r.vermietet),
    });

    const nameParts = String(r.name ?? '').split(' ');
    const vorname = nameParts[0] ?? '';
    const nachname = nameParts.slice(1).join(' ') || vorname;
    const datum = new Date().toLocaleDateString('de-DE');

    await generatePreisindikationPdf({
      vorname,
      nachname,
      email: String(r.email ?? ''),
      plz: String(r.plz ?? ''),
      immobilientyp: String(r.immobilientyp ?? 'etw'),
      wohnflaeche: r.wohnflaeche as number | null,
      baujahr: r.baujahr as number | null,
      energieklasse: r.energieklasse as string | null,
      zustand: r.zustand as string | null,
      sanierungsstand: r.sanierungsstand as string | null,
      vermietet: Boolean(r.vermietet),
      etage: r.etage as string | null,
      stellplatz: Boolean(r.stellplatz),
      result: piResult,
      datum,
    });
  } catch (err) {
    console.error('Preisindikation PDF error:', err);
    // Non-fatal: Eigentümer bekommt ggf. keine PDF-Mail, aber Response geht trotzdem raus
  }
}
```

Außerdem: `pain_freitext` zur Joachim-Notification-Mail hinzufügen:
```html
<tr><td style="padding:6px;font-weight:600">Situation / Problem</td><td style="padding:6px">${r.pain_freitext || '—'}</td></tr>
```

- [ ] **Step 5: Build-Check**

```bash
cd /Users/stefan/code/brown2green/website && npm run build 2>&1 | tail -10
```

Expected: Build erfolgreich, keine TypeScript-Fehler

- [ ] **Step 6: Commit**

```bash
git add src/pages/api/bewertung.ts
git commit -m "feat: bewertung PATCH — pain_freitext + Preisindikation PDF nach Step 2"
```

---

## Task 6: unterlagen.astro — Step 0 überspringen + Pain-Freitext

**Files:**
- Modify: `src/pages/unterlagen.astro`

- [ ] **Step 1: Step-0-Skip-Logik im JS-Teil einbauen**

In der Client-Script-Sektion von `unterlagen.astro` (im `<script>` Tag), am Anfang des Initialisierungs-Codes:

```javascript
// Step 0 überspringen wenn URL-Params vorhanden
const urlParams = new URLSearchParams(window.location.search);
const emailFromUrl = urlParams.get('email');
const plzFromUrl = urlParams.get('plz');
const refFromUrl = urlParams.get('ref');

if (emailFromUrl && (plzFromUrl || refFromUrl)) {
  // Step 0 überspringen
  document.getElementById('step-0')?.classList.add('hidden');
  // Werte in versteckte Felder schreiben damit das Formular sie kennt
  document.getElementById('hidden-email')?.setAttribute('value', emailFromUrl);
  document.getElementById('hidden-plz')?.setAttribute('value', plzFromUrl || '');
  document.getElementById('hidden-ref')?.setAttribute('value', refFromUrl || '');
  // Direkt zu Step 1 springen
  showStep(1);
}
```

- [ ] **Step 2: Versteckte Felder + Pain-Freitext-Feld hinzufügen**

Im HTML vor dem Step-1-Formular:
```html
<!-- Versteckte Felder für URL-Params -->
<input type="hidden" id="hidden-email" name="email" value="" />
<input type="hidden" id="hidden-plz" name="plz" value="" />
<input type="hidden" id="hidden-ref" name="ref" value="" />
```

Pain-Freitext als letztes Feld vor dem Submit-Button in Step 1 (oder dem letzten Schritt):
```html
<div class="form-group" style="margin-top:32px;">
  <label for="pain-freitext">Was ist aktuell das größte Problem für Sie? <span style="color:#64748b;font-weight:400;">(optional)</span></label>
  <textarea id="pain-freitext" name="pain_freitext" rows="4"
    placeholder="Je mehr Sie uns mitteilen, desto persönlicher kann Joachim auf Ihre Situation eingehen..."
    style="width:100%;resize:vertical;"></textarea>
</div>
```

- [ ] **Step 3: Copy fix — Step 0 Titel**

In Step 0 den Titel `"Kurz vorstellen — damit wir wissen, für wen die Unterlagen sind."` ersetzen durch:
```html
<h2 class="wiz-card__title">Für wen sollen wir die Auswertung erstellen?</h2>
```

Straße/Hausnummer/Ort-Felder aus Step 0 entfernen (nur Vorname, Nachname, Email, PLZ behalten).

- [ ] **Step 4: pain_freitext in PATCH-Request einschließen**

Im JavaScript-Code wo der PATCH-Request gebaut wird, `pain_freitext` aus dem Textarea lesen und mitschicken:

```javascript
pain_freitext: document.getElementById('pain-freitext')?.value || null,
```

- [ ] **Step 5: Build-Check**

```bash
cd /Users/stefan/code/brown2green/website && npm run build 2>&1 | tail -5
```

- [ ] **Step 6: Commit**

```bash
git add src/pages/unterlagen.astro
git commit -m "feat: unterlagen.astro — Step 0 Skip bei URL-Params + Pain-Freitext"
```

---

## Task 7: index.astro — Sales Copy Schritt 02 + 03

**Files:**
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Schritt 02 Copy updaten**

Den Text bei Schritt 02 "Erstbewertung in 48h" suchen und ersetzen. Vorher:
> Generische Beschreibung

Nachher — Neue Copy:
```html
<div class="schritt-text">
  <h3>Ihre Preisindikation — in 48 Stunden</h3>
  <p>Sie geben Ihre Immobilien-Details ein. Wir erstellen Ihnen eine persönliche Preisindikation — auf Basis derselben Marktdaten, die auch Gutachter nutzen. Mit konkreter Preisspanne, nicht nur einer Schätzung.</p>
</div>
```

- [ ] **Step 2: Schritt 03 Copy updaten**

Den Text bei Schritt 03 suchen und ersetzen. Vorher:
> Prozessbeschreibung

Nachher — Emotionaler Benefit:
```html
<div class="schritt-text">
  <h3>Joachim ruft Sie persönlich zurück</h3>
  <p>Sie wissen, was Ihre Immobilie wert ist. Jetzt entscheiden Sie in Ruhe — ohne Druck, ohne Verpflichtung. Joachim erklärt Ihnen den nächsten sinnvollen Schritt für Ihre Situation.</p>
</div>
```

- [ ] **Step 3: Build-Check**

```bash
cd /Users/stefan/code/brown2green/website && npm run build 2>&1 | tail -5
```

- [ ] **Step 4: Commit**

```bash
git add src/pages/index.astro
git commit -m "copy: index.astro Schritt 02+03 — Benefit-fokussiert, Preisindikation prominent"
```

---

## Task 8: End-to-End-Test + Deploy

- [ ] **Step 1: Alle Tests grün**

```bash
cd /Users/stefan/code/brown2green/website && npm test
```

Expected: Alle Tests PASS (inkl. preisindikation-calc + kapitalanleger-calc)

- [ ] **Step 2: Finaler Build**

```bash
cd /Users/stefan/code/brown2green/website && npm run build
```

Expected: Build erfolgreich ohne Fehler

- [ ] **Step 3: Manueller Smoke-Test (lokal)**

```bash
cd /Users/stefan/code/brown2green/website && npm run preview
```

Testen:
- `http://localhost:4321/#bewertung` → Formular ausfüllen → Submit → DB-Eintrag?
- `/unterlagen?email=test@test.de&plz=04229&ref=1` → Step 0 überspringen?
- Pain-Freitext ausfüllen → Submit → Joachim-Mail empfangen?

- [ ] **Step 4: Deploy**

```bash
cd /Users/stefan/code/brown2green/website && git push
curl -s "http://178.104.15.187:8000/api/v1/deploy?uuid=wisjftvt2q9b53z13nciq9dh" \
  -H "Authorization: Bearer $(cat ~/.claude/context/coolify-token.txt 2>/dev/null || echo 'TOKEN_HIER')"
```

- [ ] **Step 5: Live-Test**

- `https://wirkaufendeineimmobilie.de/#bewertung` aufrufen
- Vollständigen Flow durchlaufen
- PDF-Mail ankommen?

