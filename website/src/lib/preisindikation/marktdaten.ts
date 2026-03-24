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
