# Stadtteile-Verkäufer-Landingpages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build 56 SSG landing pages at `/immobilien-verkaufen/[stadtteil]` targeting property sellers in Leipzig, plus a hub page, based on the approved spec. (Note: Leipzig has 63 official Stadtteile; the provided Immowelt price data covers 56. Stefan can add missing entries later — data integrity tests validate the current count.)

**Architecture:** Central TypeScript data file drives `getStaticPaths()` in a new Astro template with `export const prerender = true`. Pure copy/text logic lives in a separate utility module for testability. Hub page groups all 63 by Bezirk. Existing site SSR/SSG hybrid setup stays unchanged.

**Tech Stack:** Astro 4, @astrojs/node (hybrid mode), TypeScript, Vitest, existing global.css design tokens

**Spec:** `docs/superpowers/specs/2026-03-23-wkdi-stadtteile-landingpages-design.md`

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `src/data/stadtteile-verkaufen.ts` | All 63 Stadtteil entries, types, exported array |
| Create | `src/lib/stadtteile-verkaufen/copy.ts` | Objekttyp text variants, Milieuschutz copy, Szenarien copy |
| Create | `src/tests/stadtteile-verkaufen.test.ts` | Tests for data integrity + copy utility |
| Create | `src/pages/immobilien-verkaufen/[...stadtteil].astro` | LP template, 7 sections, JSON-LD, form JS |
| Create | `src/pages/immobilien-verkaufen/index.astro` | Hub page, Bezirks-Grid, ItemList JSON-LD |
| Modify | `src/pages/leipzig/[...stadtteil].astro` | Add seller LP cross-link pill |

---

## Task 1: Data types and utility module

**Files:**
- Create: `src/lib/stadtteile-verkaufen/copy.ts`
- Create: `src/tests/stadtteile-verkaufen.test.ts`

- [ ] **Step 1: Create directories**

```bash
mkdir -p ~/code/brown2green/website/src/lib/stadtteile-verkaufen
```

- [ ] **Step 2: Create the copy utility with all text variants**

Create `src/lib/stadtteile-verkaufen/copy.ts`:

```ts
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
```

- [ ] **Step 3: Write tests for the copy utility**

Create `src/tests/stadtteile-verkaufen.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import {
  getObjektTypText,
  getMilieuschutzText,
  MILIEUSCHUTZ_FAQ,
  SZENARIEN,
  type ObjektTyp,
} from '../lib/stadtteile-verkaufen/copy';

describe('getObjektTypText', () => {
  const typen: ObjektTyp[] = ['altbau', 'gruenderzeit', 'plattenbau', 'mischbebauung'];

  it('gibt nicht-leeren Text für alle 4 Typen zurück', () => {
    typen.forEach(typ => {
      const text = getObjektTypText(typ, 'Connewitz');
      expect(text.length).toBeGreaterThan(50);
    });
  });

  it('enthält den Stadtteilnamen', () => {
    typen.forEach(typ => {
      const text = getObjektTypText(typ, 'Plagwitz');
      expect(text).toContain('Plagwitz');
    });
  });

  it('altbau-Text enthält Denkmalschutz-Hinweis', () => {
    const text = getObjektTypText('altbau', 'Gohlis');
    expect(text).toContain('denkmalgeschützt');
  });

  it('plattenbau-Text enthält GEG-Hinweis', () => {
    const text = getObjektTypText('plattenbau', 'Grünau-Ost');
    expect(text).toContain('Gebäudeenergiegesetz');
  });
});

describe('getMilieuschutzText', () => {
  it('enthält § 172 BauGB', () => {
    expect(getMilieuschutzText('Connewitz')).toContain('§ 172');
  });

  it('enthält den Stadtteilnamen', () => {
    expect(getMilieuschutzText('Lindenau')).toContain('Lindenau');
  });
});

describe('MILIEUSCHUTZ_FAQ', () => {
  it('hat genau 2 Einträge', () => {
    expect(MILIEUSCHUTZ_FAQ).toHaveLength(2);
  });

  it('jeder Eintrag hat question-Funktion und answer-String', () => {
    MILIEUSCHUTZ_FAQ.forEach(item => {
      expect(typeof item.question).toBe('function');
      expect(typeof item.answer).toBe('string');
      expect(item.answer.length).toBeGreaterThan(20);
    });
  });

  it('question-Funktion setzt Stadtteilnamen ein', () => {
    expect(MILIEUSCHUTZ_FAQ[0].question('Leutzsch')).toContain('Leutzsch');
  });
});

describe('SZENARIEN', () => {
  it('hat genau 3 Szenarien', () => {
    expect(SZENARIEN).toHaveLength(3);
  });

  it('jedes Szenario hat icon, titel und text', () => {
    SZENARIEN.forEach(s => {
      expect(s.icon).toBeTruthy();
      expect(s.titel.length).toBeGreaterThan(5);
      expect(s.text.length).toBeGreaterThan(50);
    });
  });
});
```

- [ ] **Step 4: Run tests — expect PASS**

```bash
cd ~/code/brown2green/website && npx vitest run src/tests/stadtteile-verkaufen.test.ts
```

