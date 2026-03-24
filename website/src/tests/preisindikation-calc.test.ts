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
