# Kapitalanleger-Rechner Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a 5-step Buy & Hold calculator at `/kapitalanleger-rechner` that computes AfA (§7 EStG), net cashflow after tax (§21 EStG), Kaufpreisfaktor, and DCF NPV — with a free preview of 3 KPIs and email-gated full PDF report.

**Architecture:** 3 new files (`kapitalanleger-calc.ts`, `kapitalanleger-rechner.astro`, `kapitalanleger-report.ts`) + additions to `db.ts`, `investoren.astro`, `roi-rechner.astro`. All calculation logic is pure TypeScript — tested with vitest. UI follows the exact pattern of `roi-rechner.astro` (4-step quiz → email gate). The existing codebase is not modified except for nav additions and the db.ts extension.

**Tech Stack:** Astro (SSR via @astrojs/node), TypeScript, better-sqlite3, Puppeteer, Brevo transactional email, vitest (new dev dependency)

**Spec:** `docs/superpowers/specs/2026-03-22-kapitalanleger-rechner-design.md`

---

## File Map

| Action | File | Responsibility |
|--------|------|----------------|
| Create | `website/src/lib/kapitalanleger-calc.ts` | Types, all calculation functions, formatEur re-export |
| Create | `website/src/lib/kapitalanleger-pdf.ts` | PDF HTML template with Tilgungsplan table |
| Create | `website/src/pages/api/kapitalanleger-report.ts` | POST handler: validate → calc → PDF → email → DB |
| Create | `website/src/pages/kapitalanleger-rechner.astro` | 5-step wizard UI |
| Create | `website/src/tests/kapitalanleger-calc.test.ts` | Unit tests for all calc functions |
| Create | `website/vitest.config.ts` | vitest config |
| Modify | `website/package.json` | Add vitest devDependency + test script |
| Modify | `website/src/lib/db.ts` | Add `leads_kapitalanleger` table + `insertKapitalanlegerLead()` |
| Modify | `website/src/pages/investoren.astro` | Add nav link to Kapitalanleger-Rechner |
| Modify | `website/src/pages/roi-rechner.astro` | Add teaser link below email gate |

---

## Task 1: vitest setup

**Files:**
- Modify: `website/package.json`
- Create: `website/vitest.config.ts`
- Create: `website/src/tests/` (directory)

- [ ] **Step 1: Install vitest**

```bash
cd ~/code/wkdi-temp/website
npm install --save-dev vitest
```

- [ ] **Step 2: Add test script to package.json**

In `website/package.json`, add to `"scripts"`:
```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 3: Create vitest.config.ts**

Create `website/vitest.config.ts`:
```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/tests/**/*.test.ts'],
  },
});
```

- [ ] **Step 4: Verify vitest works**

```bash
cd ~/code/wkdi-temp/website
npx vitest run --reporter=verbose 2>&1 | head -10
```
Expected: "No test files found" or similar (no error crash)

- [ ] **Step 5: Commit**

```bash
cd ~/code/wkdi-temp
git add website/package.json website/package-lock.json website/vitest.config.ts
git commit -m "chore: add vitest for unit testing"
```

---

## Task 2: `kapitalanleger-calc.ts` (TDD)

**Files:**
- Create: `website/src/tests/kapitalanleger-calc.test.ts`
- Create: `website/src/lib/kapitalanleger-calc.ts`

### Step 2a — Write failing tests

- [ ] **Step 1: Create the test file**

Create `website/src/tests/kapitalanleger-calc.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { calcKapitalanleger, buildTilgungsplan } from '../lib/kapitalanleger-calc';

// Reference scenario:
// kaufpreis=200000, baujahr=1975, wohnflaeche=70, kaltmiete=800, hausgeld=200
// darlehen=160000, zinssatz=3.5, tilgung=2.0
// grenzsteuersatz=42, haltedauer=10, gebaeudeanteil=80
// diskontRate=5, mietsteigerung=2, leerstand=3
const BASE = {
  kaufpreis: 200000, baujahr: 1975, wohnflaeche: 70,
  kaltmiete: 800, hausgeld: 200,
  darlehen: 160000, zinssatz: 3.5, tilgung: 2.0,
  grenzsteuersatz: 42, haltedauer: 10, gebaeudeanteil: 80,
  diskontRate: 5, mietsteigerung: 2, leerstand: 3,
};

describe('AfA §7 EStG', () => {
  it('uses 2% for Baujahr 1975', () => {
    const r = calcKapitalanleger(BASE);
    // 200000 * 0.80 * 0.02 = 3200
    expect(r.jahresAfA).toBeCloseTo(3200, 0);
  });

  it('uses 2.5% for Baujahr 1920', () => {
    const r = calcKapitalanleger({ ...BASE, baujahr: 1920 });
    // 200000 * 0.80 * 0.025 = 4000
    expect(r.jahresAfA).toBeCloseTo(4000, 0);
  });

  it('uses 3% for Baujahr 2023', () => {
    const r = calcKapitalanleger({ ...BASE, baujahr: 2023 });
    // 200000 * 0.80 * 0.03 = 4800
    expect(r.jahresAfA).toBeCloseTo(4800, 0);
  });
});

