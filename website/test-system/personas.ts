// test-system/personas.ts
// 6 Test-Personas für alle Segmente
// Test-E-Mail: info@hempura.de (Gmail, alle Personas teilen diese Inbox)

export interface Persona {
  name: string;
  email: string;
  telefon: string;
  segment: 'investor' | 'tippgeber' | 'makler' | 'bewertung';
  beschreibung: string;
  fields: Record<string, string>;
}

export const TEST_EMAIL = 'info@hempura.de';
export const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:4321';

export const personas: Persona[] = [
  {
    name: 'Klaus Müller',
    email: TEST_EMAIL,
    telefon: '0170 1234567',
    segment: 'investor',
    beschreibung: 'Erfahrener Investor, sucht Fix&Flip unter 150k',
    fields: {
      name: 'Klaus Müller',
      email: TEST_EMAIL,
      telefon: '0170 1234567',
      investor_typ: 'fix-flip',
      erfahrung: '5+ Jahre',
      erfahrung_deals: 'mehr',
      hauptproblem: 'objektfindung',
      pain_freitext: 'Suche Fix&Flip unter 150k Leipzig-Süd, Problem: Finanzierung',
    },
  },
  {
    name: 'Thomas Wagner',
    email: TEST_EMAIL,
    telefon: '0175 9876543',
    segment: 'investor',
    beschreibung: 'Anfänger-Investor, will erstes Objekt kaufen',
    fields: {
      name: 'Thomas Wagner',
      email: TEST_EMAIL,
      telefon: '0175 9876543',
      investor_typ: 'kapitalanlage',
      erfahrung: 'Anfänger',
      erfahrung_deals: '0',
      hauptproblem: 'anfang',
    },
  },
  {
    name: 'Sabine Richter',
    email: TEST_EMAIL,
    telefon: '0162 5551234',
    segment: 'tippgeber',
    beschreibung: 'Maklerin, kennt Eigentümer in Gohlis',
    fields: {
      name: 'Sabine Richter',
      email: TEST_EMAIL,
      telefon: '0162 5551234',
      tippgeber_typ: 'makler',
      plz: '04157',
      objekt_quelle: 'beruflich',
      tipps_monat: '3-5',
      pain_freitext: 'Nachbarin in Gohlis will Wohnung verkaufen, traut sich nicht',
    },
  },
  {
    name: 'Maria Schmidt',
    email: TEST_EMAIL,
    telefon: '0151 8881234',
    segment: 'tippgeber',
    beschreibung: 'Privatperson, kennt Erbengemeinschaft',
    fields: {
      name: 'Maria Schmidt',
      email: TEST_EMAIL,
      telefon: '0151 8881234',
      tippgeber_typ: 'privat',
      plz: '04229',
      objekt_quelle: 'familie',
    },
  },
  {
    name: 'Peter Hoffmann',
    email: TEST_EMAIL,
    telefon: '0341 8009000',
    segment: 'makler',
    beschreibung: 'Makler mit Investoren-Kunden, kein Off-Market',
    fields: {
      name: 'Peter Hoffmann',
      email: TEST_EMAIL,
      telefon: '0341 8009000',
      maklerbuero: 'Immobilien Hoffmann GmbH',
      abschluesse_jahr: '10-30',
      kooperation_interesse: 'off-market',
    },
  },
  {
    name: 'Frank Bauer',
    email: TEST_EMAIL,
    telefon: '0170 4445678',
    segment: 'bewertung',
    beschreibung: 'Verkäufer unter Zeitdruck (Erbengemeinschaft)',
    fields: {
      vorname: 'Frank',
      nachname: 'Bauer',
      email: TEST_EMAIL,
      telefon: '0170 4445678',
      plz: '04103',
      typ: 'etw',
      dringlichkeit: 'sofort',
      pain_freitext: 'Muss bis Ende Jahr verkaufen, Erbengemeinschaft macht Druck',
    },
  },
];
