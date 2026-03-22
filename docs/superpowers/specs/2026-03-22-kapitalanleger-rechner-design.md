# Design Spec — Kapitalanleger-Rechner (Buy & Hold)

**Date:** 2026-03-22
**Branch:** feat/website-build
**Status:** Approved

---

## Overview

New page `/kapitalanleger-rechner` — a 5-step wizard for Buy & Hold investors to calculate AfA tax benefit, net cashflow after tax, Kaufpreisfaktor, and DCF NPV for Leipzig investment properties. Lead capture via email gate before PDF delivery.

---

## Architecture

**Approach:** 3 new files, zero changes to existing files.

```
src/lib/kapitalanleger-calc.ts         ← Types + calculation logic
src/pages/kapitalanleger-rechner.astro  ← 5-step wizard UI
src/pages/api/kapitalanleger-report.ts  ← Email gate → PDF → Brevo
```

**Additions only (no modifications):**
- `investoren.astro` + `roi-rechner.astro`: add "Kapitalanleger" nav link

**DB:** New `leads_kapitalanleger` table (same schema pattern as `registrations`).

---

## Step Structure

### Step 1 — Objekt
| Input | Type | Notes |
|-------|------|-------|
| Kaufpreis | number (€) | |
| Baujahr | number (year) | Determines AfA rate |
| Wohnfläche | number (m²) | |
| Kaltmiete/Monat | number (€) | |
| Hausgeld/Monat | number (€) | |

### Step 2 — Finanzierung
| Input | Type | Notes |
|-------|------|-------|
| Darlehensbetrag | number (€) | |
| Zinssatz | number (%) | Annual |
| Tilgung | number (%) | Annual |

### Step 3 — Steuer & Parameter
| Input | Type | Default | Notes |
|-------|------|---------|-------|
| Grenzsteuersatz | number (%) | — | User's marginal tax rate |
| Haltedauer | number (Jahre) | 10 | |
| Gebäudeanteil | number (%) | 80 | BFH IX R 12/21: not a legal standard, must be adjustable |

**Erweiterte Parameter (collapsible, closed by default):**
| Input | Default | Notes |
|-------|---------|-------|
| Diskontrate | 5.0% | Leipzig B-Stadt benchmark |
| Mietsteigerung p.a. | 2.0% | |
| Leerstandsrisiko | 3.0% | Applied as deduction on Kaltmiete |

### Step 4 — Vorschau (no email gate)

3 KPIs fully visible, each with formula line + comment:

```
Kaufpreisfaktor          [value]×
[kaufpreis] ÷ ([miete] × 12)    [label: z.B. "Solides B-Objekt (Leipzig: 20–28×)"]

Cashflow/Monat netto     [value] €
nach Zinsen, Tilgung,    [label: positiv/negativ + kurzer Hinweis]
Hausgeld, Steuer

AfA Steuerersparnis/J    [value] €
[kaufpreis] × [gebäudeanteil]% × [rate]%    §7 EStG · Baujahr [year]
```

3 gated KPIs shown below — blurred values + blurred formulas:
- NPV 10 Jahre
- NPV 20 Jahre
- Brutto-Rendite

CTA below: "Vollanalyse freischalten →"

### Step 5 — Analyse freischalten (Email Gate)

Identical pattern to `roi-rechner.astro`:
- Vorname + Email inputs
- Submit → POST to `/api/kapitalanleger-report`
- On success: show confirmation, PDF delivered via email

---

## Calculation Logic (`kapitalanleger-calc.ts`)

### AfA §7 Abs. 4 EStG
```typescript
const rate = baujahr <= 1924 ? 0.025 : baujahr >= 2023 ? 0.03 : 0.02;
const jahresAfA = kaufpreis * (gebaeudeanteil / 100) * rate;
```

### §21 EStG — Werbungskosten & Steuer
```typescript
const zinsen = darlehen * (zinssatz / 100);           // Jahreszinsen
const nichtUmlagefaehig = hausgeld * 12 * 0.30;       // 30% pauschal
const werbungskosten = zinsen + nichtUmlagefaehig + jahresAfA;

const bruttoMieteJahr = kaltmiete * 12 * (1 - leerstand / 100);
const zuVersteuern = bruttoMieteJahr - werbungskosten;
const einkommensteuer = Math.max(0, zuVersteuern) * (grenzsteuersatz / 100);
```

### Netto-Cashflow nach Steuer
```typescript
const kapitaldienstJahr = darlehen * ((zinssatz + tilgung) / 100);
const nettoJahr = bruttoMieteJahr - kapitaldienstJahr - hausgeld * 12 - einkommensteuer;
const nettoMonat = nettoJahr / 12;
```

### Kaufpreisfaktor
```typescript
const faktor = kaufpreis / (kaltmiete * 12);
```

### Brutto-Rendite
```typescript
const bruttoRendite = (kaltmiete * 12) / kaufpreis * 100;
```

### DCF NPV
```typescript
let npv = 0;
for (let t = 1; t <= haltedauer; t++) {
  const cf = nettoJahr * Math.pow(1 + mietsteigerung / 100, t - 1);
  npv += cf / Math.pow(1 + diskontRate / 100, t);
}
// Terminal Value: Kaufpreisfaktor as exit multiple proxy
const exitMiete = kaltmiete * 12 * Math.pow(1 + mietsteigerung / 100, haltedauer);
const tv = exitMiete * faktor;
npv += tv / Math.pow(1 + diskontRate / 100, haltedauer);
```

**Note:** WEG-Rücklagen not deducted (BFH IX R 19/24, 14.01.2025: only deductible when WEG spends funds). Disclaimer shown in PDF.

---

## API Endpoint (`kapitalanleger-report.ts`)

Same pattern as `roi-report.ts`:
1. POST receives: all inputs + vorname + email
2. Recalculates server-side (no client trust)
3. Generates PDF HTML with full results including Tilgungsplan
4. Puppeteer → PDF buffer
5. Brevo transactional email with PDF attachment
6. `insertKapitalanlegerLead()` → `leads_kapitalanleger` DB table
7. Returns `{ success: true }`

**DB table `leads_kapitalanleger`:**
```sql
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
```

---

## Navigation Additions

- `investoren.astro`: link "Kapitalanleger-Rechner →" under investor tools section
- `roi-rechner.astro`: teaser below results: "Langfrist-Investor? → Kapitalanleger-Rechner"

---

## Out of Scope

- Tilgungsplan year-by-year table (in PDF only, not in UI preview)
- GEG-Förderung (BEG) — not relevant for Buy & Hold scenario
- 70%-Regel — Fix & Flip only
- Spekulationssteuer — covered implicitly by Haltedauer ≥10J note in PDF
