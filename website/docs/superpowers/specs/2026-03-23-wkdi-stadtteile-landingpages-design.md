# Design: WKDI Stadtteile-Landingpages (63 LPs)

**Projekt:** wirkaufendeineimmobilie.de
**Datum:** 2026-03-23
**Stack:** Astro SSG, @astrojs/node, Hetzner/Coolify
**Branch:** feat/website-build

---

## Überblick

63 SEO-Landingpages — eine pro Leipziger Stadtteil — targeting Eigentümer die schnell und ohne Makler verkaufen wollen.

**URL-Schema:** `/immobilien-verkaufen/[stadtteil]`
**Hub-Seite:** `/immobilien-verkaufen/`
**Technischer Ansatz:** Astro SSG mit `getStaticPaths()` + `export const prerender = true` aus zentraler Datendatei. Rest der Site bleibt SSR.

---

## Datendatei

**Pfad:** `src/data/stadtteile-verkaufen.ts`

```ts
export interface StadtteilVerkaufen {
  slug: string;
  name: string;        // Display-Name: "Zentrum-West"
  bezirk: string;      // "Zentrum" | "Nord" | "Ost" | "West" | "Süd" | "Stadtrand"
  preis: number;       // €/m² aus Immowelt Preisatlas März 2026
  milieuschutz: boolean;
  nachbarn: string[];  // slugs, für interne Nachbar-Pills
  objekttyp: 'altbau' | 'gruenderzeit' | 'plattenbau' | 'mischbebauung';
}
```

**Preisdaten (63 Stadtteile):**
```ts
// Quelle: Immowelt Preisatlas, März 2026
const PREISE: Record<string, number> = {
  'zentrum': 3333, 'zentrum-west': 3346, 'zentrum-nordwest': 3184,
  'zentrum-sued': 3110, 'zentrum-nord': 2972, 'zentrum-ost': 2938,
  'zentrum-suedost': 2926,
  'gohlis-sued': 2682, 'gohlis-mitte': 2543, 'gohlis-nord': 2798,
  'eutritzsch': 2481, 'seehausen': 2672, 'wiederitzsch': 2663,
  'schoenefeld-abtnaundorf': 2104, 'schoenefeld-ost': 2649,
  'mockau-sued': 2232, 'mockau-nord': 2125, 'thekla': 2543,
  'plaussig-portitz': 2785,
  'neustadt-neuschoenef': 2486, 'volkmarsdorf': 2267,
  'anger-crottendorf': 2147, 'sellerhausen-stuenz': 2226,
  'paunsdorf': 2091, 'heiterblick': 2379, 'moelkau': 2559,
  'engelsdorf': 2283, 'althen-kleinpoesna': 2053,
  'reudnitz-thonberg': 2381, 'stoetteritz': 2411, 'probstheida': 2561,
  'suedvorstadt': 2954, 'connewitz': 2669, 'marienbrunn': 2743,
  'loessnig': 2402, 'doelitz-doesen': 2583,
  'schleussig': 3085, 'plagwitz': 2743, 'kleinzschocher': 2379,
  'grosszschocher': 2263, 'knauthain': 2590,
  'schoenau': 2119, 'gruenau-ost': 1859, 'gruenau-nord': 2156,
  'gruenau-mitte': 2041, 'gruenau-siedlung': 2402, 'lausen-gruenau': 2166,
  'lindenau': 2531, 'alt-lindenau': 2451, 'neu-lindenau': 2398,
  'leutzsch': 2474, 'boehlitz-ehrenberg': 2406, 'burghausen': 2502,
  'moeckern': 2214, 'wahren': 2350, 'lindenthal': 2431,
};

const MILIEUSCHUTZ = new Set([
  'eutritzsch', 'schoenefeld-abtnaundorf', 'neustadt-neuschoenef',
  'volkmarsdorf', 'reudnitz-thonberg', 'connewitz', 'plagwitz',
  'kleinzschocher', 'lindenau', 'alt-lindenau', 'leutzsch',
]);
```

**Felder die Stefan befüllt:** `name`, `bezirk`, `nachbarn`, `objekttyp` pro Eintrag — einmalig, kein CMS nötig.

---

## Seitenstruktur (Option 2 — 7 Sektionen)

