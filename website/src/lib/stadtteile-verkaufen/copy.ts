export type ObjektTyp = 'altbau' | 'gruenderzeit' | 'plattenbau' | 'mischbebauung';
export type BezirkName = 'Zentrum' | 'Nord' | 'Ost' | 'West' | 'Süd' | 'Stadtrand';

export function getObjektTypText(objekttyp: ObjektTyp, name: string): string {
  const texts: Record<ObjektTyp, string> = {
    altbau: `${name} ist geprägt von Altbauten der Gründerzeit und Jugendstil — oft denkmalgeschützt, mit Stuckdecken und Dielenböden. Diese Substanz ist wertvoll, aber aufwendig: Denkmalschutz-Auflagen, ungeklärte WEG-Beschlusslage oder komplexe Erbengemeinschaften machen den Verkauf auf dem offenen Markt schwierig. Wir kennen diese Objekte und machen Angebote, die den Aufwand fair einpreisen.`,
    gruenderzeit: `${name} ist geprägt von Gründerzeit-Mehrfamilienhäusern der Jahrhundertwende — 3 bis 6 Einheiten, oft in Erbengemeinschaften oder mit GEG-Sanierungspflicht. Solche Objekte sind auf Portalen schwer vermarktbar: Käufer scheuen den Sanierungsaufwand, Eigentümer die Investition. Wir kaufen im Ist-Zustand und begleiten den gesamten Prozess.`,
    plattenbau: `${name} ist geprägt von Plattenbauten der 1960er bis 1980er Jahre — Bestände mit hohem Sanierungsdruck durch das Gebäudeenergiegesetz. Viele Eigentümer stehen vor der Frage: Sanieren oder verkaufen? Bei Einzelwohnungen in großen Anlagen rechnet sich die Investition selten. Wir kaufen im Ist-Zustand — auch bei laufenden WEG-Beschlüssen oder unklarer Sanierungsplanung.`,
    mischbebauung: `${name} hat eine gemischte Bebauung aus verschiedenen Epochen — Gründerzeit-Substanz neben Nachkriegsbauten, Einzel- neben Mehrfamilienhäusern. Diese Heterogenität macht die Bewertung komplex. Wir kennen den lokalen Markt und machen Angebote unabhängig vom Baujahr — auch bei schwieriger Ausgangslage wie Erbschaft, Messie-Objekt oder GEG-Sanierungsstau.`,
  };
  return texts[objekttyp];
}

export function getMilieuschutzText(name: string): string {
  return `${name} liegt im Milieuschutzgebiet nach § 172 Baugesetzbuch. Das bedeutet: Die Stadt Leipzig hat bei bestimmten Transaktionen ein Vorkaufsrecht. In der Praxis wird dieses Recht selten ausgeübt — für Privateigentümer ändert sich am Verkaufsablauf kaum etwas. Wir begleiten Sie durch den gesamten Prozess und koordinieren alle notwendigen Schritte mit der Stadt Leipzig.`;
}

export const MILIEUSCHUTZ_FAQ = [
  {
    question: (name: string) => `Was bedeutet Milieuschutz in ${name} für den Verkauf?`,
    answer: `Das Vorkaufsrecht der Stadt Leipzig greift nur bei bestimmten Käufergruppen und wird in der Praxis selten ausgeübt. Für Privateigentümer, die an uns verkaufen, ändert sich der Ablauf kaum — wir bearbeiten die Vorkaufsrechtsprüfung intern.`,
  },
  {
    question: (_name: string) => `Kann ich meine Immobilie trotz Milieuschutz frei verkaufen?`,
    answer: `Ja. Der § 172 BauGB schränkt Ihren Verkauf nicht ein — er gibt der Stadt lediglich ein Vorkaufsrecht, das sie ausüben kann, aber nicht muss. Bei Verzichtserklärung der Stadt verläuft der Kauf normal.`,
  },
] as const;

export const SZENARIEN = [
  {
    icon: '🏚️',
    titel: 'Erbschaft & Erbengemeinschaft',
    text: 'Das Haus oder die Wohnung gehört mehreren Erben — keiner will es halten, aber alle müssen zustimmen. Die Einigung blockiert sich. Wir lösen den Stillstand mit einem transparenten Angebot, das alle Parteien akzeptieren können.',
  },
  {
    icon: '🔧',
    titel: 'GEG-Sanierungspflicht',
    text: 'Das Gebäudeenergiegesetz verlangt Investitionen, die sich für einzelne Eigentümer nicht rechnen. Wer eine Immobilie nicht dauerhaft halten will, verkauft besser im Ist-Zustand — bevor die Sanierungspflicht den Wert weiter drückt.',
  },
  {
    icon: '📦',
    titel: 'Messie-Objekt & Sondersituation',
    text: 'Kein Aufräumen, keine Fotos für Portale, kein Ghosting durch Makler. Wir besichtigen diskret und machen ein Angebot — unabhängig vom Zustand der Immobilie.',
  },
] as const;
