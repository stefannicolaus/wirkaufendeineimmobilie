# Design Spec — Kapitalanleger-Rechner (Buy & Hold)

**Date:** 2026-03-22
**Branch:** feat/website-build
**Status:** Approved

---

## Overview

New page `/kapitalanleger-rechner` — a 5-step wizard for Buy & Hold investors to calculate AfA tax benefit, net cashflow after tax, Kaufpreisfaktor, and DCF NPV for Leipzig investment properties. Lead capture via email gate before PDF delivery.

---

## Architecture

**Approach:** 3 new files. No logic changes to existing files; nav link additions only.

```
src/lib/kapitalanleger-calc.ts         ← Types + calculation logic
src/pages/kapitalanleger-rechner.astro  ← 5-step wizard UI
src/pages/api/kapitalanleger-report.ts  ← Email gate → PDF → Brevo
```

**Nav additions only (no logic changes):**
- `investoren.astro` + `roi-rechner.astro`: add "Kapitalanleger" nav link

**DB:** New `leads_kapitalanleger` table with domain-specific columns (not reusing `registrations`). Requires new `insertKapitalanlegerLead()` function and new `CREATE TABLE` block in `db.ts`.

---

## Step Structure

### Step 1 — Objekt
| Input | Type | Notes |
|-------|------|-------|
| Kaufpreis | number (€) | |
| Baujahr der Fertigstellung | number (year) | Label must say "Fertigstellung" — §7 rate based on completion year, not construction start |
| Wohnfläche | number (m²) | |
| Kaltmiete/Monat | number (€) | |
| Hausgeld/Monat | number (€) | |

### Step 2 — Finanzierung
| Input | Type | Validation | Notes |
|-------|------|-----------|-------|
| Darlehensbetrag | number (€) | max = Kaufpreis (warn if LTV > 100%) | |
| Zinssatz | number (%) | min=0, max=15 | Annual |
| Tilgung | number (%) | min=0, max=10 | Annual |

### Step 3 — Steuer & Parameter
| Input | Type | Default | Validation | Notes |
|-------|------|---------|-----------|-------|
| Grenzsteuersatz | number (%) | no default (intentional — force user to enter actual rate) | min=0, max=45 | German marginal rates: 0–42% + Reichensteuer 45% |
| Haltedauer | number (Jahre) | 10 | min=1, max=30 | |
| Gebäudeanteil | number (%) | 80 | min=50, max=95 | BFH IX R 12/21: not a legal standard, must be adjustable |

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
- Brutto-Rendite (intentionally gated even though trivially calculable — consistent gate UX)

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
// NOTE: 30% pauschal = non-allocatable portion of Hausgeld for TAX purposes only
// Full Hausgeld is still a real cash outflow (deducted separately in cashflow below)
const nichtUmlagefaehig = hausgeld * 12 * 0.30;
const werbungskosten = zinsen + nichtUmlagefaehig + jahresAfA;

const bruttoMieteJahr = kaltmiete * 12 * (1 - leerstand / 100);
const zuVersteuern = bruttoMieteJahr - werbungskosten;
const einkommensteuer = Math.max(0, zuVersteuern) * (grenzsteuersatz / 100);
// zuVersteuern can be negative (steuerliche Verluste) — einkommensteuer floors at 0
```

### Netto-Cashflow nach Steuer
```typescript
// kapitaldienstJahr = actual cash out for loan service (Zinsen + Tilgung)
const kapitaldienstJahr = darlehen * ((zinssatz + tilgung) / 100);
// hausgeld * 12 = full Hausgeld cash outflow (different from the 30% used in §21 above)
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
// Grow only the revenue side (Miete); fixed costs (Kapitaldienst, Hausgeld) stay constant
// This is still a simplification (Hausgeld/Verwaltung could also grow), but more accurate
// than growing the entire nettoJahr. Disclaimer in PDF.
let npv = 0;
for (let t = 1; t <= haltedauer; t++) {
  const mieteT = bruttoMieteJahr * Math.pow(1 + mietsteigerung / 100, t - 1);
  const zuVersteuernT = mieteT - werbungskosten; // werbungskosten fixed
  const steuernT = Math.max(0, zuVersteuernT) * (grenzsteuersatz / 100);
  const cfT = mieteT - kapitaldienstJahr - hausgeld * 12 - steuernT;
  npv += cfT / Math.pow(1 + diskontRate / 100, t);
}
// Terminal Value: exit at same Kaufpreisfaktor on grown rent
const exitMiete = kaltmiete * 12 * Math.pow(1 + mietsteigerung / 100, haltedauer);
const tv = exitMiete * faktor;
npv += tv / Math.pow(1 + diskontRate / 100, haltedauer);

// NPV calculated for both haltedauer=10 and haltedauer=20 regardless of user input
// (preview always shows both; PDF shows whichever matches user's Haltedauer + the other)
```

**Note:** WEG-Rücklagen not deducted (BFH IX R 19/24, 14.01.2025: only deductible when WEG spends funds). Disclaimer shown in PDF.

**Simplification note:** NPV loop uses fixed `zinsen = darlehen * zinssatz` (non-amortizing). The Tilgungsplan in the PDF uses correct amortizing Zinsen (restschuld × zinssatz, declining). The two produce slightly different annual cashflow numbers — this is intentional. NPV is a planning approximation; Tilgungsplan is the accurate year-by-year schedule. Both are labeled accordingly in the PDF.

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

## PDF Content — Tilgungsplan

Columns (year-by-year, 1 row per Jahr up to Haltedauer):

| Jahr | Restschuld (€) | Zinsen (€) | Tilgung (€) | Jahres-Cashflow netto (€) |
|------|---------------|-----------|------------|--------------------------|

Formula per row:
```typescript
// Year t:
zinsenT = restschuld * (zinssatz / 100)
tilgungT = darlehen * (tilgung / 100)          // constant annual repayment
restschuld -= tilgungT
cashflowT = mieteT - zinsenT - tilgungT - hausgeld*12 - steuernT
```

---

## Out of Scope

- GEG-Förderung (BEG) — not relevant for Buy & Hold scenario
- 70%-Regel — Fix & Flip only
- Spekulationssteuer — covered implicitly by Haltedauer ≥10J note in PDF