### Meta
```
title: Immobilie verkaufen in [Name] Leipzig — schnell & ohne Makler | wirkaufendeineimmobilie.de
description: Wohnung oder Haus in [Name] verkaufen? Aktueller Marktpreis: Ø [Preis] €/m² (Immowelt März 2026).
             Kostenlose Ersteinschätzung in 48h — auch bei Erbschaft, Messie-Objekt & GEG-Sanierungspflicht.
```

### Sektion 1 — Hero
- Breadcrumb: Home › Immobilie verkaufen in Leipzig › [Name]
- Label: [Bezirk] · Leipzig
- **H1:** `Immobilie verkaufen in [Name] — ohne Makler, ohne Stress.`
- Sub: Aktueller Marktpreis + Situation-Hinweise (Erbschaft, Sanierungsstau)
- PLZ-Formular → `/api/bewertung` → `/danke?typ=verkaeufer`

*Unique durch: Stadtteilname, Preis, Bezirk-Label*

### Sektion 2 — Marktdaten
- **H2:** `Aktueller Immobilienmarkt in [Name]`
- 4 Cards: `Ø [Preis] €/m²` | `Marktpreis März 2026` | `⚠️ Milieuschutz` (nur bei 11 Stadtteilen) | `Gutachterausschuss Leipzig 2024`
- Datenzitation: `Quelle: Immowelt Preisatlas, März 2026. Offizielle Transaktionsdaten: Gutachterausschuss Leipzig 2024.`

*Unique durch: Preis, Milieuschutz-Card (conditional)*

### Sektion 3 — Objekttypen-Block (4 Varianten)
- **H2:** `Typische Immobilien in [Name]`
- Text gesteuert durch `objekttyp`-Flag:
  - `altbau`: Denkmalgeschützte Substanz, WEG-Komplexe, Premium-Lage
  - `gruenderzeit`: Mehrfamilienhäuser Jh.wende, Erbengemeinschaften, GEG-Pflicht
  - `plattenbau`: Stadtrand, hohe GEG-Last, typische Vermieter-Exits
  - `mischbebauung`: Gemischte Epoche, heterogene Eigentümerstruktur

*Unique durch: `objekttyp` (4 Varianten × Stadtteilname)*

### Sektion 4 — Milieuschutz *(nur 11 Stadtteile)*
- **H2:** `Milieuschutz in [Name] — was bedeutet das für den Verkauf?`
- Erklärung § 172 BauGB, städtisches Vorkaufsrecht, Entwarnung für Eigentümer
- 2 FAQ-Items (triggern FAQ Rich Snippets):
  1. "Was bedeutet Milieuschutz in [Name] für den Verkauf?"
  2. "Kann ich meine Immobilie trotz Milieuschutz frei verkaufen?"

*Conditional: nur wenn `milieuschutz === true`*

### Sektion 5 — Szenarien
- **H2:** `Warum verkaufen Eigentümer in [Name]?`
- 3 Cards (vollständig templated, Stadtteilname eingesetzt):
  - 🏚️ Erbschaft & Erbengemeinschaft
  - 🔧 GEG-Sanierungspflicht (Gebäudeenergiegesetz)
  - 📦 Messie-Objekt / Sondersituation

*Vollständig templated — Long-tail Coverage für Erbschaft/Messie/GEG-Queries*

### Sektion 6 — CTA Joachim (dark background)
- **H2:** `Immobilie in [Name] bewerten lassen`
- PLZ-Formular (identisch Sektion 1)
- Joachim-Block:
  - Foto + Name "Joachim Kleinke"
  - Subtitle "Immobilienankauf Leipzig"
  - Quote: "Ich melde mich innerhalb der nächsten 48 h bei Ihnen mit einer kostenlosen Ersteinschätzung."
- Cross-Link: `→ ROI-Rechner: Wieviel ist Ihre Immobilie wert?`

### Sektion 7 — Links (bg-alt)
- Nachbar-Stadtteile als Pills (aus `nachbarn[]`)
- Weitere Pills: "Alle Stadtteile Leipzig" → `/immobilien-verkaufen/` | "ROI-Rechner" | "So funktioniert's"

---

## JSON-LD Schema (3 Blöcke + conditional FAQ)