describe('§21 EStG — Werbungskosten', () => {
  it('correctly floors negative zuVersteuern (steuerlicher Verlust → steuer=0)', () => {
    // bruttoMieteJahr = 800*12*(1-0.03) = 9312
    // zinsen = 160000*0.035 = 5600
    // nichtUmlagefaehig = 200*12*0.30 = 720
    // werbungskosten = 5600 + 720 + 3200 = 9520
    // zuVersteuern = 9312 - 9520 = -208 → einkommensteuer = 0
    const r = calcKapitalanleger(BASE);
    expect(r.einkommensteuer).toBe(0);
    expect(r.zuVersteuern).toBeCloseTo(-208, 0);
  });

  it('correctly applies Grenzsteuersatz when income is positive', () => {
    // Lower Zinssatz → positive zuVersteuern
    const r = calcKapitalanleger({ ...BASE, zinssatz: 1.0, darlehen: 50000 });
    // zinsen = 50000*0.01 = 500
    // werbungskosten = 500 + 720 + 3200 = 4420
    // bruttoMieteJahr = 9312
    // zuVersteuern = 9312 - 4420 = 4892
    // einkommensteuer = 4892 * 0.42 ≈ 2054.64
    expect(r.einkommensteuer).toBeGreaterThan(0);
    expect(r.zuVersteuern).toBeGreaterThan(0);
  });
});

describe('Netto-Cashflow nach Steuer', () => {
  it('computes nettoMonat correctly for base scenario', () => {
    // kapitaldienstJahr = 160000 * (0.035+0.02) = 8800
    // bruttoMieteJahr = 9312
    // nettoJahr = 9312 - 8800 - 200*12 - 0 = 9312 - 8800 - 2400 - 0 = 112
    // nettoMonat = 112/12 ≈ 9.33
    const r = calcKapitalanleger(BASE);
    expect(r.nettoMonat).toBeCloseTo(9.33, 1);
  });

  it('nettoMonat is negative when loan costs exceed income', () => {
    const r = calcKapitalanleger({ ...BASE, kaltmiete: 400 }); // low rent
    expect(r.nettoMonat).toBeLessThan(0);
  });
});

describe('Kaufpreisfaktor + Rendite', () => {
  it('computes Kaufpreisfaktor', () => {
    // 200000 / (800*12) = 200000/9600 ≈ 20.83
    const r = calcKapitalanleger(BASE);
    expect(r.kaufpreisfaktor).toBeCloseTo(20.83, 1);
  });

  it('computes bruttoRendite %', () => {
    // 9600/200000*100 = 4.8%
    const r = calcKapitalanleger(BASE);
    expect(r.bruttoRendite).toBeCloseTo(4.8, 1);
  });
});

describe('DCF NPV', () => {
  it('npv10j and npv20j are both positive for a viable property', () => {
    const r = calcKapitalanleger(BASE);
    // Terminal value dominates — should be positive
    expect(r.npv10j).toBeGreaterThan(0);
    expect(r.npv20j).toBeGreaterThan(r.npv10j); // longer hold = more NPV
  });

  it('npv uses haltedauer param for primary output', () => {
    const r10 = calcKapitalanleger({ ...BASE, haltedauer: 10 });
    const r20 = calcKapitalanleger({ ...BASE, haltedauer: 20 });
    // Both always return npv10j and npv20j regardless of haltedauer
    expect(r10.npv10j).toBeCloseTo(r20.npv10j, 0);
  });
});

describe('Tilgungsplan', () => {
  it('returns haltedauer rows', () => {
    const plan = buildTilgungsplan(BASE);
    expect(plan.length).toBe(BASE.haltedauer);
  });

  it('restschuld decreases each year', () => {
    const plan = buildTilgungsplan(BASE);
    expect(plan[1].restschuld).toBeLessThan(plan[0].restschuld);
  });

  it('zinsenT decreases as restschuld decreases', () => {
    const plan = buildTilgungsplan(BASE);
    expect(plan[1].zinsen).toBeLessThan(plan[0].zinsen);
  });
});
```

- [ ] **Step 2: Run tests — verify all fail**

```bash
cd ~/code/wkdi-temp/website
npx vitest run src/tests/kapitalanleger-calc.test.ts 2>&1
```
Expected: All tests FAIL with "Cannot find module '../lib/kapitalanleger-calc'"

### Step 2b — Implement the calc library

- [ ] **Step 3: Create `website/src/lib/kapitalanleger-calc.ts`**

```typescript
// src/lib/kapitalanleger-calc.ts

export interface KapitalanlegerInput {
  kaufpreis: number;
  baujahr: number;
  wohnflaeche: number;
  kaltmiete: number;         // €/Monat
  hausgeld: number;          // €/Monat
  darlehen: number;          // €
  zinssatz: number;          // % p.a.
  tilgung: number;           // % p.a.
  grenzsteuersatz: number;   // % (0–45)
  haltedauer: number;        // Jahre
  gebaeudeanteil: number;    // % (default 80)
  diskontRate: number;       // % (default 5)
  mietsteigerung: number;    // % p.a. (default 2)
  leerstand: number;         // % (default 3)
}

export interface KapitalanlegerResult {
  // AfA
  jahresAfA: number;
  afaRate: number;           // 0.02 / 0.025 / 0.03

  // §21 EStG
  zinsen: number;            // Jahreszinsen (fixed, non-amortizing)
  nichtUmlagefaehig: number; // 30% of Hausgeld p.a.
  werbungskosten: number;
  bruttoMieteJahr: number;   // after Leerstand deduction
  zuVersteuern: number;      // can be negative (steuerlicher Verlust)
  einkommensteuer: number;   // floors at 0

  // Cashflow
  kapitaldienstJahr: number;
  nettoJahr: number;
  nettoMonat: number;

  // KPIs
  kaufpreisfaktor: number;
  bruttoRendite: number;     // %

  // DCF — always computed for both 10J and 20J
  npv10j: number;
  npv20j: number;
}

export interface TilgungsplanRow {
  jahr: number;
  restschuld: number;
  zinsen: number;
  tilgung: number;
  cashflow: number;  // netto cashflow for that year (amortizing model)
}