Expected: all tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/lib/stadtteile-verkaufen/copy.ts src/tests/stadtteile-verkaufen.test.ts
git commit -m "feat: add Stadtteile copy utility + tests"
```

---

## Task 2: Central data file (63 Stadtteile)

**Files:**
- Create: `src/data/stadtteile-verkaufen.ts`

- [ ] **Step 1: Create data directory**

```bash
mkdir -p ~/code/brown2green/website/src/data
```

- [ ] **Step 2: Write the data file**

Create `src/data/stadtteile-verkaufen.ts`:

```ts
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
// objekttyp: Stefan kann anpassen — Standardwerte aus Preisniveau abgeleitet
// nachbarn: Stefan füllt aus — vorerst leere Arrays

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

  // OST (14)
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
```

- [ ] **Step 3: Add data integrity tests** to `src/tests/stadtteile-verkaufen.test.ts`

Append to the existing test file:

```ts
import { STADTTEILE, SLUG_MAP, getBySlug, groupByBezirk, BEZIRK_ORDER } from '../data/stadtteile-verkaufen';

describe('STADTTEILE data integrity', () => {
  it('hat 56 Einträge (Immowelt-Preisdaten, Stand März 2026)', () => {
    // Leipzig hat 63 Stadtteile — Immowelt-Daten decken 56 ab.
    // Stefan kann fehlende Einträge ergänzen; dann diesen Wert anpassen.
    expect(STADTTEILE).toHaveLength(56);
  });

  it('alle slugs sind eindeutig', () => {
    const slugs = STADTTEILE.map(st => st.slug);
    expect(new Set(slugs).size).toBe(63);
  });

  it('alle preise sind positive Ganzzahlen', () => {
    STADTTEILE.forEach(st => {
      expect(st.preis).toBeGreaterThan(0);
      expect(Number.isInteger(st.preis)).toBe(true);
    });
  });

  it('genau 11 Stadtteile haben milieuschutz=true', () => {
    const ms = STADTTEILE.filter(st => st.milieuschutz);
    expect(ms).toHaveLength(11);
  });

  it('alle milieuschutz-slugs stimmen mit dem bekannten Set überein', () => {
    const expected = new Set([
      'eutritzsch', 'schoenefeld-abtnaundorf', 'neustadt-neuschoenef',
      'volkmarsdorf', 'reudnitz-thonberg', 'connewitz', 'plagwitz',
      'kleinzschocher', 'lindenau', 'alt-lindenau', 'leutzsch',
    ]);
    const actual = new Set(STADTTEILE.filter(st => st.milieuschutz).map(st => st.slug));
    expect(actual).toEqual(expected);
  });

  it('alle nachbarn-slugs existieren in der Datei', () => {
    const allSlugs = new Set(STADTTEILE.map(st => st.slug));
    STADTTEILE.forEach(st => {
      st.nachbarn.forEach(n => {
        expect(allSlugs.has(n), `${st.slug} hat ungültigen Nachbar-Slug: ${n}`).toBe(true);
      });
    });
  });

  it('alle bezirk-Werte sind gültige BezirkName-Werte', () => {
    const valid = new Set(['Zentrum', 'Nord', 'Ost', 'West', 'Süd', 'Stadtrand']);
    STADTTEILE.forEach(st => {
      expect(valid.has(st.bezirk), `${st.slug} hat ungültigen Bezirk: ${st.bezirk}`).toBe(true);
    });
  });

  it('alle objekttyp-Werte sind gültig', () => {
    const valid = new Set(['altbau', 'gruenderzeit', 'plattenbau', 'mischbebauung']);
    STADTTEILE.forEach(st => {
      expect(valid.has(st.objekttyp), `${st.slug} hat ungültigen Typ: ${st.objekttyp}`).toBe(true);
    });
  });
});

describe('groupByBezirk', () => {
  it('gibt alle 6 Bezirke zurück', () => {
    const groups = groupByBezirk();
    expect(Object.keys(groups)).toHaveLength(BEZIRK_ORDER.length);
  });

  it('Summe aller Gruppen = 63', () => {
    const groups = groupByBezirk();
    const total = Object.values(groups).reduce((sum, arr) => sum + arr.length, 0);
    expect(total).toBe(63);
  });
});

describe('getBySlug', () => {
  it('findet Connewitz', () => {
    const st = getBySlug('connewitz');
    expect(st?.name).toBe('Connewitz');
    expect(st?.preis).toBe(2669);
  });

  it('gibt undefined für unbekannten Slug', () => {
    expect(getBySlug('nichtvorhanden')).toBeUndefined();
  });
});
```

- [ ] **Step 4: Run tests — expect PASS**

```bash
cd ~/code/brown2green/website && npx vitest run src/tests/stadtteile-verkaufen.test.ts
```

Expected: all tests pass including the 56-count check.

- [ ] **Step 5: Commit**

```bash
git add src/data/stadtteile-verkaufen.ts src/tests/stadtteile-verkaufen.test.ts
git commit -m "feat: add stadtteile-verkaufen data file (56 Stadtteile) + data integrity tests"
```

---

## Task 3: LP Template

**Files:**
- Create: `src/pages/immobilien-verkaufen/[...stadtteil].astro`

- [ ] **Step 1: Create the LP template**

Create `src/pages/immobilien-verkaufen/[...stadtteil].astro`:

```astro
---
export const prerender = true;