### Block 1 — LocalBusiness
```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "wirkaufendeineimmobilie.de",
  "description": "Immobilienankauf in [Name] Leipzig — Erbschaft, Messie-Objekt, GEG-Sanierungspflicht",
  "url": "https://wirkaufendeineimmobilie.de/immobilien-verkaufen/[slug]",
  "areaServed": {
    "@type": "Place",
    "name": "[Name]",
    "containedInPlace": { "@type": "City", "name": "Leipzig" }
  },
  "priceRange": "Kostenlose Erstbewertung",
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "customer service",
    "availableLanguage": "German"
  }
}
```

### Block 2 — Service
```json
{
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "Immobilienankauf [Name]",
  "serviceType": "Immobilienankauf",
  "provider": { "@type": "LocalBusiness", "name": "wirkaufendeineimmobilie.de" },
  "areaServed": { "@type": "Place", "name": "[Name], Leipzig" },
  "description": "Wir kaufen Immobilien in [Name] im Ist-Zustand. Aktueller Marktpreis: Ø [Preis] €/m² (Immowelt März 2026)."
}
```

### Block 3 — BreadcrumbList
```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://wirkaufendeineimmobilie.de/" },
    { "@type": "ListItem", "position": 2, "name": "Immobilie verkaufen in Leipzig", "item": "https://wirkaufendeineimmobilie.de/immobilien-verkaufen/" },
    { "@type": "ListItem", "position": 3, "name": "[Name]" }
  ]
}
```

### Block 4 — FAQPage *(nur Milieuschutz-Stadtteile)*
Triggert Rich Snippets für Milieuschutz-Queries. 2 Fragen zu § 172 BauGB und Verkaufsfreiheit.

---

## Interne Verlinkungsstrategie

### Ebene 1 — Hub → alle 63 LPs
`/immobilien-verkaufen/` verlinkt auf alle 63 Seiten, gruppiert nach Bezirk.
Hub wird von Homepage-Nav/Footer + bestehenden Seiten verlinkt.

### Ebene 2 — LP → Nachbar-LPs
Pills am Ende jeder LP verlinken auf `nachbarn[]` (3–5 direkte Nachbarstadtteile).
Effekt: Google erkennt geografische Cluster → thematische Autorität pro Region.

### Ebene 3 — LP → Funktionsseiten
Jede LP verlinkt auf:
- `/roi-rechner` (CTA-Block, verpflichtend)
- `/so-funktionierts`
- `/immobilien-verkaufen/` (Hub-Rückverlinkung)

### Ebene 4 — Bestehende `/leipzig/[stadtteil]` → neue LPs
Die 5 existierenden Investor-Pages erhalten je einen Hinweis-Link:
`"Sie sind Eigentümer in [Name]? → Immobilie verkaufen in [Name]"`
Richtung: nur `/leipzig/X` → `/immobilien-verkaufen/X`, nicht umgekehrt.

### Ebene 5 — Homepage → Hub
Homepage-Nav oder Footer → `/immobilien-verkaufen/` als Haupt-Einstieg.

---

## Hub-Seite `/immobilien-verkaufen/`

```
H1: Immobilie verkaufen in Leipzig — nach Stadtteil

[PLZ-Form — direkter Einstieg]

Bezirks-Grid:
  Zentrum (7)    Nord (8)      Ost (14)
  West (12)      Süd (11)      Stadtrand (11)

[Trust-Zeile: Alle 63 Stadtteile · Kostenlos · 48h Ersteinschätzung]
```

**JSON-LD Hub:** ItemList mit allen 63 Stadtteilen als ListItem → stärkt Sitelinks-Potential.

---

## Dateipfade (neu)

```
src/data/stadtteile-verkaufen.ts        ← zentrale Datendatei (63 Einträge)
src/pages/immobilien-verkaufen/
  index.astro                           ← Hub-Seite
  [...stadtteil].astro                  ← Template mit prerender = true
```

---

## Out of Scope

- Kein CMS, keine Datenbank, kein Login
- Keine Pain-Abfrage auf Hub-Seite (separate Initiative)
- Keine Telefonnummer in CTA (Phase 2, wenn personalized marketing optimiert)
- Keine automatische Nachbarn-Ableitung — Stefan befüllt `nachbarn[]` manuell