// AfA §7 Abs. 4 EStG
// Note: baujahr = Fertigstellungsjahr (year of first completion)
function afaRate(baujahr: number): number {
  if (baujahr <= 1924) return 0.025;
  if (baujahr >= 2023) return 0.03;
  return 0.02;
}

// DCF helper — grows Miete only, keeps Kapitaldienst + Hausgeld fixed (simplified)
// Disclaimer: NPV uses fixed Zinsen (non-amortizing); Tilgungsplan uses amortizing.
function computeNpv(
  bruttoMieteJahr: number,
  werbungskosten: number,
  kapitaldienstJahr: number,
  hausgeldJahr: number,
  grenzsteuersatz: number,
  kaufpreisfaktor: number,
  kaltmiete: number,
  haltedauer: number,
  diskontRate: number,
  mietsteigerung: number,
): number {
  let npv = 0;
  for (let t = 1; t <= haltedauer; t++) {
    const mieteT = bruttoMieteJahr * Math.pow(1 + mietsteigerung / 100, t - 1);
    const zuVersteuernT = mieteT - werbungskosten;
    const steuernT = Math.max(0, zuVersteuernT) * (grenzsteuersatz / 100);
    const cfT = mieteT - kapitaldienstJahr - hausgeldJahr - steuernT;
    npv += cfT / Math.pow(1 + diskontRate / 100, t);
  }
  // Terminal Value: exit at same Kaufpreisfaktor on grown annual rent
  const exitMiete = kaltmiete * 12 * Math.pow(1 + mietsteigerung / 100, haltedauer);
  const tv = exitMiete * kaufpreisfaktor;
  npv += tv / Math.pow(1 + diskontRate / 100, haltedauer);
  return Math.round(npv);
}

export function calcKapitalanleger(input: KapitalanlegerInput): KapitalanlegerResult {
  const {
    kaufpreis, baujahr, kaltmiete, hausgeld,
    darlehen, zinssatz, tilgung,
    grenzsteuersatz, gebaeudeanteil,
    diskontRate, mietsteigerung, leerstand,
  } = input;

  // AfA
  const rate = afaRate(baujahr);
  const jahresAfA = kaufpreis * (gebaeudeanteil / 100) * rate;

  // §21 EStG — Werbungskosten
  // NOTE: 30% pauschal = non-allocatable Hausgeld for TAX only
  // Full Hausgeld is real cash out (see cashflow below)
  const zinsen = darlehen * (zinssatz / 100);
  const nichtUmlagefaehig = hausgeld * 12 * 0.30;
  const werbungskosten = zinsen + nichtUmlagefaehig + jahresAfA;

  const bruttoMieteJahr = kaltmiete * 12 * (1 - leerstand / 100);
  const zuVersteuern = bruttoMieteJahr - werbungskosten;
  const einkommensteuer = Math.max(0, zuVersteuern) * (grenzsteuersatz / 100);

  // Cashflow
  // kapitaldienstJahr = full cash out for loan (Zinsen + Tilgung)
  const kapitaldienstJahr = darlehen * ((zinssatz + tilgung) / 100);
  // hausgeld * 12 = full cash out (different from the 30% used in §21 above)
  const nettoJahr = bruttoMieteJahr - kapitaldienstJahr - hausgeld * 12 - einkommensteuer;
  const nettoMonat = nettoJahr / 12;

  // KPIs
  const kaufpreisfaktor = kaufpreis / (kaltmiete * 12);
  const bruttoRendite = (kaltmiete * 12) / kaufpreis * 100;

  // DCF — always compute for 10J and 20J regardless of user's haltedauer
  const hausgeldJahr = hausgeld * 12;
  const npv10j = computeNpv(
    bruttoMieteJahr, werbungskosten, kapitaldienstJahr, hausgeldJahr,
    grenzsteuersatz, kaufpreisfaktor, kaltmiete, 10, diskontRate, mietsteigerung,
  );
  const npv20j = computeNpv(
    bruttoMieteJahr, werbungskosten, kapitaldienstJahr, hausgeldJahr,
    grenzsteuersatz, kaufpreisfaktor, kaltmiete, 20, diskontRate, mietsteigerung,
  );

  return {
    jahresAfA, afaRate: rate,
    zinsen, nichtUmlagefaehig, werbungskosten,
    bruttoMieteJahr, zuVersteuern, einkommensteuer,
    kapitaldienstJahr, nettoJahr, nettoMonat,
    kaufpreisfaktor, bruttoRendite,
    npv10j, npv20j,
  };
}

// Tilgungsplan — amortizing model (Zinsen decline as Restschuld decreases)
// Note: intentionally different from NPV which uses fixed Zinsen (simplified)
export function buildTilgungsplan(input: KapitalanlegerInput): TilgungsplanRow[] {
  const { darlehen, zinssatz, tilgung, kaltmiete, hausgeld,
          grenzsteuersatz, haltedauer, mietsteigerung, leerstand,
          gebaeudeanteil, baujahr, kaufpreis } = input;

  const jahresAfA = kaufpreis * (gebaeudeanteil / 100) * afaRate(baujahr);
  const nichtUmlagefaehig = hausgeld * 12 * 0.30;
  const tilgungJahr = darlehen * (tilgung / 100);
  const hausgeldJahr = hausgeld * 12;

  let restschuld = darlehen;
  const rows: TilgungsplanRow[] = [];

  for (let t = 1; t <= haltedauer; t++) {
    const zinsenT = restschuld * (zinssatz / 100);
    restschuld -= tilgungJahr;

    const mieteT = kaltmiete * 12 * (1 - leerstand / 100) * Math.pow(1 + mietsteigerung / 100, t - 1);
    const werbungskostenT = zinsenT + nichtUmlagefaehig + jahresAfA;
    const zuVersteuernT = mieteT - werbungskostenT;
    const steuernT = Math.max(0, zuVersteuernT) * (grenzsteuersatz / 100);
    const cashflow = mieteT - zinsenT - tilgungJahr - hausgeldJahr - steuernT;

    rows.push({
      jahr: t,
      restschuld: Math.round(Math.max(0, restschuld)),
      zinsen: Math.round(zinsenT),
      tilgung: Math.round(tilgungJahr),
      cashflow: Math.round(cashflow),
    });
  }

  return rows;
}