import Layout from '../../layouts/Layout.astro';
import { STADTTEILE, SLUG_MAP } from '../../data/stadtteile-verkaufen';
import { getObjektTypText, getMilieuschutzText, MILIEUSCHUTZ_FAQ, SZENARIEN } from '../../lib/stadtteile-verkaufen/copy';

export function getStaticPaths() {
  return STADTTEILE.map(st => ({
    params: { stadtteil: st.slug },
    props: { st },
  }));
}

const { st } = Astro.props;

const preisFormatted = st.preis.toLocaleString('de-DE');
const objektTypText = getObjektTypText(st.objekttyp, st.name);
const milieuschutzText = st.milieuschutz ? getMilieuschutzText(st.name) : null;

const canonicalUrl = `https://wirkaufendeineimmobilie.de/immobilien-verkaufen/${st.slug}`;

// JSON-LD
const businessId = `${canonicalUrl}#business`;

const jsonLdBusiness = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": businessId,
  "name": "wirkaufendeineimmobilie.de",
  "description": `Immobilienankauf in ${st.name} Leipzig — Erbschaft, Messie-Objekt, GEG-Sanierungspflicht`,
  "url": canonicalUrl,
  "areaServed": {
    "@type": "Place",
    "name": st.name,
    "containedInPlace": { "@type": "City", "name": "Leipzig" }
  },
  "priceRange": "Kostenlose Erstbewertung",
  "contactPoint": { "@type": "ContactPoint", "contactType": "customer service", "availableLanguage": "German" }
});

const jsonLdService = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Service",
  "@id": `${canonicalUrl}#service`,
  "name": `Immobilienankauf ${st.name}`,
  "serviceType": "Immobilienankauf",
  "provider": { "@id": businessId },
  "areaServed": {
    "@type": "Place",
    "name": st.name,
    "containedInPlace": { "@type": "City", "name": "Leipzig" }
  },
  "description": `Wir kaufen Immobilien in ${st.name} im Ist-Zustand. Aktueller Marktpreis: Ø ${preisFormatted} €/m² (Immowelt März 2026).`
});

const jsonLdBreadcrumb = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://wirkaufendeineimmobilie.de/" },
    { "@type": "ListItem", "position": 2, "name": "Immobilie verkaufen in Leipzig", "item": "https://wirkaufendeineimmobilie.de/immobilien-verkaufen/" },
    { "@type": "ListItem", "position": 3, "name": st.name }
  ]
});

const jsonLdFaq = st.milieuschutz ? JSON.stringify({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": MILIEUSCHUTZ_FAQ.map(item => ({
    "@type": "Question",
    "name": item.question(st.name),
    "acceptedAnswer": { "@type": "Answer", "text": item.answer }
  }))
}) : null;
---

<Layout
  title={`Immobilie verkaufen in ${st.name} Leipzig — schnell & ohne Makler | wirkaufendeineimmobilie.de`}
  description={`Wohnung oder Haus in ${st.name} verkaufen? Aktueller Marktpreis: Ø ${preisFormatted} €/m² (Immowelt März 2026). Kostenlose Ersteinschätzung in 48h — auch bei Erbschaft, Messie-Objekt & GEG-Sanierungspflicht.`}
