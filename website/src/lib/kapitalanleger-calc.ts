// src/lib/kapitalanleger-calc.ts

export interface KapitalanlegerInput {
  kaufpreis: number;
  baujahr: number;
  wohnflaeche: number;         // stored in DB; not used in calculations
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
// Terminal Value = exit price net of remaining loan (equity realisation model).
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
  darlehen: number,
  tilgung: number,
  leerstand: number,
): number {
  let npv = 0;
  for (let t = 1; t <= haltedauer; t++) {
    const mieteT = bruttoMieteJahr * Math.pow(1 + mietsteigerung / 100, t - 1);
    const zuVersteuernT = mieteT - werbungskosten;
    const steuernT = Math.max(0, zuVersteuernT) * (grenzsteuersatz / 100);
    const cfT = mieteT - kapitaldienstJahr - hausgeldJahr - steuernT;
    npv += cfT / Math.pow(1 + diskontRate / 100, t);
  }
  // Terminal Value: exit price (rent-based valuation) minus restschuld at exit
  // Apply same Leerstand discount to TV as to annual cashflows
  const exitMiete = kaltmiete * 12 * (1 - leerstand / 100) * Math.pow(1 + mietsteigerung / 100, haltedauer);
  const exitPrice = exitMiete * kaufpreisfaktor;
  const tilgungBetrag = darlehen * (tilgung / 100);
  const restschuld = Math.max(0, darlehen - haltedauer * tilgungBetrag);
  const tvNet = (exitPrice - restschuld) / Math.pow(1 + diskontRate / 100, haltedauer);
  npv += tvNet;
  return Math.round(npv);
}

/**
 * Requires: kaufpreis > 0, kaltmiete > 0
 * kaufpreisfaktor and bruttoRendite return Infinity if kaltmiete=0 or kaufpreis=0 respectively.
 */
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
    darlehen, tilgung, leerstand,
  );
  const npv20j = computeNpv(
    bruttoMieteJahr, werbungskosten, kapitaldienstJahr, hausgeldJahr,
    grenzsteuersatz, kaufpreisfaktor, kaltmiete, 20, diskontRate, mietsteigerung,
    darlehen, tilgung, leerstand,
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
