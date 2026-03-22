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
  kaufpreis: number;
  sanierungskosten: number;
  wohnflaeche: number;
  grunderwerbsteuer: number;
  notar: number;
  provision_kauf: number;
  nebenkosten_gesamt: number;
  beg_foerderung: number;
  gesamtinvestition: number;
  qm_preis_saniert: number;
  verkaufspreis: number;
  provision_verkauf: number;
  brutto_gewinn: number;
  netto_gewinn: number;
  roi_pct: number;
  regel_70_check: boolean;
  spekulationssteuer_check: boolean;
  deal_score: 'A' | 'B' | 'C' | 'D';
  deal_score_label: string;
}

// Marktpreise Leipzig nach Stadtteil (€/m² saniert)
const MARKTPREISE: Record<string, number> = {
  'plagwitz':     3200,
  'suedvorstadt': 3100,
  'gohlis':       2800,
  'lindenau':     2600,
  'reudnitz':     2400,
  'neustadt':     2300,
  'volkmarsdorf': 2000,
  'sellerhausen': 1900,
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

  // BEG-Förderung für GEG-Objekte (40% auf Sanierungskosten)
  const beg_foerderung = input.objekt_typ === 'geg' ? Math.round(san * 0.40) : 0;
  const san_netto = san - beg_foerderung;
  const gesamtinvestition = kp + nebenkosten_gesamt + san_netto;

  // ARV (After Repair Value)
  const qm_preis_saniert = MARKTPREISE[input.stadtteil] ?? 2400;
  const verkaufspreis = Math.round(m2 * qm_preis_saniert);
  const provision_verkauf = Math.round(verkaufspreis * 0.0357);

  // Profit
  const brutto_gewinn = verkaufspreis - gesamtinvestition;
  const netto_gewinn = brutto_gewinn - provision_verkauf;
  const roi_pct = Math.round((netto_gewinn / gesamtinvestition) * 100);

  // 70%-Regel: Kaufpreis ≤ 70% von ARV - Sanierungskosten
  const regel_70_check = kp <= (verkaufspreis * 0.70) - san;

  // Spekulationssteuer: nur bei Langfrist (≥10 Jahre) steuerfrei
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
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(n);
}