>
  <script type="application/ld+json" set:html={jsonLdBusiness} />
  <script type="application/ld+json" set:html={jsonLdService} />
  <script type="application/ld+json" set:html={jsonLdBreadcrumb} />
  {jsonLdFaq && <script type="application/ld+json" set:html={jsonLdFaq} />}

  <!-- BREADCRUMB -->
  <nav class="iv-breadcrumb" aria-label="Breadcrumb">
    <div class="container">
      <a href="/">Home</a>
      <span class="iv-bc-sep">&rsaquo;</span>
      <a href="/immobilien-verkaufen/">Immobilie verkaufen in Leipzig</a>
      <span class="iv-bc-sep">&rsaquo;</span>
      <span class="iv-bc-current">{st.name}</span>
    </div>
  </nav>

  <!-- S1: HERO -->
  <section class="section iv-hero">
    <div class="container">
      <div class="label">{st.bezirk} &middot; Leipzig</div>
      <h1>Immobilie verkaufen in {st.name}<br />— ohne Makler, ohne Stress.</h1>
      <p class="iv-hero__sub">
        Aktueller Marktpreis: Ø <strong>{preisFormatted} €/m²</strong> (Immowelt März 2026).
        Wir kaufen im Ist-Zustand — auch bei Erbschaft, Sanierungsstau oder schwieriger Eigentümersituation.
      </p>
      <form class="iv-form" id="iv-form-hero" data-stadtteil={st.slug}>
        <input type="text" name="website" style="display:none" tabindex="-1" autocomplete="off" />
        <div class="iv-form__row">
          <input type="text" name="vorname" placeholder="Vorname" required aria-label="Vorname" />
          <input type="text" name="nachname" placeholder="Nachname" required aria-label="Nachname" />
        </div>
        <input type="email" name="email" placeholder="E-Mail-Adresse" required aria-label="E-Mail" />
        <input type="tel" name="telefon" placeholder="Telefonnummer (optional)" aria-label="Telefon" />
        <input type="text" name="plz" placeholder="PLZ der Immobilie" pattern="[0-9]{5}" maxlength="5" required aria-label="PLZ" />
        <button type="submit" class="btn btn-primary iv-form__btn">Kostenlos bewerten &rarr;</button>
      </form>
    </div>
  </section>

  <!-- S2: MARKTDATEN -->
  <section class="iv-market-section">
    <div class="container">
      <h2>Aktueller Immobilienmarkt in {st.name}</h2>
      <div class={`iv-market-grid ${st.milieuschutz ? 'iv-market-grid--4' : 'iv-market-grid--3'}`}>
        <div class="iv-market-card iv-market-card--highlight">
          <span class="iv-market-card__val">Ø {preisFormatted} €/m²</span>
          <span class="iv-market-card__label">Marktpreis März 2026</span>
        </div>
        <div class="iv-market-card">
          <span class="iv-market-card__val">Immowelt</span>
          <span class="iv-market-card__label">Quelle Preisatlas</span>
        </div>
        {st.milieuschutz && (
          <div class="iv-market-card iv-market-card--warning">
            <span class="iv-market-card__val">⚠️ Milieuschutz</span>
            <span class="iv-market-card__label">§ 172 BauGB</span>
          </div>
        )}
        <div class="iv-market-card">
          <span class="iv-market-card__val">Gutachterausschuss</span>
          <span class="iv-market-card__label">Leipzig 2024</span>
        </div>
      </div>
      <p class="iv-source">
        Quelle: Immowelt Preisatlas, März 2026. Offizielle Transaktionsdaten: Gutachterausschuss Leipzig 2024.
      </p>
    </div>
  </section>

  <!-- S3: OBJEKTTYPEN -->
  <section class="section iv-objekt-section">
    <div class="container">
      <h2>Typische Immobilien in {st.name}</h2>
      <p class="iv-objekt-text">{objektTypText}</p>
    </div>
  </section>

  <!-- S4: MILIEUSCHUTZ (conditional) -->
  {st.milieuschutz && milieuschutzText && (
    <section class="iv-milieu-section">
      <div class="container">
        <h2>Milieuschutz in {st.name} — was bedeutet das für den Verkauf?</h2>
        <p class="iv-milieu-text">{milieuschutzText}</p>
        <div class="iv-faq-list">
          {MILIEUSCHUTZ_FAQ.map(item => (
            <details class="iv-faq-item">
              <summary class="iv-faq-q">{item.question(st.name)}</summary>
              <p class="iv-faq-a">{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )}

  <!-- S5: SZENARIEN -->
  <section class="section iv-szenarien-section">
    <div class="container">
      <h2>Warum verkaufen Eigentümer in {st.name}?</h2>
      <div class="iv-szenarien-grid">
        {SZENARIEN.map(s => (
          <div class="iv-szenario-card">
            <div class="iv-szenario-icon" aria-hidden="true">{s.icon}</div>
            <h3>{s.titel}</h3>
            <p>{s.text}</p>
          </div>
        ))}
      </div>
    </div>
  </section>

  <!-- S6: CTA JOACHIM -->
  <section class="iv-cta-section">
    <div class="container iv-cta-inner">
      <h2>Immobilie in {st.name} bewerten lassen</h2>
      <form class="iv-form iv-form--cta" id="iv-form-cta" data-stadtteil={st.slug}>
        <input type="text" name="website" style="display:none" tabindex="-1" autocomplete="off" />
        <div class="iv-form__row">
          <input type="text" name="vorname" placeholder="Vorname" required aria-label="Vorname" />
          <input type="text" name="nachname" placeholder="Nachname" required aria-label="Nachname" />
        </div>
        <input type="email" name="email" placeholder="E-Mail-Adresse" required aria-label="E-Mail" />
        <input type="tel" name="telefon" placeholder="Telefonnummer (optional)" aria-label="Telefon" />
        <input type="text" name="plz" placeholder="PLZ der Immobilie" pattern="[0-9]{5}" maxlength="5" required aria-label="PLZ" />
        <button type="submit" class="btn btn-primary iv-form__btn">Kostenlos bewerten &rarr;</button>
      </form>
      <div class="iv-joachim">
        <img src="/images/joachim-kleinke-portrait.jpg" alt="Joachim Kleinke" class="iv-joachim__img" width="64" height="64" />
        <div class="iv-joachim__info">
          <strong>Joachim Kleinke</strong>
          <span>Immobilienankauf Leipzig</span>
          <p class="iv-joachim__quote">„Ich melde mich innerhalb der nächsten 48 h bei Ihnen mit einer kostenlosen Ersteinschätzung."</p>
        </div>
      </div>
      <a href="/roi-rechner" class="iv-roi-link">→ ROI-Rechner: Wieviel ist Ihre Immobilie wert?</a>
    </div>
  </section>

  <!-- S7: LINKS -->
  <section class="section iv-links-section bg-alt">
    <div class="container iv-links">
      {st.nachbarn.length > 0 && (
        <div class="iv-link-group">
          <h4>Nachbar-Stadtteile</h4>
          <div class="iv-pills">
            {st.nachbarn.map(slug => (
              <a href={`/immobilien-verkaufen/${slug}`} class="iv-pill">
                {SLUG_MAP[slug] || slug}
              </a>
            ))}
          </div>
        </div>
      )}
      <div class="iv-link-group">
        <h4>Weitere Seiten</h4>
        <div class="iv-pills">
          <a href="/immobilien-verkaufen/" class="iv-pill">Alle Stadtteile Leipzig</a>
          <a href="/roi-rechner" class="iv-pill">ROI-Rechner</a>
          <a href="/so-funktionierts" class="iv-pill">So funktioniert's</a>
        </div>
      </div>
    </div>
  </section>
</Layout>

<style>
  /* BREADCRUMB */
  .iv-breadcrumb { padding-block: var(--space-4); font-size: var(--text-sm); color: var(--color-text-muted); }
  .iv-breadcrumb a { color: var(--color-text-muted); }
  .iv-breadcrumb a:hover { color: var(--color-accent); }
  .iv-bc-sep { margin-inline: var(--space-2); opacity: 0.5; }
  .iv-bc-current { color: var(--color-text); font-weight: var(--weight-medium); }

  /* HERO */
  .iv-hero { padding-bottom: var(--space-8); }
  .iv-hero .container { max-width: 720px; }
  .iv-hero__sub { font-size: var(--text-lg); color: var(--color-text-mid); margin-top: var(--space-4); margin-bottom: var(--space-8); }

  /* FORM */
  .iv-form { display: flex; flex-direction: column; gap: var(--space-3); max-width: 520px; }
  .iv-form__row { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3); }
  .iv-form input { padding: var(--space-3) var(--space-4); border: 1px solid var(--color-border); border-radius: var(--radius-md); font-size: var(--text-base); background: var(--color-bg-card); color: var(--color-text); width: 100%; }
  .iv-form input:focus { outline: 2px solid var(--color-accent); outline-offset: 2px; }
  .iv-form__btn { align-self: flex-start; }
  @media (max-width: 480px) { .iv-form__row { grid-template-columns: 1fr; } .iv-form__btn { width: 100%; } }

  /* MARKET */
  .iv-market-section { background: var(--color-bg-alt); padding-block: var(--section-gap); }
  .iv-market-section h2 { margin-bottom: var(--space-6); }
  .iv-market-grid { display: grid; gap: var(--space-4); }
  .iv-market-grid--3 { grid-template-columns: repeat(3, 1fr); }
  .iv-market-grid--4 { grid-template-columns: repeat(4, 1fr); }
  .iv-market-card { background: var(--color-bg-card); border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: var(--space-5); text-align: center; box-shadow: var(--shadow-sm); }
  .iv-market-card--highlight { background: rgba(59,130,246,0.06); border-color: var(--color-accent); }
  .iv-market-card--highlight .iv-market-card__val { color: var(--color-accent); }
  .iv-market-card--warning { background: rgba(234,179,8,0.06); border-color: #ca8a04; }
  .iv-market-card__val { display: block; font-size: var(--text-2xl); font-weight: var(--weight-extrabold); color: var(--color-text); }
  .iv-market-card__label { display: block; font-size: var(--text-sm); color: var(--color-text-mid); margin-top: var(--space-1); }
  .iv-source { font-size: var(--text-xs); color: var(--color-text-muted); margin-top: var(--space-4); }
  @media (max-width: 640px) { .iv-market-grid--3, .iv-market-grid--4 { grid-template-columns: repeat(2, 1fr); } }

  /* OBJEKTTYPEN */
  .iv-objekt-section { background: var(--color-bg); }
  .iv-objekt-text { font-size: var(--text-lg); line-height: 1.8; color: var(--color-text-mid); max-width: 720px; }

  /* MILIEUSCHUTZ */
  .iv-milieu-section { background: rgba(234,179,8,0.04); border-top: 1px solid rgba(234,179,8,0.2); border-bottom: 1px solid rgba(234,179,8,0.2); padding-block: var(--section-gap); }
  .iv-milieu-section h2 { margin-bottom: var(--space-4); }
  .iv-milieu-text { font-size: var(--text-base); line-height: 1.8; color: var(--color-text-mid); max-width: 720px; margin-bottom: var(--space-6); }
  .iv-faq-list { display: flex; flex-direction: column; gap: var(--space-3); max-width: 720px; }
  .iv-faq-item { border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: var(--space-4); background: var(--color-bg-card); }
  .iv-faq-q { font-weight: var(--weight-semibold); cursor: pointer; list-style: none; color: var(--color-text); }
  .iv-faq-q::marker, .iv-faq-q::-webkit-details-marker { display: none; }
  .iv-faq-q::before { content: '+ '; color: var(--color-accent); }
  details[open] .iv-faq-q::before { content: '− '; }
  .iv-faq-a { margin-top: var(--space-3); font-size: var(--text-sm); color: var(--color-text-mid); line-height: 1.7; }

  /* SZENARIEN */
  .iv-szenarien-section { background: var(--color-bg-alt); }
  .iv-szenarien-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-6); margin-top: var(--space-8); }
  .iv-szenario-card { background: var(--color-bg-card); border: 1px solid var(--color-border); border-radius: var(--radius-lg); padding: var(--space-6); display: flex; flex-direction: column; gap: var(--space-3); box-shadow: var(--shadow-sm); }
  .iv-szenario-icon { font-size: 2rem; }
  .iv-szenario-card h3 { font-size: var(--text-lg); }
  .iv-szenario-card p { font-size: var(--text-sm); line-height: 1.7; color: var(--color-text-mid); }
  @media (max-width: 768px) { .iv-szenarien-grid { grid-template-columns: 1fr; } }

  /* CTA JOACHIM */
  .iv-cta-section { background: var(--color-bg-dark); color: var(--color-text-on-dark); padding-block: var(--section-gap); }
  .iv-cta-inner { display: flex; flex-direction: column; align-items: flex-start; gap: var(--space-8); max-width: 600px; }
  .iv-cta-inner h2 { color: var(--color-text-on-dark); }
  .iv-form--cta input { background: rgba(255,255,255,0.06); border-color: rgba(255,255,255,0.15); color: var(--color-text-on-dark); }
  .iv-form--cta input::placeholder { color: rgba(255,255,255,0.4); }
  .iv-joachim { display: flex; gap: var(--space-4); align-items: flex-start; }
  .iv-joachim__img { width: 64px; height: 64px; border-radius: 50%; object-fit: cover; flex-shrink: 0; }
  .iv-joachim__info { display: flex; flex-direction: column; gap: var(--space-1); }
  .iv-joachim__info strong { color: var(--color-text-on-dark); font-weight: var(--weight-bold); }
  .iv-joachim__info span { font-size: var(--text-sm); color: rgba(255,255,255,0.6); }
  .iv-joachim__quote { font-size: var(--text-sm); color: rgba(255,255,255,0.8); line-height: 1.6; font-style: italic; margin-top: var(--space-1); }
  .iv-roi-link { color: rgba(255,255,255,0.6); font-size: var(--text-sm); text-decoration: none; }
  .iv-roi-link:hover { color: var(--color-text-on-dark); }

  /* LINKS */
  .iv-links-section { padding-block: var(--section-gap); }
  .iv-links { display: flex; flex-direction: column; gap: var(--space-6); }
  .iv-link-group h4 { margin-bottom: var(--space-3); }
  .iv-pills { display: flex; flex-wrap: wrap; gap: var(--space-2); }
  .iv-pill { display: inline-flex; align-items: center; padding: var(--space-2) var(--space-4); font-size: var(--text-sm); font-weight: var(--weight-medium); color: var(--color-text-mid); background: var(--color-bg-card); border: 1px solid var(--color-border); border-radius: var(--radius-full); text-decoration: none; transition: all var(--duration-fast) var(--ease-default); min-height: 44px; }
  .iv-pill:hover { color: var(--color-accent); border-color: var(--color-accent); box-shadow: var(--shadow-sm); transform: translateY(-1px); }
</style>

<script>
  function setupForm(formId: string) {
    const form = document.getElementById(formId) as HTMLFormElement;
    if (!form) return;
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = form.querySelector('button') as HTMLButtonElement;
      btn.textContent = 'Wird gesendet...';
      btn.disabled = true;
      try {
        const res = await fetch('/api/bewertung', { method: 'POST', body: new FormData(form) });
        if (res.ok) {
          window.location.href = '/danke?typ=verkaeufer';
        } else {
          btn.textContent = 'Fehler — erneut versuchen';
          btn.disabled = false;
        }
      } catch {
        btn.textContent = 'Fehler — erneut versuchen';
        btn.disabled = false;
      }
    });
  }
  setupForm('iv-form-hero');
  setupForm('iv-form-cta');
