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
