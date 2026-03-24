import type { BezirkName, ObjektTyp } from '../lib/stadtteile-verkaufen/copy';

export interface StadtteilVerkaufen {
  slug: string;
  name: string;
  bezirk: BezirkName;
  preis: number;          // €/m², Immowelt Preisatlas März 2026
  milieuschutz: boolean;
  nachbarn: string[];     // slugs aus dieser Datei
  objekttyp: ObjektTyp;
}

// Quelle: Immowelt Preisatlas, März 2026
// milieuschutz: § 172 BauGB — 11 Stadtteile
// objekttyp: Standardwerte aus Preisniveau abgeleitet
// nachbarn: vorerst befüllt

export const STADTTEILE: StadtteilVerkaufen[] = [
  // ZENTRUM (7)
  { slug: 'zentrum', name: 'Zentrum', bezirk: 'Zentrum', preis: 3333, milieuschutz: false, nachbarn: ['zentrum-west', 'zentrum-nord', 'zentrum-ost', 'zentrum-sued'], objekttyp: 'altbau' },
  { slug: 'zentrum-west', name: 'Zentrum-West', bezirk: 'Zentrum', preis: 3346, milieuschutz: false, nachbarn: ['zentrum', 'zentrum-nordwest', 'lindenau'], objekttyp: 'altbau' },
  { slug: 'zentrum-nordwest', name: 'Zentrum-Nordwest', bezirk: 'Zentrum', preis: 3184, milieuschutz: false, nachbarn: ['zentrum-west', 'zentrum-nord', 'gohlis-sued'], objekttyp: 'altbau' },
  { slug: 'zentrum-sued', name: 'Zentrum-Süd', bezirk: 'Zentrum', preis: 3110, milieuschutz: false, nachbarn: ['zentrum', 'zentrum-suedost', 'suedvorstadt'], objekttyp: 'altbau' },
  { slug: 'zentrum-nord', name: 'Zentrum-Nord', bezirk: 'Zentrum', preis: 2972, milieuschutz: false, nachbarn: ['zentrum', 'zentrum-nordwest', 'gohlis-sued'], objekttyp: 'altbau' },
  { slug: 'zentrum-ost', name: 'Zentrum-Ost', bezirk: 'Zentrum', preis: 2938, milieuschutz: false, nachbarn: ['zentrum', 'zentrum-suedost', 'reudnitz-thonberg'], objekttyp: 'altbau' },
  { slug: 'zentrum-suedost', name: 'Zentrum-Südost', bezirk: 'Zentrum', preis: 2926, milieuschutz: false, nachbarn: ['zentrum-ost', 'zentrum-sued', 'reudnitz-thonberg'], objekttyp: 'altbau' },

  // NORD (8)
  { slug: 'gohlis-sued', name: 'Gohlis-Süd', bezirk: 'Nord', preis: 2682, milieuschutz: false, nachbarn: ['gohlis-mitte', 'zentrum-nordwest', 'eutritzsch'], objekttyp: 'gruenderzeit' },
  { slug: 'gohlis-mitte', name: 'Gohlis-Mitte', bezirk: 'Nord', preis: 2543, milieuschutz: false, nachbarn: ['gohlis-sued', 'gohlis-nord', 'eutritzsch'], objekttyp: 'gruenderzeit' },
  { slug: 'gohlis-nord', name: 'Gohlis-Nord', bezirk: 'Nord', preis: 2798, milieuschutz: false, nachbarn: ['gohlis-mitte', 'wahren', 'eutritzsch'], objekttyp: 'gruenderzeit' },
  { slug: 'eutritzsch', name: 'Eutritzsch', bezirk: 'Nord', preis: 2481, milieuschutz: true, nachbarn: ['gohlis-sued', 'gohlis-mitte', 'schoenefeld-abtnaundorf'], objekttyp: 'gruenderzeit' },
  { slug: 'seehausen', name: 'Seehausen', bezirk: 'Nord', preis: 2672, milieuschutz: false, nachbarn: ['wiederitzsch', 'wahren'], objekttyp: 'mischbebauung' },
  { slug: 'wiederitzsch', name: 'Wiederitzsch', bezirk: 'Nord', preis: 2663, milieuschutz: false, nachbarn: ['seehausen', 'lindenthal'], objekttyp: 'mischbebauung' },
  { slug: 'schoenefeld-abtnaundorf', name: 'Schönefeld-Abtnaundorf', bezirk: 'Nord', preis: 2104, milieuschutz: true, nachbarn: ['eutritzsch', 'schoenefeld-ost', 'mockau-sued'], objekttyp: 'plattenbau' },
  { slug: 'schoenefeld-ost', name: 'Schönefeld-Ost', bezirk: 'Nord', preis: 2649, milieuschutz: false, nachbarn: ['schoenefeld-abtnaundorf', 'mockau-sued'], objekttyp: 'gruenderzeit' },

  // OST (16)
  { slug: 'mockau-sued', name: 'Mockau-Süd', bezirk: 'Ost', preis: 2232, milieuschutz: false, nachbarn: ['mockau-nord', 'schoenefeld-abtnaundorf', 'thekla'], objekttyp: 'plattenbau' },
  { slug: 'mockau-nord', name: 'Mockau-Nord', bezirk: 'Ost', preis: 2125, milieuschutz: false, nachbarn: ['mockau-sued', 'thekla', 'plaussig-portitz'], objekttyp: 'plattenbau' },
  { slug: 'thekla', name: 'Thekla', bezirk: 'Ost', preis: 2543, milieuschutz: false, nachbarn: ['mockau-nord', 'heiterblick', 'plaussig-portitz'], objekttyp: 'mischbebauung' },
  { slug: 'plaussig-portitz', name: 'Plaußig-Portitz', bezirk: 'Ost', preis: 2785, milieuschutz: false, nachbarn: ['thekla', 'mockau-nord'], objekttyp: 'mischbebauung' },
  { slug: 'neustadt-neuschoenef', name: 'Neustadt-Neuschönefeld', bezirk: 'Ost', preis: 2486, milieuschutz: true, nachbarn: ['volkmarsdorf', 'reudnitz-thonberg', 'anger-crottendorf'], objekttyp: 'gruenderzeit' },
  { slug: 'volkmarsdorf', name: 'Volkmarsdorf', bezirk: 'Ost', preis: 2267, milieuschutz: true, nachbarn: ['neustadt-neuschoenef', 'anger-crottendorf', 'sellerhausen-stuenz'], objekttyp: 'gruenderzeit' },
  { slug: 'anger-crottendorf', name: 'Anger-Crottendorf', bezirk: 'Ost', preis: 2147, milieuschutz: false, nachbarn: ['volkmarsdorf', 'sellerhausen-stuenz', 'reudnitz-thonberg'], objekttyp: 'gruenderzeit' },
  { slug: 'sellerhausen-stuenz', name: 'Sellerhausen-Stünz', bezirk: 'Ost', preis: 2226, milieuschutz: false, nachbarn: ['volkmarsdorf', 'anger-crottendorf', 'paunsdorf'], objekttyp: 'plattenbau' },
  { slug: 'paunsdorf', name: 'Paunsdorf', bezirk: 'Ost', preis: 2091, milieuschutz: false, nachbarn: ['sellerhausen-stuenz', 'heiterblick', 'engelsdorf'], objekttyp: 'plattenbau' },
  { slug: 'heiterblick', name: 'Heiterblick', bezirk: 'Ost', preis: 2379, milieuschutz: false, nachbarn: ['paunsdorf', 'thekla', 'moelkau'], objekttyp: 'mischbebauung' },
  { slug: 'moelkau', name: 'Mölkau', bezirk: 'Ost', preis: 2559, milieuschutz: false, nachbarn: ['heiterblick', 'engelsdorf', 'althen-kleinpoesna'], objekttyp: 'mischbebauung' },
  { slug: 'engelsdorf', name: 'Engelsdorf', bezirk: 'Ost', preis: 2283, milieuschutz: false, nachbarn: ['paunsdorf', 'moelkau', 'althen-kleinpoesna'], objekttyp: 'mischbebauung' },
  { slug: 'althen-kleinpoesna', name: 'Althen-Kleinpösna', bezirk: 'Ost', preis: 2053, milieuschutz: false, nachbarn: ['moelkau', 'engelsdorf'], objekttyp: 'mischbebauung' },
  { slug: 'reudnitz-thonberg', name: 'Reudnitz-Thonberg', bezirk: 'Ost', preis: 2381, milieuschutz: true, nachbarn: ['neustadt-neuschoenef', 'anger-crottendorf', 'stoetteritz', 'zentrum-ost'], objekttyp: 'gruenderzeit' },
  { slug: 'stoetteritz', name: 'Stötteritz', bezirk: 'Ost', preis: 2411, milieuschutz: false, nachbarn: ['reudnitz-thonberg', 'probstheida', 'connewitz'], objekttyp: 'gruenderzeit' },
  { slug: 'probstheida', name: 'Probstheida', bezirk: 'Ost', preis: 2561, milieuschutz: false, nachbarn: ['stoetteritz', 'marienbrunn'], objekttyp: 'mischbebauung' },

  // SÜD (5)
  { slug: 'suedvorstadt', name: 'Südvorstadt', bezirk: 'Süd', preis: 2954, milieuschutz: false, nachbarn: ['connewitz', 'schleussig', 'zentrum-sued'], objekttyp: 'gruenderzeit' },
  { slug: 'connewitz', name: 'Connewitz', bezirk: 'Süd', preis: 2669, milieuschutz: true, nachbarn: ['suedvorstadt', 'stoetteritz', 'marienbrunn', 'loessnig', 'kleinzschocher'], objekttyp: 'gruenderzeit' },
  { slug: 'marienbrunn', name: 'Marienbrunn', bezirk: 'Süd', preis: 2743, milieuschutz: false, nachbarn: ['connewitz', 'loessnig', 'probstheida'], objekttyp: 'mischbebauung' },
  { slug: 'loessnig', name: 'Lößnig', bezirk: 'Süd', preis: 2402, milieuschutz: false, nachbarn: ['connewitz', 'marienbrunn', 'doelitz-doesen'], objekttyp: 'plattenbau' },
  { slug: 'doelitz-doesen', name: 'Dölitz-Dösen', bezirk: 'Süd', preis: 2583, milieuschutz: false, nachbarn: ['loessnig', 'marienbrunn'], objekttyp: 'mischbebauung' },

  // WEST (14)
  { slug: 'schleussig', name: 'Schleußig', bezirk: 'West', preis: 3085, milieuschutz: false, nachbarn: ['plagwitz', 'suedvorstadt', 'lindenau'], objekttyp: 'gruenderzeit' },
  { slug: 'plagwitz', name: 'Plagwitz', bezirk: 'West', preis: 2743, milieuschutz: true, nachbarn: ['schleussig', 'lindenau', 'kleinzschocher', 'leutzsch'], objekttyp: 'altbau' },
  { slug: 'kleinzschocher', name: 'Kleinzschocher', bezirk: 'West', preis: 2379, milieuschutz: true, nachbarn: ['plagwitz', 'connewitz', 'grosszschocher', 'knauthain'], objekttyp: 'gruenderzeit' },
  { slug: 'grosszschocher', name: 'Großzschocher', bezirk: 'West', preis: 2263, milieuschutz: false, nachbarn: ['kleinzschocher', 'knauthain', 'schoenau'], objekttyp: 'mischbebauung' },
  { slug: 'knauthain', name: 'Knauthain', bezirk: 'West', preis: 2590, milieuschutz: false, nachbarn: ['grosszschocher', 'kleinzschocher'], objekttyp: 'mischbebauung' },
  { slug: 'schoenau', name: 'Schönau', bezirk: 'West', preis: 2119, milieuschutz: false, nachbarn: ['grosszschocher', 'gruenau-ost', 'lausen-gruenau'], objekttyp: 'plattenbau' },
  { slug: 'gruenau-ost', name: 'Grünau-Ost', bezirk: 'West', preis: 1859, milieuschutz: false, nachbarn: ['schoenau', 'gruenau-mitte', 'gruenau-siedlung'], objekttyp: 'plattenbau' },
  { slug: 'gruenau-nord', name: 'Grünau-Nord', bezirk: 'West', preis: 2156, milieuschutz: false, nachbarn: ['gruenau-mitte', 'lausen-gruenau'], objekttyp: 'plattenbau' },
  { slug: 'gruenau-mitte', name: 'Grünau-Mitte', bezirk: 'West', preis: 2041, milieuschutz: false, nachbarn: ['gruenau-ost', 'gruenau-nord', 'gruenau-siedlung'], objekttyp: 'plattenbau' },
  { slug: 'gruenau-siedlung', name: 'Grünau-Siedlung', bezirk: 'West', preis: 2402, milieuschutz: false, nachbarn: ['gruenau-ost', 'gruenau-mitte'], objekttyp: 'plattenbau' },
  { slug: 'lausen-gruenau', name: 'Lausen-Grünau', bezirk: 'West', preis: 2166, milieuschutz: false, nachbarn: ['schoenau', 'gruenau-nord', 'leutzsch'], objekttyp: 'plattenbau' },
  { slug: 'lindenau', name: 'Lindenau', bezirk: 'West', preis: 2531, milieuschutz: true, nachbarn: ['plagwitz', 'alt-lindenau', 'schleussig', 'leutzsch'], objekttyp: 'gruenderzeit' },
  { slug: 'alt-lindenau', name: 'Alt-Lindenau', bezirk: 'West', preis: 2451, milieuschutz: true, nachbarn: ['lindenau', 'neu-lindenau', 'boehlitz-ehrenberg'], objekttyp: 'gruenderzeit' },
  { slug: 'neu-lindenau', name: 'Neu-Lindenau', bezirk: 'West', preis: 2398, milieuschutz: false, nachbarn: ['alt-lindenau', 'boehlitz-ehrenberg', 'leutzsch'], objekttyp: 'gruenderzeit' },

  // STADTRAND (6)
  { slug: 'leutzsch', name: 'Leutzsch', bezirk: 'Stadtrand', preis: 2474, milieuschutz: true, nachbarn: ['plagwitz', 'lindenau', 'neu-lindenau', 'moeckern'], objekttyp: 'gruenderzeit' },
  { slug: 'boehlitz-ehrenberg', name: 'Böhlitz-Ehrenberg', bezirk: 'Stadtrand', preis: 2406, milieuschutz: false, nachbarn: ['alt-lindenau', 'neu-lindenau', 'burghausen'], objekttyp: 'mischbebauung' },
  { slug: 'burghausen', name: 'Burghausen', bezirk: 'Stadtrand', preis: 2502, milieuschutz: false, nachbarn: ['boehlitz-ehrenberg'], objekttyp: 'mischbebauung' },
  { slug: 'moeckern', name: 'Möckern', bezirk: 'Stadtrand', preis: 2214, milieuschutz: false, nachbarn: ['leutzsch', 'wahren', 'lindenthal'], objekttyp: 'mischbebauung' },
  { slug: 'wahren', name: 'Wahren', bezirk: 'Stadtrand', preis: 2350, milieuschutz: false, nachbarn: ['moeckern', 'gohlis-nord', 'seehausen'], objekttyp: 'mischbebauung' },
  { slug: 'lindenthal', name: 'Lindenthal', bezirk: 'Stadtrand', preis: 2431, milieuschutz: false, nachbarn: ['moeckern', 'wiederitzsch'], objekttyp: 'mischbebauung' },
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