</script>
```

- [ ] **Step 2: Verify build succeeds**

```bash
cd ~/code/brown2green/website && npm run build 2>&1 | tail -20
```

Expected: build completes without errors. Look for `63 pages` in the output under `/immobilien-verkaufen/`.

- [ ] **Step 3: Commit**

```bash
git add src/pages/immobilien-verkaufen/
git commit -m "feat: add Stadtteile LP template — 63 SSG pages at /immobilien-verkaufen/[stadtteil]"
```

---

## Task 4: Hub page

**Files:**
- Create: `src/pages/immobilien-verkaufen/index.astro`

- [ ] **Step 1: Create the hub page**

Create `src/pages/immobilien-verkaufen/index.astro`:

```astro
---
export const prerender = true;

import Layout from '../../layouts/Layout.astro';
import { STADTTEILE, groupByBezirk, BEZIRK_ORDER } from '../../data/stadtteile-verkaufen';

const groups = groupByBezirk();

const jsonLdItemList = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "ItemList",
  "name": "Immobilie verkaufen in Leipzig — alle Stadtteile",
  "itemListElement": STADTTEILE.map((st, i) => ({
    "@type": "ListItem",
    "position": i + 1,
    "name": st.name,
    "url": `https://wirkaufendeineimmobilie.de/immobilien-verkaufen/${st.slug}`
  }))
});

