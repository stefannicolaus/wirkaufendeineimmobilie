import type { BezirkName, ObjektTyp } from '../lib/stadtteile-verkaufen/copy';

export interface StadtteilVerkaufen {
  slug: string;
  name: string;
  bezirk: BezirkName;
  preis: number;          // €/m², Immowelt Preisatlas März 2026
  milieuschutz: boolean;
  nachbarn: string[];     // slugs aus dieser Datei
  objekttyp: ObjektTyp;
  publishDate: string | null;  // ISO-Datum: ab wann die Seite live geht (null = offline)
  bodenrichtwert?: number;     // €/m², Gutachterausschuss Leipzig, Stichtag 01.01.2024
}

// Quelle: Immowelt Preisatlas, März 2026
// milieuschutz: § 172 BauGB — 11 Stadtteile
// objekttyp: Standardwerte aus Preisniveau abgeleitet
// nachbarn: vorerst befüllt
//
// Veröffentlichungsplan: 3 Stadtteile/Woche, jeden Montag
// Coolify rebuild läuft per Cron — filtert automatisch nach publishDate <= heute (BUILD-Datum)
// Priorität: Gefragte Lagen zuerst (Plagwitz, Connewitz, Schleußig, Gohlis...)

export const STADTTEILE: StadtteilVerkaufen[] = [
  // ZENTRUM (7)
  { slug: 'zentrum', name: 'Zentrum', bezirk: 'Zentrum', preis: 3333, milieuschutz: false, nachbarn: ['zentrum-west', 'zentrum-nord', 'zentrum-ost', 'zentrum-sued'], objekttyp: 'altbau', publishDate: '2026-04-28' },
  { slug: 'zentrum-west', name: 'Zentrum-West', bezirk: 'Zentrum', preis: 3346, milieuschutz: false, nachbarn: ['zentrum', 'zentrum-nordwest', 'lindenau'], objekttyp: 'altbau', publishDate: '2026-05-04' },
  { slug: 'zentrum-nordwest', name: 'Zentrum-Nordwest', bezirk: 'Zentrum', preis: 3184, milieuschutz: false, nachbarn: ['zentrum-west', 'zentrum-nord', 'gohlis-sued'], objekttyp: 'altbau', publishDate: '2026-05-04' },
  { slug: 'zentrum-sued', name: 'Zentrum-Süd', bezirk: 'Zentrum', preis: 3110, milieuschutz: false, nachbarn: ['zentrum', 'zentrum-suedost', 'suedvorstadt'], objekttyp: 'altbau', publishDate: '2026-04-28' },
  { slug: 'zentrum-nord', name: 'Zentrum-Nord', bezirk: 'Zentrum', preis: 2972, milieuschutz: false, nachbarn: ['zentrum', 'zentrum-nordwest', 'gohlis-sued'], objekttyp: 'altbau', publishDate: '2026-05-11' },
  { slug: 'zentrum-ost', name: 'Zentrum-Ost', bezirk: 'Zentrum', preis: 2938, milieuschutz: false, nachbarn: ['zentrum', 'zentrum-suedost', 'reudnitz-thonberg'], objekttyp: 'altbau', publishDate: '2026-05-11' },
  { slug: 'zentrum-suedost', name: 'Zentrum-Südost', bezirk: 'Zentrum', preis: 2926, milieuschutz: false, nachbarn: ['zentrum-ost', 'zentrum-sued', 'reudnitz-thonberg'], objekttyp: 'altbau', publishDate: '2026-05-11' },

  // NORD (8)
  { slug: 'gohlis-sued', name: 'Gohlis-Süd', bezirk: 'Nord', preis: 2682, milieuschutz: false, nachbarn: ['gohlis-mitte', 'zentrum-nordwest', 'eutritzsch'], objekttyp: 'gruenderzeit', publishDate: '2026-04-07' },
  { slug: 'gohlis-mitte', name: 'Gohlis-Mitte', bezirk: 'Nord', preis: 2543, milieuschutz: false, nachbarn: ['gohlis-sued', 'gohlis-nord', 'eutritzsch'], objekttyp: 'gruenderzeit', publishDate: '2026-04-07' },
  { slug: 'gohlis-nord', name: 'Gohlis-Nord', bezirk: 'Nord', preis: 2798, milieuschutz: false, nachbarn: ['gohlis-mitte', 'wahren', 'eutritzsch'], objekttyp: 'gruenderzeit', publishDate: '2026-04-14' },
  { slug: 'eutritzsch', name: 'Eutritzsch', bezirk: 'Nord', preis: 2481, milieuschutz: true, nachbarn: ['gohlis-sued', 'gohlis-mitte', 'schoenefeld-abtnaundorf'], objekttyp: 'gruenderzeit', publishDate: '2026-04-21' },
  { slug: 'seehausen', name: 'Seehausen', bezirk: 'Nord', preis: 2672, milieuschutz: false, nachbarn: ['wiederitzsch', 'wahren'], objekttyp: 'mischbebauung', publishDate: '2026-06-08' },
  { slug: 'wiederitzsch', name: 'Wiederitzsch', bezirk: 'Nord', preis: 2663, milieuschutz: false, nachbarn: ['seehausen', 'lindenthal'], objekttyp: 'mischbebauung', publishDate: '2026-06-08' },
  { slug: 'schoenefeld-abtnaundorf', name: 'Schönefeld-Abtnaundorf', bezirk: 'Nord', preis: 2104, milieuschutz: true, nachbarn: ['eutritzsch', 'schoenefeld-ost', 'mockau-sued'], objekttyp: 'plattenbau', publishDate: '2026-06-15' },
  { slug: 'schoenefeld-ost', name: 'Schönefeld-Ost', bezirk: 'Nord', preis: 2649, milieuschutz: false, nachbarn: ['schoenefeld-abtnaundorf', 'mockau-sued'], objekttyp: 'gruenderzeit', publishDate: '2026-06-01' },

  // OST (16)
  { slug: 'mockau-sued', name: 'Mockau-Süd', bezirk: 'Ost', preis: 2232, milieuschutz: false, nachbarn: ['mockau-nord', 'schoenefeld-abtnaundorf', 'thekla'], objekttyp: 'plattenbau', publishDate: '2026-06-22' },
  { slug: 'mockau-nord', name: 'Mockau-Nord', bezirk: 'Ost', preis: 2125, milieuschutz: false, nachbarn: ['mockau-sued', 'thekla', 'plaussig-portitz'], objekttyp: 'plattenbau', publishDate: '2026-07-06' },
  { slug: 'thekla', name: 'Thekla', bezirk: 'Ost', preis: 2543, milieuschutz: false, nachbarn: ['mockau-nord', 'heiterblick', 'plaussig-portitz'], objekttyp: 'mischbebauung', publishDate: '2026-06-22' },
  { slug: 'plaussig-portitz', name: 'Plaußig-Portitz', bezirk: 'Ost', preis: 2785, milieuschutz: false, nachbarn: ['thekla', 'mockau-nord'], objekttyp: 'mischbebauung', publishDate: '2026-07-06' },
  { slug: 'neustadt-neuschoenef', name: 'Neustadt-Neuschönefeld', bezirk: 'Ost', preis: 2486, milieuschutz: true, nachbarn: ['volkmarsdorf', 'reudnitz-thonberg', 'anger-crottendorf'], objekttyp: 'gruenderzeit', publishDate: '2026-06-29' },
  { slug: 'volkmarsdorf', name: 'Volkmarsdorf', bezirk: 'Ost', preis: 2267, milieuschutz: true, nachbarn: ['neustadt-neuschoenef', 'anger-crottendorf', 'sellerhausen-stuenz'], objekttyp: 'gruenderzeit', publishDate: '2026-06-29' },
  { slug: 'anger-crottendorf', name: 'Anger-Crottendorf', bezirk: 'Ost', preis: 2147, milieuschutz: false, nachbarn: ['volkmarsdorf', 'sellerhausen-stuenz', 'reudnitz-thonberg'], objekttyp: 'gruenderzeit', publishDate: '2026-06-29' },
  { slug: 'sellerhausen-stuenz', name: 'Sellerhausen-Stünz', bezirk: 'Ost', preis: 2226, milieuschutz: false, nachbarn: ['volkmarsdorf', 'anger-crottendorf', 'paunsdorf'], objekttyp: 'plattenbau', publishDate: '2026-07-13' },
  { slug: 'paunsdorf', name: 'Paunsdorf', bezirk: 'Ost', preis: 2091, milieuschutz: false, nachbarn: ['sellerhausen-stuenz', 'heiterblick', 'engelsdorf'], objekttyp: 'plattenbau', publishDate: '2026-07-13' },
  { slug: 'heiterblick', name: 'Heiterblick', bezirk: 'Ost', preis: 2379, milieuschutz: false, nachbarn: ['paunsdorf', 'thekla', 'moelkau'], objekttyp: 'mischbebauung', publishDate: '2026-06-22' },
  { slug: 'moelkau', name: 'Mölkau', bezirk: 'Ost', preis: 2559, milieuschutz: false, nachbarn: ['heiterblick', 'engelsdorf', 'althen-kleinpoesna'], objekttyp: 'mischbebauung', publishDate: '2026-07-13' },
  { slug: 'engelsdorf', name: 'Engelsdorf', bezirk: 'Ost', preis: 2283, milieuschutz: false, nachbarn: ['paunsdorf', 'moelkau', 'althen-kleinpoesna'], objekttyp: 'mischbebauung', publishDate: '2026-07-20' },
  { slug: 'althen-kleinpoesna', name: 'Althen-Kleinpösna', bezirk: 'Ost', preis: 2053, milieuschutz: false, nachbarn: ['moelkau', 'engelsdorf'], objekttyp: 'mischbebauung', publishDate: '2026-07-20' },
  { slug: 'reudnitz-thonberg', name: 'Reudnitz-Thonberg', bezirk: 'Ost', preis: 2381, milieuschutz: true, nachbarn: ['neustadt-neuschoenef', 'anger-crottendorf', 'stoetteritz', 'zentrum-ost'], objekttyp: 'gruenderzeit', publishDate: '2026-04-14' },
  { slug: 'stoetteritz', name: 'Stötteritz', bezirk: 'Ost', preis: 2411, milieuschutz: false, nachbarn: ['reudnitz-thonberg', 'probstheida', 'connewitz'], objekttyp: 'gruenderzeit', publishDate: '2026-04-21' },
  { slug: 'probstheida', name: 'Probstheida', bezirk: 'Ost', preis: 2561, milieuschutz: false, nachbarn: ['stoetteritz', 'marienbrunn'], objekttyp: 'mischbebauung', publishDate: '2026-07-20' },

  // SÜD (5)
  { slug: 'suedvorstadt', name: 'Südvorstadt', bezirk: 'Süd', preis: 2954, milieuschutz: false, nachbarn: ['connewitz', 'schleussig', 'zentrum-sued'], objekttyp: 'gruenderzeit', publishDate: '2026-04-07' },
  { slug: 'connewitz', name: 'Connewitz', bezirk: 'Süd', preis: 2669, milieuschutz: true, nachbarn: ['suedvorstadt', 'stoetteritz', 'marienbrunn', 'loessnig', 'kleinzschocher'], objekttyp: 'gruenderzeit', publishDate: '2026-03-25', bodenrichtwert: 924 },
  { slug: 'marienbrunn', name: 'Marienbrunn', bezirk: 'Süd', preis: 2743, milieuschutz: false, nachbarn: ['connewitz', 'loessnig', 'probstheida'], objekttyp: 'mischbebauung', publishDate: '2026-05-18' },
  { slug: 'loessnig', name: 'Lößnig', bezirk: 'Süd', preis: 2402, milieuschutz: false, nachbarn: ['connewitz', 'marienbrunn', 'doelitz-doesen'], objekttyp: 'plattenbau', publishDate: '2026-05-18' },
  { slug: 'doelitz-doesen', name: 'Dölitz-Dösen', bezirk: 'Süd', preis: 2583, milieuschutz: false, nachbarn: ['loessnig', 'marienbrunn'], objekttyp: 'mischbebauung', publishDate: '2026-05-25' },

  // WEST (14)
  { slug: 'schleussig', name: 'Schleußig', bezirk: 'West', preis: 3085, milieuschutz: false, nachbarn: ['plagwitz', 'suedvorstadt', 'lindenau'], objekttyp: 'gruenderzeit', publishDate: '2026-03-25', bodenrichtwert: 1092 },
  { slug: 'plagwitz', name: 'Plagwitz', bezirk: 'West', preis: 2743, milieuschutz: true, nachbarn: ['schleussig', 'lindenau', 'kleinzschocher', 'leutzsch'], objekttyp: 'altbau', publishDate: '2026-03-25', bodenrichtwert: 978 },
  { slug: 'kleinzschocher', name: 'Kleinzschocher', bezirk: 'West', preis: 2379, milieuschutz: true, nachbarn: ['plagwitz', 'connewitz', 'grosszschocher', 'knauthain'], objekttyp: 'gruenderzeit', publishDate: '2026-04-28' },
  { slug: 'grosszschocher', name: 'Großzschocher', bezirk: 'West', preis: 2263, milieuschutz: false, nachbarn: ['kleinzschocher', 'knauthain', 'schoenau'], objekttyp: 'mischbebauung', publishDate: '2026-07-06' },
  { slug: 'knauthain', name: 'Knauthain', bezirk: 'West', preis: 2590, milieuschutz: false, nachbarn: ['grosszschocher', 'kleinzschocher'], objekttyp: 'mischbebauung', publishDate: '2026-05-18' },
  { slug: 'schoenau', name: 'Schönau', bezirk: 'West', preis: 2119, milieuschutz: false, nachbarn: ['grosszschocher', 'gruenau-ost', 'lausen-gruenau'], objekttyp: 'plattenbau', publishDate: '2026-07-27' },
  { slug: 'gruenau-ost', name: 'Grünau-Ost', bezirk: 'West', preis: 1859, milieuschutz: false, nachbarn: ['schoenau', 'gruenau-mitte', 'gruenau-siedlung'], objekttyp: 'plattenbau', publishDate: '2026-07-27' },
  { slug: 'gruenau-nord', name: 'Grünau-Nord', bezirk: 'West', preis: 2156, milieuschutz: false, nachbarn: ['gruenau-mitte', 'lausen-gruenau'], objekttyp: 'plattenbau', publishDate: '2026-08-03' },
  { slug: 'gruenau-mitte', name: 'Grünau-Mitte', bezirk: 'West', preis: 2041, milieuschutz: false, nachbarn: ['gruenau-ost', 'gruenau-nord', 'gruenau-siedlung'], objekttyp: 'plattenbau', publishDate: '2026-08-03' },
  { slug: 'gruenau-siedlung', name: 'Grünau-Siedlung', bezirk: 'West', preis: 2402, milieuschutz: false, nachbarn: ['gruenau-ost', 'gruenau-mitte'], objekttyp: 'plattenbau', publishDate: '2026-08-03' },
  { slug: 'lausen-gruenau', name: 'Lausen-Grünau', bezirk: 'West', preis: 2166, milieuschutz: false, nachbarn: ['schoenau', 'gruenau-nord', 'leutzsch'], objekttyp: 'plattenbau', publishDate: '2026-07-27' },
  { slug: 'lindenau', name: 'Lindenau', bezirk: 'West', preis: 2531, milieuschutz: true, nachbarn: ['plagwitz', 'alt-lindenau', 'schleussig', 'leutzsch'], objekttyp: 'gruenderzeit', publishDate: '2026-04-01' },
  { slug: 'alt-lindenau', name: 'Alt-Lindenau', bezirk: 'West', preis: 2451, milieuschutz: true, nachbarn: ['lindenau', 'neu-lindenau', 'boehlitz-ehrenberg'], objekttyp: 'gruenderzeit', publishDate: '2026-04-28' },
  { slug: 'neu-lindenau', name: 'Neu-Lindenau', bezirk: 'West', preis: 2398, milieuschutz: false, nachbarn: ['alt-lindenau', 'boehlitz-ehrenberg', 'leutzsch'], objekttyp: 'gruenderzeit', publishDate: '2026-05-11' },

  // STADTRAND (6)
  { slug: 'leutzsch', name: 'Leutzsch', bezirk: 'Stadtrand', preis: 2474, milieuschutz: true, nachbarn: ['plagwitz', 'lindenau', 'neu-lindenau', 'moeckern'], objekttyp: 'gruenderzeit', publishDate: '2026-04-21' },
  { slug: 'boehlitz-ehrenberg', name: 'Böhlitz-Ehrenberg', bezirk: 'Stadtrand', preis: 2406, milieuschutz: false, nachbarn: ['alt-lindenau', 'neu-lindenau', 'burghausen'], objekttyp: 'mischbebauung', publishDate: '2026-06-15' },
  { slug: 'burghausen', name: 'Burghausen', bezirk: 'Stadtrand', preis: 2502, milieuschutz: false, nachbarn: ['boehlitz-ehrenberg'], objekttyp: 'mischbebauung', publishDate: '2026-06-15' },
  { slug: 'moeckern', name: 'Möckern', bezirk: 'Stadtrand', preis: 2214, milieuschutz: false, nachbarn: ['leutzsch', 'wahren', 'lindenthal'], objekttyp: 'mischbebauung', publishDate: '2026-07-20' },
  { slug: 'wahren', name: 'Wahren', bezirk: 'Stadtrand', preis: 2350, milieuschutz: false, nachbarn: ['moeckern', 'gohlis-nord', 'seehausen'], objekttyp: 'mischbebauung', publishDate: '2026-08-10' },
  { slug: 'lindenthal', name: 'Lindenthal', bezirk: 'Stadtrand', preis: 2431, milieuschutz: false, nachbarn: ['moeckern', 'wiederitzsch'], objekttyp: 'mischbebauung', publishDate: '2026-08-10' },
];

// Lookup helpers
export const SLUG_MAP: Record<string, string> = Object.fromEntries(
  STADTTEILE.map(st => [st.slug, st.name])
);

export function getBySlug(slug: string): StadtteilVerkaufen | undefined {
  return STADTTEILE.find(st => st.slug === slug);
}

export function groupByBezirk(): Record<BezirkName, StadtteilVerkaufen[]> {
  const groups = {} as Record<BezirkName, StadtteilVerkaufen[]>;
  for (const st of STADTTEILE) {
    if (!groups[st.bezirk]) groups[st.bezirk] = [];
    groups[st.bezirk].push(st);
  }
  return groups;
}

export const BEZIRK_ORDER: BezirkName[] = ['Zentrum', 'Nord', 'Ost', 'West', 'Süd', 'Stadtrand'];