export function formatEur(n: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(n);
}
```

- [ ] **Step 4: Run tests — verify they pass**

```bash
cd ~/code/wkdi-temp/website
npx vitest run src/tests/kapitalanleger-calc.test.ts --reporter=verbose 2>&1
```
Expected: All tests PASS (green)

- [ ] **Step 5: Commit**

```bash
cd ~/code/wkdi-temp
git add website/src/lib/kapitalanleger-calc.ts website/src/tests/kapitalanleger-calc.test.ts
git commit -m "feat: kapitalanleger-calc.ts — AfA, §21 EStG, DCF, Tilgungsplan"
```

---

## Task 3: DB extension

**Files:**
- Modify: `website/src/lib/db.ts`

- [ ] **Step 1: Add leads_kapitalanleger table and insertKapitalanlegerLead() to db.ts**

In `website/src/lib/db.ts`, after the existing `db.exec(...)` block (around line 39), add:

```typescript
// Kapitalanleger leads — dedicated table for richer domain-specific data capture
db.exec(`
  CREATE TABLE IF NOT EXISTS leads_kapitalanleger (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ref_nr TEXT NOT NULL,
    vorname TEXT NOT NULL,
    email TEXT NOT NULL,
    kaufpreis INTEGER,
    baujahr INTEGER,
    wohnflaeche REAL,
    kaltmiete INTEGER,
    hausgeld INTEGER,
    darlehen INTEGER,
    zinssatz REAL,
    tilgung REAL,
    grenzsteuersatz REAL,
    haltedauer INTEGER,
    gebaeudeanteil REAL,
    netto_cashflow_monat REAL,
    kaufpreisfaktor REAL,
    afa_jahr REAL,
    npv_10j REAL,
    npv_20j REAL,
    brutto_rendite REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);
```

Then add the insert function after `insertRegistration()` (around line 59):

```typescript
export function insertKapitalanlegerLead(data: Record<string, unknown>) {
  const columns = Object.keys(data);
  const placeholders = columns.map(() => '?').join(', ');
  const values = columns.map(k => data[k] ?? null);
  const stmt = db.prepare(
    `INSERT INTO leads_kapitalanleger (${columns.join(', ')}) VALUES (${placeholders})`
  );
  return stmt.run(...values);
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd ~/code/wkdi-temp/website
npx astro build 2>&1 | tail -5
```
Expected: build completes without TypeScript errors

- [ ] **Step 3: Commit**

```bash
cd ~/code/wkdi-temp
git add website/src/lib/db.ts
git commit -m "feat: add leads_kapitalanleger table + insertKapitalanlegerLead()"
```

---

## Task 4: PDF template

**Files:**
- Create: `website/src/lib/kapitalanleger-pdf.ts`

- [ ] **Step 1: Create `website/src/lib/kapitalanleger-pdf.ts`**

```typescript
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
}): string {
  const { input, result, tilgungsplan, vorname, refNr, datum } = opts;
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
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd ~/code/wkdi-temp/website
npx astro build 2>&1 | tail -5
```
Expected: build succeeds

- [ ] **Step 3: Commit**

```bash
cd ~/code/wkdi-temp
git add website/src/lib/kapitalanleger-pdf.ts
git commit -m "feat: kapitalanleger PDF template with Tilgungsplan"
```

---

## Task 5: API endpoint

**Files:**
- Create: `website/src/pages/api/kapitalanleger-report.ts`

- [ ] **Step 1: Create `website/src/pages/api/kapitalanleger-report.ts`**

```typescript
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
```

- [ ] **Step 2: Verify build**

```bash
cd ~/code/wkdi-temp/website
npx astro build 2>&1 | tail -5
```
Expected: build succeeds

- [ ] **Step 3: Commit**

```bash
cd ~/code/wkdi-temp
git add website/src/pages/api/kapitalanleger-report.ts
git commit -m "feat: kapitalanleger-report.ts API — validate, calc, PDF, email, DB"
```

---

## Task 6: 5-step wizard UI

**Files:**
- Create: `website/src/pages/kapitalanleger-rechner.astro`

This page follows the exact CSS variable and class naming of `roi-rechner.astro`. Read that file first to understand the pattern — the quiz-step, quiz-progress, result-blur-overlay, and email-gate-form patterns are identical.

- [ ] **Step 1: Create `website/src/pages/kapitalanleger-rechner.astro`**

The file has 4 sections: frontmatter, HTML structure, CSS styles, and `<script>`. Build each section:

**Frontmatter:**
```astro
---
import Layout from '../layouts/Layout.astro';
---
```

**Hero + Progress bar + Step wrapper** — copy the structure from `roi-rechner.astro` (lines 9–46) but update:
- Hero `<h1>`: `Was bringt dein Mietobjekt wirklich?`
- Hero subtitle: `Berechne Cashflow nach Steuer, AfA-Vorteil und DCF-Rendite — in 5 Schritten.`
- 5 progress dots: `Objekt | Finanzierung | Steuer | Vorschau | Analyse`

**Step 1 — Objekt** (5 inputs with number inputs, not scenario cards):
```html
<div class="quiz-step" id="step-1">
  <div class="quiz-step__header">
    <h2>Objekt-Daten</h2>
    <p class="quiz-step__hint">Grundlage für AfA-Berechnung und Cashflow.</p>
  </div>
  <div class="input-grid">
    <div class="input-group">
      <label class="field-label" for="kaufpreis">Kaufpreis</label>
      <div class="input-prefix-wrap">
        <span class="input-prefix">€</span>
        <input type="number" id="kaufpreis" name="kaufpreis" min="50000" max="5000000" step="1000" placeholder="250000" required />
      </div>
    </div>
    <div class="input-group">
      <label class="field-label" for="baujahr">Baujahr der Fertigstellung
        <span class="field-hint">Bestimmt den AfA-Satz §7 EStG (≤1924: 2,5% · 1925–2022: 2% · ≥2023: 3%)</span>
      </label>
      <input type="number" id="baujahr" name="baujahr" min="1800" max="2025" step="1" placeholder="1975" required />
    </div>
    <div class="input-group">
      <label class="field-label" for="wohnflaeche">Wohnfläche</label>
      <div class="input-prefix-wrap">
        <span class="input-prefix">m²</span>
        <input type="number" id="wohnflaeche" name="wohnflaeche" min="20" max="500" step="1" placeholder="70" required />
      </div>
    </div>
    <div class="input-group">
      <label class="field-label" for="kaltmiete">Kaltmiete/Monat</label>
      <div class="input-prefix-wrap">
        <span class="input-prefix">€</span>
        <input type="number" id="kaltmiete" name="kaltmiete" min="100" max="10000" step="10" placeholder="800" required />
      </div>
    </div>
    <div class="input-group">
      <label class="field-label" for="hausgeld">Hausgeld/Monat</label>
      <div class="input-prefix-wrap">
        <span class="input-prefix">€</span>
        <input type="number" id="hausgeld" name="hausgeld" min="0" max="2000" step="10" placeholder="200" required />
      </div>
    </div>
  </div>
  <button class="btn btn-primary quiz-next-btn" data-next="2">Weiter →</button>
</div>
```

**Step 2 — Finanzierung** (3 inputs + LTV warning):
```html
<div class="quiz-step" id="step-2" hidden>
  <div class="quiz-step__header">
    <h2>Finanzierung</h2>
    <p class="quiz-step__hint">Darlehen und Konditionen für die Cashflow-Berechnung.</p>
  </div>
  <div class="input-grid">
    <div class="input-group">
      <label class="field-label" for="darlehen">Darlehensbetrag</label>
      <div class="input-prefix-wrap">
        <span class="input-prefix">€</span>
        <input type="number" id="darlehen" name="darlehen" min="0" max="5000000" step="1000" placeholder="200000" required />
      </div>
      <p class="field-warning" id="ltv-warning" hidden>⚠️ Darlehen über Kaufpreis — bitte prüfen</p>
    </div>
    <div class="input-group">
      <label class="field-label" for="zinssatz">Zinssatz p.a.</label>
      <div class="input-prefix-wrap">
        <span class="input-prefix">%</span>
        <input type="number" id="zinssatz" name="zinssatz" min="0" max="15" step="0.1" placeholder="3.5" required />
      </div>
    </div>
    <div class="input-group">
      <label class="field-label" for="tilgung">Tilgung p.a.</label>
      <div class="input-prefix-wrap">
        <span class="input-prefix">%</span>
        <input type="number" id="tilgung" name="tilgung" min="0" max="10" step="0.1" placeholder="2.0" required />
      </div>
    </div>
  </div>
  <div class="step-nav">
    <button class="btn btn-ghost quiz-back-btn" data-back="1">← Zurück</button>
    <button class="btn btn-primary quiz-next-btn" data-next="3">Weiter →</button>
  </div>
</div>
```

**Step 3 — Steuer & Parameter** (with collapsible advanced section):
```html
<div class="quiz-step" id="step-3" hidden>
  <div class="quiz-step__header">
    <h2>Steuer &amp; Parameter</h2>
  </div>
  <div class="input-grid">
    <div class="input-group">
      <label class="field-label" for="grenzsteuersatz">Grenzsteuersatz
        <span class="field-hint">Dein persönlicher Steuersatz (0–45%). Kein Standardwert — bitte selbst eintragen.</span>
      </label>
      <div class="input-prefix-wrap">
        <span class="input-prefix">%</span>
        <input type="number" id="grenzsteuersatz" name="grenzsteuersatz" min="0" max="45" step="1" placeholder="42" required />
      </div>
    </div>
    <div class="input-group">
      <label class="field-label" for="haltedauer">Geplante Haltedauer</label>
      <div class="input-prefix-wrap">
        <span class="input-prefix">J</span>
        <input type="number" id="haltedauer" name="haltedauer" min="1" max="30" step="1" value="10" required />
      </div>
    </div>
    <div class="input-group">
      <label class="field-label" for="gebaeudeanteil">Gebäudeanteil
        <span class="field-hint">Anteil Gebäude am Kaufpreis für AfA. Standard: 80% — mit Steuerberater abstimmen (BFH IX R 12/21).</span>
      </label>
      <div class="input-prefix-wrap">
        <span class="input-prefix">%</span>
        <input type="number" id="gebaeudeanteil" name="gebaeudeanteil" min="50" max="95" step="1" value="80" required />
      </div>
    </div>
  </div>

  <details class="advanced-params">
    <summary>Erweiterte Parameter (DCF-Defaults)</summary>
    <div class="input-grid" style="margin-top:12px;">
      <div class="input-group">
        <label class="field-label" for="diskontRate">Diskontrate</label>
        <div class="input-prefix-wrap">
          <span class="input-prefix">%</span>
          <input type="number" id="diskontRate" name="diskontRate" min="1" max="15" step="0.5" value="5" />
        </div>
      </div>
      <div class="input-group">
        <label class="field-label" for="mietsteigerung">Mietsteigerung p.a.</label>
        <div class="input-prefix-wrap">
          <span class="input-prefix">%</span>
          <input type="number" id="mietsteigerung" name="mietsteigerung" min="0" max="10" step="0.5" value="2" />
        </div>
      </div>
      <div class="input-group">
        <label class="field-label" for="leerstand">Leerstandsrisiko</label>
        <div class="input-prefix-wrap">
          <span class="input-prefix">%</span>
          <input type="number" id="leerstand" name="leerstand" min="0" max="20" step="0.5" value="3" />
        </div>
      </div>
    </div>
  </details>

  <div class="step-nav">
    <button class="btn btn-ghost quiz-back-btn" data-back="2">← Zurück</button>
    <button class="btn btn-primary" id="calc-btn">Berechnen →</button>
  </div>
</div>
```

**Step 4 — Vorschau** (3 KPIs open, 3 blurred):
```html
<div class="quiz-step" id="step-4" hidden>
  <div class="quiz-step__header">
    <h2>Deine Analyse</h2>
  </div>

  <!-- 3 OPEN KPIs -->
  <div class="result-open-grid">
    <div class="result-kpi-card">
      <div class="result-kpi-card__label">Kaufpreisfaktor</div>
      <div class="result-kpi-card__value" id="res-faktor">—</div>
      <div class="result-kpi-card__formula" id="res-faktor-formula"></div>
      <div class="result-kpi-card__comment" id="res-faktor-comment"></div>
    </div>
    <div class="result-kpi-card">
      <div class="result-kpi-card__label">Cashflow/Monat netto</div>
      <div class="result-kpi-card__value" id="res-cashflow">—</div>
      <div class="result-kpi-card__formula" id="res-cashflow-formula"></div>
      <div class="result-kpi-card__comment" id="res-cashflow-comment"></div>
    </div>
    <div class="result-kpi-card">
      <div class="result-kpi-card__label">AfA Steuerersparnis/Jahr</div>
      <div class="result-kpi-card__value" id="res-afa">—</div>
      <div class="result-kpi-card__formula" id="res-afa-formula"></div>
      <div class="result-kpi-card__comment" id="res-afa-comment"></div>
    </div>
  </div>

  <!-- 3 GATED KPIs (blurred) -->
  <div class="result-gated-grid">
    <div class="result-kpi-card result-kpi-card--gated">
      <div class="result-kpi-card__label">NPV 10 Jahre</div>
      <div class="result-kpi-card__value">██████</div>
      <div class="result-kpi-card__formula">DCF · Diskontrate · Mietsteigerung</div>
    </div>
    <div class="result-kpi-card result-kpi-card--gated">
      <div class="result-kpi-card__label">NPV 20 Jahre</div>
      <div class="result-kpi-card__value">██████</div>
      <div class="result-kpi-card__formula">Exit-Faktor · Terminal Value</div>
    </div>
    <div class="result-kpi-card result-kpi-card--gated">
      <div class="result-kpi-card__label">Brutto-Rendite</div>
      <div class="result-kpi-card__value">██%</div>
      <div class="result-kpi-card__formula">Jahreskaltmiete ÷ Kaufpreis</div>
    </div>
  </div>

  <div class="gate-cta">
    <p class="gate-cta__text">NPV, Rendite und vollständiger Tilgungsplan warten auf dich.</p>
    <button class="btn btn-primary" id="show-gate-btn">Vollanalyse freischalten →</button>
  </div>

  <div class="step-nav" style="margin-top:16px;">
    <button class="btn btn-ghost quiz-back-btn" data-back="3">← Zahlen ändern</button>
  </div>
</div>
```

**Step 5 — Email Gate** (copy pattern from `roi-rechner.astro` lines 330–361):
```html
<div class="quiz-step" id="step-5" hidden>
  <div class="quiz-step__header">
    <h2>Vollanalyse freischalten</h2>
    <p class="quiz-step__hint">Kostenlos — wir schicken das PDF sofort per E-Mail.</p>
  </div>
  <form class="email-gate-form" id="email-gate-form" novalidate>
    <div class="field-group">
      <label class="field-label" for="gate-vorname">Vorname</label>
      <input type="text" id="gate-vorname" name="vorname" placeholder="Max" required autocomplete="given-name" />
    </div>
    <div class="field-group">
      <label class="field-label" for="gate-email">E-Mail</label>
      <input type="email" id="gate-email" name="email" placeholder="max@beispiel.de" required autocomplete="email" />
    </div>
    <button type="submit" class="btn btn-primary email-gate-btn" id="email-gate-btn">
      PDF jetzt per E-Mail erhalten
    </button>
    <p class="email-gate-disclaimer">Kostenlos · Keine Weitergabe · Sofort per E-Mail</p>
    <p class="email-gate-error" id="email-gate-error" hidden></p>
  </form>
  <div class="step-nav" style="margin-top:12px;">
    <button class="btn btn-ghost quiz-back-btn" data-back="4">← Zurück</button>
  </div>
</div>
```

**CSS** — copy all `quiz-*`, `email-gate-*`, `btn`, `field-*`, `step-nav` styles from `roi-rechner.astro`. Add new classes:

```css
.input-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
.input-group { display: flex; flex-direction: column; gap: 4px; }
.input-prefix-wrap { position: relative; }
.input-prefix { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--color-text-muted); font-size: 14px; pointer-events: none; }
.input-prefix-wrap input { padding-left: 32px; }
.field-hint { display: block; font-size: 11px; color: var(--color-text-muted); font-weight: 400; margin-top: 2px; }
.field-warning { font-size: 11px; color: #b91c1c; margin-top: 4px; }
.advanced-params { margin-top: 16px; }
.advanced-params summary { cursor: pointer; font-size: 13px; color: var(--color-text-muted); padding: 8px 0; }

.result-open-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 16px; }
.result-gated-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 24px; }
.result-kpi-card { background: var(--color-surface-2); border: 1px solid var(--color-border); border-radius: 8px; padding: 16px; }
.result-kpi-card__label { font-size: 11px; text-transform: uppercase; letter-spacing: .5px; color: var(--color-text-muted); margin-bottom: 6px; }
.result-kpi-card__value { font-size: 22px; font-weight: 700; color: var(--color-accent); margin-bottom: 4px; }
.result-kpi-card__formula { font-size: 11px; color: var(--color-text-muted); }
.result-kpi-card__comment { font-size: 11px; color: var(--color-text-muted); margin-top: 2px; }
.result-kpi-card--gated { filter: blur(5px); user-select: none; pointer-events: none; opacity: .6; }
.result-kpi-card--gated .result-kpi-card__value { color: var(--color-text-muted); }

.gate-cta { background: var(--color-surface-2); border: 1px solid var(--color-border); border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 12px; }
.gate-cta__text { color: var(--color-text-muted); margin-bottom: 12px; font-size: 14px; }

@media (max-width: 640px) {
  .input-grid { grid-template-columns: 1fr; }
  .result-open-grid, .result-gated-grid { grid-template-columns: 1fr; }
}
```

**`<script>`** — key JavaScript logic:

```javascript
// State
let formData = {};

// Step navigation
function showStep(n) {
  document.querySelectorAll('.quiz-step').forEach(el => el.hidden = true);
  document.getElementById(`step-${n}`).hidden = false;
  document.querySelectorAll('.quiz-step-dot').forEach(dot => {
    const s = Number(dot.dataset.step);
    dot.classList.toggle('is-active', s === n);
    dot.classList.toggle('is-done', s < n);
  });
  window.scrollTo({ top: document.getElementById('quiz-progress').offsetTop - 20, behavior: 'smooth' });
}

// Next/Back buttons
document.querySelectorAll('.quiz-next-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const next = Number(btn.dataset.next);
    // Collect inputs from current step
    const stepEl = btn.closest('.quiz-step');
    stepEl.querySelectorAll('input[name]').forEach(inp => {
      if (inp.value !== '') formData[inp.name] = inp.value;
    });
    showStep(next);
  });
});

document.querySelectorAll('.quiz-back-btn').forEach(btn => {
  btn.addEventListener('click', () => showStep(Number(btn.dataset.back)));
});

// LTV warning on darlehen input
const darlehenInput = document.getElementById('darlehen');
const ltvWarning = document.getElementById('ltv-warning');
darlehenInput?.addEventListener('input', () => {
  const kp = Number(formData.kaufpreis || 0);
  const dl = Number(darlehenInput.value || 0);
  ltvWarning.hidden = !(kp > 0 && dl > kp);
});

// Calc button → compute preview → show step 4
const fmt = (n) => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);

document.getElementById('calc-btn')?.addEventListener('click', () => {
  // Collect step 3 inputs
  const stepEl = document.getElementById('step-3');
  stepEl.querySelectorAll('input[name]').forEach(inp => {
    if (inp.value !== '') formData[inp.name] = inp.value;
  });

  const kp = Number(formData.kaufpreis);
  const bj = Number(formData.baujahr);
  const km = Number(formData.kaltmiete);
  const hg = Number(formData.hausgeld);
  const dl = Number(formData.darlehen);
  const zs = Number(formData.zinssatz);
  const tl = Number(formData.tilgung);
  const gst = Number(formData.grenzsteuersatz);
  const ga = Number(formData.gebaeudeanteil || 80);
  const ls = Number(formData.leerstand || 3);

  // AfA rate
  const afaRate = bj <= 1924 ? 0.025 : bj >= 2023 ? 0.03 : 0.02;
  const jahresAfA = kp * (ga / 100) * afaRate;

  // §21 EStG
  const zinsen = dl * (zs / 100);
  const nichtUmlagefaehig = hg * 12 * 0.30;
  const werbungskosten = zinsen + nichtUmlagefaehig + jahresAfA;
  const bruttoMieteJahr = km * 12 * (1 - ls / 100);
  const zuVersteuern = bruttoMieteJahr - werbungskosten;
  const einkommensteuer = Math.max(0, zuVersteuern) * (gst / 100);

  // Cashflow
  const kapitaldienstJahr = dl * ((zs + tl) / 100);
  const nettoJahr = bruttoMieteJahr - kapitaldienstJahr - hg * 12 - einkommensteuer;
  const nettoMonat = nettoJahr / 12;

  // Kaufpreisfaktor
  const faktor = kp / (km * 12);
  const bruttoRendite = (km * 12) / kp * 100;

  // Fill preview
  document.getElementById('res-faktor').textContent = faktor.toFixed(1) + '×';
  document.getElementById('res-faktor-formula').textContent = `${fmt(kp)} ÷ (${fmt(km)} × 12)`;
  document.getElementById('res-faktor-comment').textContent =
    faktor < 20 ? 'Günstiger Einstieg (Leipzig: 20–28×)' :
    faktor <= 28 ? 'Solides Leipzig-Niveau (20–28×)' : 'Hohes Preisniveau — Rendite prüfen';

  const cashflowColor = nettoMonat >= 0 ? 'var(--color-success, #1a7a4a)' : '#b91c1c';
  const cashflowEl = document.getElementById('res-cashflow');
  cashflowEl.textContent = fmt(nettoMonat) + '/Mo';
  cashflowEl.style.color = cashflowColor;
  document.getElementById('res-cashflow-formula').textContent = 'nach Zinsen, Tilgung, Hausgeld, Steuer';
  document.getElementById('res-cashflow-comment').textContent =
    nettoMonat >= 0 ? 'Positiver Cashflow ab Tag 1' : 'Negativer Cashflow — Wertsteigerung kalkulieren';

  document.getElementById('res-afa').textContent = fmt(jahresAfA) + '/J';
  document.getElementById('res-afa-formula').textContent =
    `${fmt(kp)} × ${ga}% × ${(afaRate * 100).toFixed(1)}%`;
  document.getElementById('res-afa-comment').textContent = `§7 EStG · Baujahr ${bj}`;

  showStep(4);
});

// Show gate on CTA click
document.getElementById('show-gate-btn')?.addEventListener('click', () => showStep(5));

// Email gate submit
const emailForm = document.getElementById('email-gate-form');
const emailBtn = document.getElementById('email-gate-btn');
const emailError = document.getElementById('email-gate-error');

emailForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  emailError.hidden = true;
  emailBtn.classList.add('is-loading');
  emailBtn.disabled = true;

  const vorname = document.getElementById('gate-vorname').value.trim();
  const email = document.getElementById('gate-email').value.trim();

  try {
    const res = await fetch('/api/kapitalanleger-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...formData, vorname, email }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Fehler beim Verarbeiten');

    // Show success state
    emailForm.innerHTML = `
      <div class="email-gate-success">
        <p>✓ Analyse wird gerade erstellt und an <strong>${email}</strong> geschickt.</p>
        <p style="color:var(--color-text-muted);font-size:13px;margin-top:8px;">Bitte kurz warten — dauert ca. 30 Sekunden.</p>
      </div>`;
  } catch (err) {
    emailError.textContent = err.message || 'Etwas ist schiefgelaufen. Bitte erneut versuchen.';
    emailError.hidden = false;
    emailBtn.classList.remove('is-loading');
    emailBtn.disabled = false;
  }
});
```

- [ ] **Step 2: Verify build succeeds**

```bash
cd ~/code/wkdi-temp/website
npx astro build 2>&1 | tail -10
```
Expected: build completes without errors

- [ ] **Step 3: Visual check with Playwright screenshot**

```bash
cd ~/code/wkdi-temp/website && npm run dev &
sleep 5
npx playwright screenshot --viewport-size="1440,900" http://localhost:4321/kapitalanleger-rechner /tmp/ka-rechner-step1.png 2>/dev/null || \
  npx playwright screenshot http://localhost:4321/kapitalanleger-rechner /tmp/ka-rechner-step1.png
```
Check: 5 step dots visible, Step 1 form with 5 inputs, no build errors

- [ ] **Step 4: Commit**

```bash
cd ~/code/wkdi-temp
git add website/src/pages/kapitalanleger-rechner.astro
git commit -m "feat: kapitalanleger-rechner.astro — 5-step wizard UI"
```

---

## Task 7: Nav additions

**Files:**
- Modify: `website/src/pages/investoren.astro`
- Modify: `website/src/pages/roi-rechner.astro`

- [ ] **Step 1: Add link in investoren.astro**

Search for the investor tools section in `investoren.astro` (grep for "roi-rechner" or "Rechner"). Add below the existing ROI-Rechner link:

```html
<a href="/kapitalanleger-rechner" class="tool-link">
  Kapitalanleger-Rechner →
  <span class="tool-link__sub">AfA · Cashflow nach Steuer · DCF NPV</span>
</a>
```

- [ ] **Step 2: Add teaser in roi-rechner.astro**

In `roi-rechner.astro`, find the email gate confirmation area (after the `email-gate-success` state or below the `email-gate-card`). Add:

```html
<div class="rechner-cross-link">
  <p>Langfrist-Investor? <a href="/kapitalanleger-rechner">→ Kapitalanleger-Rechner mit AfA &amp; DCF-Rendite</a></p>
</div>
```

Add CSS in the `<style>` block:
```css
.rechner-cross-link { margin-top: 24px; text-align: center; font-size: 13px; color: var(--color-text-muted); }
.rechner-cross-link a { color: var(--color-accent); text-decoration: none; }
.rechner-cross-link a:hover { text-decoration: underline; }
```

- [ ] **Step 3: Build + verify**

```bash
cd ~/code/wkdi-temp/website
npx astro build 2>&1 | tail -5
```

- [ ] **Step 4: Commit**

```bash
cd ~/code/wkdi-temp
git add website/src/pages/investoren.astro website/src/pages/roi-rechner.astro
git commit -m "feat: nav links — Kapitalanleger-Rechner cross-links"
```

---

## Task 8: Final verification

- [ ] **Step 1: Run all tests**

```bash
cd ~/code/wkdi-temp/website
npx vitest run --reporter=verbose 2>&1
```
Expected: All tests PASS

- [ ] **Step 2: Full build**

```bash
cd ~/code/wkdi-temp/website
npx astro build 2>&1 | tail -10
```
Expected: build succeeds, no TypeScript errors

- [ ] **Step 3: Playwright screenshot of each step**

```bash
cd ~/code/wkdi-temp/website && npm run dev -- --port 4322 &
sleep 5
npx playwright screenshot --viewport-size="1440,900" http://localhost:4322/kapitalanleger-rechner /tmp/ka-step1.png
npx playwright screenshot --viewport-size="390,844" http://localhost:4322/kapitalanleger-rechner /tmp/ka-step1-mobile.png
```
Check: Desktop and mobile layouts correct, inputs visible, step dots visible

- [ ] **Step 4: Final commit**

```bash
cd ~/code/wkdi-temp
git add -A
git status  # review what's staged
git commit -m "feat: kapitalanleger-rechner — complete Phase 2 implementation"
```