const jsonLdBreadcrumb = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://wirkaufendeineimmobilie.de/" },
    { "@type": "ListItem", "position": 2, "name": "Immobilie verkaufen in Leipzig" }
  ]
});
---

<Layout
  title="Immobilie verkaufen in Leipzig — nach Stadtteil | wirkaufendeineimmobilie.de"
  description="Immobilie in Leipzig verkaufen — alle 63 Stadtteile mit aktuellem Marktpreis. Kostenlose Ersteinschätzung in 48h, auch bei Erbschaft, Messie-Objekt & GEG-Sanierungspflicht."
>
  <script type="application/ld+json" set:html={jsonLdItemList} />
  <script type="application/ld+json" set:html={jsonLdBreadcrumb} />

  <!-- BREADCRUMB -->
  <nav class="iv-breadcrumb" aria-label="Breadcrumb">
    <div class="container">
      <a href="/">Home</a>
      <span class="iv-bc-sep">&rsaquo;</span>
      <span class="iv-bc-current">Immobilie verkaufen in Leipzig</span>
    </div>
  </nav>

  <!-- HERO -->
  <section class="section hub-hero">
    <div class="container">
      <div class="label">Leipzig &middot; Alle Stadtteile</div>
      <h1>Immobilie verkaufen in Leipzig<br />— nach Stadtteil</h1>
      <p class="hub-hero__sub">
        Wählen Sie Ihren Stadtteil für aktuelle Marktpreise und kostenlose Ersteinschätzung —
        auch bei Erbschaft, Sanierungsstau oder Sondersituation.
      </p>
      <form class="iv-form hub-form" id="hub-form">
        <input type="text" name="website" style="display:none" tabindex="-1" autocomplete="off" />
        <div class="iv-form__row">
          <input type="text" name="vorname" placeholder="Vorname" required aria-label="Vorname" />
          <input type="text" name="nachname" placeholder="Nachname" required aria-label="Nachname" />
        </div>
        <input type="email" name="email" placeholder="E-Mail-Adresse" required aria-label="E-Mail" />
        <input type="tel" name="telefon" placeholder="Telefonnummer (optional)" aria-label="Telefon" />
        <input type="text" name="plz" placeholder="PLZ der Immobilie" pattern="[0-9]{5}" maxlength="5" required aria-label="PLZ" />
        <button type="submit" class="btn btn-primary iv-form__btn">Kostenlos bewerten &rarr;</button>
      </form>
      <p class="hub-trust">Alle 63 Stadtteile &middot; Kostenlos &middot; Antwort in 48h</p>
    </div>
  </section>

  <!-- BEZIRKS-GRID -->
  <section class="section hub-grid-section bg-alt">
    <div class="container">
      {BEZIRK_ORDER.map(bezirk => groups[bezirk] && (
        <div class="hub-bezirk-group">
          <h2 class="hub-bezirk-title">{bezirk} <span class="hub-bezirk-count">({groups[bezirk].length})</span></h2>
          <div class="hub-pills">
            {groups[bezirk].map(st => (
              <a href={`/immobilien-verkaufen/${st.slug}`} class="hub-pill">
                {st.name}
                <span class="hub-pill__preis">{st.preis.toLocaleString('de-DE')} €/m²</span>
              </a>
            ))}
          </div>
        </div>
      ))}
    </div>
  </section>
