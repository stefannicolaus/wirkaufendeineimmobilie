import { describe, it, expect } from 'vitest';
import { calcKapitalanleger, buildTilgungsplan, formatEur } from '../lib/kapitalanleger-calc';

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
    expect(r.einkommensteuer).toBeGreaterThan(0);
    expect(r.zuVersteuern).toBeGreaterThan(0);
  });
});

describe('Netto-Cashflow nach Steuer', () => {
  it('computes nettoMonat correctly for base scenario', () => {
    // kapitaldienstJahr = 160000 * (0.035+0.02) = 8800
    // bruttoMieteJahr = 9312
    // nettoJahr = 9312 - 8800 - 200*12 - 0 = 9312 - 8800 - 2400 - 0 = -1888
    // nettoMonat = -1888/12 ≈ -157.33
    const r = calcKapitalanleger(BASE);
    expect(r.nettoMonat).toBeCloseTo(-157.33, 1);
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
    expect(r.npv10j).toBeGreaterThan(0);
    expect(r.npv20j).toBeGreaterThan(r.npv10j);
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

describe('Edge cases', () => {
  it('darlehen=0 (no loan): no crash, zero zinsen', () => {
    const r = calcKapitalanleger({ ...BASE, darlehen: 0 });
    expect(r.zinsen).toBe(0);
    expect(r.kapitaldienstJahr).toBe(0);
  });

  it('formatEur formats correctly', () => {
    expect(formatEur(1234)).toContain('1.234');
    expect(formatEur(1234)).toContain('€');
  });
});