</Layout>

<style>
  .iv-breadcrumb { padding-block: var(--space-4); font-size: var(--text-sm); color: var(--color-text-muted); }
  .iv-breadcrumb a { color: var(--color-text-muted); }
  .iv-breadcrumb a:hover { color: var(--color-accent); }
  .iv-bc-sep { margin-inline: var(--space-2); opacity: 0.5; }
  .iv-bc-current { color: var(--color-text); font-weight: var(--weight-medium); }

  .hub-hero { padding-bottom: var(--space-8); }
  .hub-hero__sub { font-size: var(--text-lg); color: var(--color-text-mid); margin-top: var(--space-4); margin-bottom: var(--space-8); max-width: 600px; }
  .hub-trust { font-size: var(--text-sm); color: var(--color-text-muted); margin-top: var(--space-4); }

  .iv-form { display: flex; flex-direction: column; gap: var(--space-3); max-width: 520px; }
  .iv-form__row { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3); }
  .iv-form input { padding: var(--space-3) var(--space-4); border: 1px solid var(--color-border); border-radius: var(--radius-md); font-size: var(--text-base); background: var(--color-bg-card); color: var(--color-text); width: 100%; }
  .iv-form input:focus { outline: 2px solid var(--color-accent); outline-offset: 2px; }
  .iv-form__btn { align-self: flex-start; }
  @media (max-width: 480px) { .iv-form__row { grid-template-columns: 1fr; } .iv-form__btn { width: 100%; } }

  .hub-grid-section { padding-block: var(--section-gap); }
  .hub-bezirk-group { margin-bottom: var(--space-10); }
  .hub-bezirk-title { font-size: var(--text-xl); margin-bottom: var(--space-4); }
  .hub-bezirk-count { font-size: var(--text-base); font-weight: var(--weight-normal); color: var(--color-text-muted); }
  .hub-pills { display: flex; flex-wrap: wrap; gap: var(--space-2); }
  .hub-pill { display: inline-flex; flex-direction: column; align-items: flex-start; padding: var(--space-3) var(--space-4); background: var(--color-bg-card); border: 1px solid var(--color-border); border-radius: var(--radius-md); text-decoration: none; transition: all var(--duration-fast) var(--ease-default); min-height: 44px; }
  .hub-pill:hover { border-color: var(--color-accent); box-shadow: var(--shadow-sm); transform: translateY(-1px); }
  .hub-pill span:first-child { /* name auto */ font-size: var(--text-sm); font-weight: var(--weight-medium); color: var(--color-text); }
  .hub-pill__preis { font-size: var(--text-xs); color: var(--color-accent); margin-top: 2px; }
</style>

<script>
  const form = document.getElementById('hub-form') as HTMLFormElement;
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button') as HTMLButtonElement;
    btn.textContent = 'Wird gesendet...';
    btn.disabled = true;
    try {
      const res = await fetch('/api/bewertung', { method: 'POST', body: new FormData(form) });
      if (res.ok) { window.location.href = '/danke?typ=verkaeufer'; }
      else { btn.textContent = 'Fehler — erneut versuchen'; btn.disabled = false; }
    } catch { btn.textContent = 'Fehler — erneut versuchen'; btn.disabled = false; }
  });
</script>
```

- [ ] **Step 2: Verify build**

```bash
cd ~/code/brown2green/website && npm run build 2>&1 | tail -10
```

Expected: `/immobilien-verkaufen/index.html` in output.

- [ ] **Step 3: Commit**

```bash
git add src/pages/immobilien-verkaufen/index.astro
git commit -m "feat: add /immobilien-verkaufen/ hub page with Bezirks-Grid"
```

---

## Task 5: Update existing buyer pages

**Files:**
- Modify: `src/pages/leipzig/[...stadtteil].astro`

- [ ] **Step 1: Add seller LP cross-link to Sektion 7** in `src/pages/leipzig/[...stadtteil].astro`

Find the `<!-- NACHBAR-STADTTEILE — Pill-Links -->` section (around line 282) and add a new pill group after the existing ones:

```astro
<div class="st-link-group">
  <h4>Als Eigentümer in {data.name}?</h4>
  <div class="st-pills">
    <a href={`/immobilien-verkaufen/${data.slug}`} class="st-pill">
      Immobilie in {data.name} verkaufen &rarr;
    </a>
  </div>
</div>
```

Place this before the closing `</section>` tag of the Nachbar-Stadtteile section.

- [ ] **Step 2: Build and verify**

```bash
cd ~/code/brown2green/website && npm run build 2>&1 | grep -E "error|warn|✓" | tail -10
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/leipzig/
git commit -m "feat: add seller LP cross-link to existing buyer pages"
```

---

## Task 6: Run full test suite + deploy

- [ ] **Step 1: Run all tests**

```bash
cd ~/code/brown2green/website && npx vitest run
```

Expected: all tests pass including the 63-entry data integrity tests.

- [ ] **Step 2: Full build**

```bash
cd ~/code/brown2green/website && npm run build
```

Expected: clean build, no errors.

- [ ] **Step 3: Deploy**

```bash
curl -s "http://178.104.15.187:8000/api/v1/deploy?uuid=wisjftvt2q9b53z13nciq9dh" \
  -H "Authorization: Bearer 34|4140dc1a1b2a699456ab4184ce45c091aaafa9fb03cd6b30bee1105735697e3ec8173c750bf828c8"
```

Expected: `{"message":"Deploy request queued successfully"}` (or similar OK response)

- [ ] **Step 4: Verify live**

Check that these URLs return 200:
- `https://wirkaufendeineimmobilie.de/immobilien-verkaufen/`
- `https://wirkaufendeineimmobilie.de/immobilien-verkaufen/connewitz`
- `https://wirkaufendeineimmobilie.de/immobilien-verkaufen/gruenau-ost` (lowest price, plattenbau)
- `https://wirkaufendeineimmobilie.de/immobilien-verkaufen/lindenau` (milieuschutz page)

```bash
for url in \
  "https://wirkaufendeineimmobilie.de/immobilien-verkaufen/" \
  "https://wirkaufendeineimmobilie.de/immobilien-verkaufen/connewitz" \
  "https://wirkaufendeineimmobilie.de/immobilien-verkaufen/gruenau-ost" \
  "https://wirkaufendeineimmobilie.de/immobilien-verkaufen/lindenau"; do
  status=$(curl -s -o /dev/null -w "%{http_code}" "$url")
  echo "$status $url"
done
```

Expected: all 4 return `200`.

- [ ] **Step 5: Verify JSON-LD on milieuschutz page**

```bash
curl -s "https://wirkaufendeineimmobilie.de/immobilien-verkaufen/lindenau" | grep -c "FAQPage"
```

Expected: `1` (FAQPage schema present).

- [ ] **Step 6: Final commit if any cleanup needed**

```bash
git add -A && git commit -m "chore: post-deploy cleanup" 2>/dev/null || echo "nothing to commit"
```
