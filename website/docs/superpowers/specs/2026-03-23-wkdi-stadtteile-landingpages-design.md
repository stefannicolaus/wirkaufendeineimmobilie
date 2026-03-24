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
**Technischer Ansatz:** Astro SSG mit `getStaticPaths()` + `export const prerender = true` auf LP-Template und Hub. Rest der Site bleibt SSR.

**WICHTIG:** `/danke.astro` und `/api/bewertung.ts` behalten `export const prerender = false` — diese müssen SSR bleiben.

---

## Datendatei

**Pfad:** `src/data/stadtteile-verkaufen.ts`

```ts
export interface StadtteilVerkaufen {
  slug: string;
  name: string;          // Display-Name: "Zentrum-West" (Großschreibung)
  bezirk: BezirkName;    // Enum — exakt einer der 6 kanonischen Werte (siehe unten)
  preis: number;         // €/m² aus Immowelt Preisatlas März 2026 (ganzzahlig)
  milieuschutz: boolean;
  nachbarn: string[];    // Slugs anderer Stadtteile aus DERSELBEN Datei
  objekttyp: 'altbau' | 'gruenderzeit' | 'plattenbau' | 'mischbebauung';
}

export type BezirkName = 'Zentrum' | 'Nord' | 'Ost' | 'West' | 'Süd' | 'Stadtrand';
```

**Kanonische Bezirk-Werte** (exakt so im Daten-Array verwenden):

| Bezirk | Stadtteile (Slugs) | Anzahl |
|--------|-------------------|--------|
| `Zentrum` | zentrum, zentrum-west, zentrum-nordwest, zentrum-sued, zentrum-nord, zentrum-ost, zentrum-suedost | 7 |
| `Nord` | gohlis-sued, gohlis-mitte, gohlis-nord, eutritzsch, seehausen, wiederitzsch, schoenefeld-abtnaundorf, schoenefeld-ost | 8 |
| `Ost` | mockau-sued, mockau-nord, thekla, plaussig-portitz, neustadt-neuschoenef, volkmarsdorf, anger-crottendorf, sellerhausen-stuenz, paunsdorf, heiterblick, moelkau, engelsdorf, althen-kleinpoesna, reudnitz-thonberg, stoetteritz, probstheida | 14 (16 inc. Über-/Unterebene — Stefan zuordnen) |
| `West` | schleussig, plagwitz, kleinzschocher, grosszschocher, knauthain, schoenau, gruenau-ost, gruenau-nord, gruenau-mitte, gruenau-siedlung, lausen-gruenau, lindenau, alt-lindenau, neu-lindenau | 14 |
| `Süd` | suedvorstadt, connewitz, marienbrunn, loessnig, doelitz-doesen | 5 |
| `Stadtrand` | leutzsch, boehlitz-ehrenberg, burghausen, moeckern, wahren, lindenthal | 6 |

> **Anmerkung:** Die genaue Zuordnung für Ost/Nord-Grenzfälle entscheidet Stefan beim Befüllen der Datendatei. Das `BezirkName`-Typ-Enum verhindert Tippfehler-Varianten.

**Preisdaten (63 Stadtteile):**
```ts
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

const MILIEUSCHUTZ_SLUGS = new Set([
  'eutritzsch', 'schoenefeld-abtnaundorf', 'neustadt-neuschoenef',
  'volkmarsdorf', 'reudnitz-thonberg', 'connewitz', 'plagwitz',
  'kleinzschocher', 'lindenau', 'alt-lindenau', 'leutzsch',
]);
```

**Felder die Stefan manuell befüllt:** `name`, `bezirk`, `nachbarn`, `objekttyp` pro Eintrag.

**Preis-Display:** `preis.toLocaleString('de-DE')` + ` €/m²` — immer als Ø-Wert auszeichnen.

---

## Kontaktformular

**WICHTIG:** Kein reines PLZ-Formular. Die bestehende `/api/bewertung` benötigt:
`email`, `vorname`, `nachname`, `telefon`, `plz` (+ honeypot `website`).

**Flow:** Client-side JS (kein Server-Redirect):
```js
const res = await fetch('/api/bewertung', { method: 'POST', body: formData });
if (res.ok) {
  window.location.href = '/danke?typ=verkaeufer';
}
```
Die API gibt JSON zurück (`{ success: true, id }`), NICHT einen HTTP-Redirect. Der Client navigiert manuell.
Dieses Pattern ist identisch mit `/src/pages/leipzig/[...stadtteil].astro` (Zeilen 780–782) — dort kopieren.

**HINWEIS:** Die Homepage-Form geht nach `/unterlagen` (anderer Flow). Die LP-Forms gehen nach `/danke?typ=verkaeufer`. Bewusste Abweichung — nicht angleichen.

---

## Seitenstruktur (7 Sektionen)

### Meta
```
title: Immobilie verkaufen in [Name] Leipzig — schnell & ohne Makler | wirkaufendeineimmobilie.de
description: Wohnung oder Haus in [Name] verkaufen? Aktueller Marktpreis: Ø [Preis] €/m² (Immowelt März 2026).
             Kostenlose Ersteinschätzung in 48h — auch bei Erbschaft, Messie-Objekt & GEG-Sanierungspflicht.
canonical: https://wirkaufendeineimmobilie.de/immobilien-verkaufen/[slug]
```

---

### Sektion 1 — Hero

```
[Breadcrumb] Home › Immobilie verkaufen in Leipzig › [Name]

LABEL: [Bezirk] · Leipzig

H1: Immobilie verkaufen in [Name] — ohne Makler, ohne Stress.

SUB: Aktueller Marktpreis: Ø [Preis] €/m² (Immowelt März 2026).
     Wir kaufen im Ist-Zustand — auch bei Erbschaft,
     Sanierungsstau oder schwieriger Eigentümersituation.

[Kontaktformular]
```

*Unique durch: Stadtteilname, Preis, Bezirk-Label*

---

### Sektion 2 — Marktdaten

```
H2: Aktueller Immobilienmarkt in [Name]

[CARD 1: Ø [Preis] €/m²  |  "Marktpreis März 2026"]
[CARD 2: Immowelt Preisatlas  |  "Quelle März 2026"]
[CARD 3: ⚠️ Milieuschutz  |  "§ 172 BauGB"]  ← NUR wenn milieuschutz===true
[CARD 4: Gutachterausschuss Leipzig 2024  |  "Offizielle Transaktionsdaten"]

Quelle: Immowelt Preisatlas, März 2026.
Offizielle Transaktionsdaten: Gutachterausschuss Leipzig 2024.
```

Bei `milieuschutz===false`: 3 Cards (ohne Milieuschutz-Card).
Bei `milieuschutz===true`: 4 Cards inkl. Milieuschutz-Warning.

*Unique durch: Preis, Milieuschutz-Card (conditional)*

---

### Sektion 3 — Objekttypen-Block

**H2:** `Typische Immobilien in [Name]`

**4 Varianten (vollständige Copy-Texte):**

**`altbau`** — Premium-Lagen Zentrum/Schleussig/Gohlis-Süd:
> [Name] ist geprägt von Altbauten der Gründerzeit und Jugendstil — oft denkmalgeschützt, mit Stuckdecken und Dielenböden. Diese Substanz ist wertvoll, aber aufwendig: Denkmalschutz-Auflagen, ungeklärte WEG-Beschlusslage oder komplexe Erbengemeinschaften machen den Verkauf auf dem offenen Markt schwierig. Wir kennen diese Objekte und machen Angebote, die den Aufwand fair einpreisen.

**`gruenderzeit`** — Typische Ost/West-Stadtteile:
> [Name] ist geprägt von Gründerzeit-Mehrfamilienhäusern der Jahrhundertwende — 3 bis 6 Einheiten, oft in Erbengemeinschaften oder mit GEG-Sanierungspflicht. Solche Objekte sind auf Portalen schwer vermarktbar: Käufer scheuen den Sanierungsaufwand, Eigentümer die Investition. Wir kaufen im Ist-Zustand und begleiten den gesamten Prozess.

**`plattenbau`** — Grünau, Paunsdorf, Stadtrand:
> [Name] ist geprägt von Plattenbauten der 1960er bis 1980er Jahre — Bestände mit hohem Sanierungsdruck durch das Gebäudeenergiegesetz. Viele Eigentümer stehen vor der Frage: Sanieren oder verkaufen? Bei Einzelwohnungen in großen Anlagen rechnet sich die Investition selten. Wir kaufen im Ist-Zustand — auch bei laufenden WEG-Beschlüssen oder unklarer Sanierungsplanung.

**`mischbebauung`** — Gemischte Stadtteile:
> [Name] hat eine gemischte Bebauung aus verschiedenen Epochen — Gründerzeit-Substanz neben Nachkriegsbauten, Einzel- neben Mehrfamilienhäusern. Diese Heterogenität macht die Bewertung komplex. Wir kennen den lokalen Markt und machen Angebote unabhängig vom Baujahr — auch bei schwieriger Ausgangslage wie Erbschaft, Messie-Objekt oder GEG-Sanierungsstau.

*Unique durch: `objekttyp`-Variante + Stadtteilname eingesetzt*

---

### Sektion 4 — Milieuschutz *(nur bei `milieuschutz===true`)*

**H2:** `Milieuschutz in [Name] — was bedeutet das für den Verkauf?`

**Erklärungstext (fest, nur [Name] variiert):**
> [Name] liegt im Milieuschutzgebiet nach § 172 Baugesetzbuch. Das bedeutet: Die Stadt Leipzig hat bei bestimmten Transaktionen ein Vorkaufsrecht. In der Praxis wird dieses Recht selten ausgeübt — für Privateigentümer ändert sich am Verkaufsablauf kaum etwas. Wir begleiten Sie durch den gesamten Prozess und koordinieren alle notwendigen Schritte mit der Stadt Leipzig.

**FAQ-Block (2 Fragen, fest):**

*Frage 1:* Was bedeutet Milieuschutz in [Name] für den Verkauf?
*Antwort:* Das Vorkaufsrecht der Stadt Leipzig greift nur bei bestimmten Käufergruppen und wird in der Praxis selten ausgeübt. Für Privateigentümer, die an uns verkaufen, ändert sich der Ablauf kaum — wir bearbeiten die Vorkaufsrechtsprüfung intern.

*Frage 2:* Kann ich meine Immobilie trotz Milieuschutz frei verkaufen?
*Antwort:* Ja. Der § 172 BauGB schränkt Ihren Verkauf nicht ein — er gibt der Stadt lediglich ein Vorkaufsrecht, das sie ausüben kann, aber nicht muss. Bei Verzichtserklärung der Stadt verläuft der Kauf normal.

*Conditional: wird nur gerendert wenn `milieuschutz === true`*

---

### Sektion 5 — Szenarien

**H2:** `Warum verkaufen Eigentümer in [Name]?`

**3 Cards (vollständig templated — nur [Name] variiert):**

**Card 1 — Erbschaft & Erbengemeinschaft:**
Titel: Erbschaft & Erbengemeinschaft
Text: Das Haus oder die Wohnung gehört mehreren Erben — keiner will es halten, aber alle müssen zustimmen. Die Einigung blockiert sich. Wir lösen den Stillstand mit einem transparenten Angebot, das alle Parteien akzeptieren können.

**Card 2 — GEG-Sanierungspflicht:**
Titel: GEG-Sanierungspflicht
Text: Das Gebäudeenergiegesetz verlangt Investitionen, die sich für einzelne Eigentümer nicht rechnen. Wer eine Immobilie nicht dauerhaft halten will, verkauft besser im Ist-Zustand — bevor die Sanierungspflicht den Wert weiter drückt.

**Card 3 — Messie-Objekt / Sondersituation:**
Titel: Messie-Objekt & Sondersituation
Text: Kein Aufräumen, keine Fotos für Portale, kein Ghosting durch Makler. Wir besichtigen diskret und machen ein Angebot — unabhängig vom Zustand der Immobilie.

*Vollständig templated — Long-tail Coverage für Erbschaft/Messie/GEG-Queries*

---

### Sektion 6 — CTA Joachim (dark background)

**H2:** `Immobilie in [Name] bewerten lassen`

[Kontaktformular]

**Joachim-Block:**
- Foto: `/images/joachim-kleinke-portrait.jpg`
- Name: Joachim Kleinke
- Subtitle: Immobilienankauf Leipzig
- Quote: „Ich melde mich innerhalb der nächsten 48 h bei Ihnen mit einer kostenlosen Ersteinschätzung."

**Cross-Link:** `→ ROI-Rechner: Wieviel ist Ihre Immobilie wert?` → `/roi-rechner`

---

### Sektion 7 — Links (bg-alt)

**Nachbar-Stadtteile:** Pills aus `st.nachbarn` — href: `/immobilien-verkaufen/[slug]`

**Slug-Lookup:** Die `.astro`-Datei importiert die gesamte `STADTTEILE`-Datendatei und baut eine `slugMap: Record<string, string>` (slug → name) für die Pill-Labels — analog zum bestehenden `/leipzig/[...stadtteil].astro`.

**Weitere Pills:**
- "Alle Stadtteile Leipzig" → `/immobilien-verkaufen/`
- "ROI-Rechner" → `/roi-rechner`
- "So funktioniert's" → `/so-funktionierts`

---

## JSON-LD Schema (4 Blöcke)

Alle Blöcke nutzen `@id` für graph-kohärente Verlinkung.

### Block 1 — LocalBusiness
```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": "https://wirkaufendeineimmobilie.de/immobilien-verkaufen/[slug]#business",
  "name": "wirkaufendeineimmobilie.de",
  "description": "Immobilienankauf in [Name] Leipzig — Erbschaft, Messie-Objekt, GEG-Sanierungspflicht",
  "url": "https://wirkaufendeineimmobilie.de/immobilien-verkaufen/[slug]",
  "areaServed": {
    "@type": "Place",
    "name": "[Name]",
    "containedInPlace": {
      "@type": "City",
      "name": "Leipzig"
    }
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
  "@id": "https://wirkaufendeineimmobilie.de/immobilien-verkaufen/[slug]#service",
  "name": "Immobilienankauf [Name]",
  "serviceType": "Immobilienankauf",
  "provider": {
    "@id": "https://wirkaufendeineimmobilie.de/immobilien-verkaufen/[slug]#business"
  },
  "areaServed": {
    "@type": "Place",
    "name": "[Name]",
    "containedInPlace": { "@type": "City", "name": "Leipzig" }
  },
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

### Block 4 — FAQPage *(nur `milieuschutz===true`)*
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Was bedeutet Milieuschutz in [Name] für den Verkauf?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Das Vorkaufsrecht der Stadt Leipzig greift nur bei bestimmten Käufergruppen und wird in der Praxis selten ausgeübt. Für Privateigentümer, die an uns verkaufen, ändert sich der Ablauf kaum — wir bearbeiten die Vorkaufsrechtsprüfung intern."
      }
    },
    {
      "@type": "Question",
      "name": "Kann ich meine Immobilie trotz Milieuschutz frei verkaufen?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Ja. Der § 172 BauGB schränkt Ihren Verkauf nicht ein — er gibt der Stadt lediglich ein Vorkaufsrecht, das sie ausüben kann, aber nicht muss. Bei Verzichtserklärung der Stadt verläuft der Kauf normal."
      }
    }
  ]
}
```

---

## Hub-Seite `/immobilien-verkaufen/`

```
export const prerender = true;

H1: Immobilie verkaufen in Leipzig — nach Stadtteil

[Kontaktformular — direkter Einstieg]

Bezirks-Grid (6 Gruppen, je nach BezirkName):
  Zentrum (7)    Nord (8)      Ost (~14)
  West (14)      Süd (5)       Stadtrand (6)

[Trust-Zeile: Alle 63 Stadtteile · Kostenlos · 48h Ersteinschätzung]
```

**JSON-LD Hub — ItemList:**
```json
{
  "@context": "https://schema.org",
  "@type": "ItemList",
  "name": "Immobilie verkaufen in Leipzig — alle Stadtteile",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Connewitz",
      "url": "https://wirkaufendeineimmobilie.de/immobilien-verkaufen/connewitz" },
    ...
  ]
}
```

---

## Interne Verlinkungsstrategie

### Ebene 1 — Hub → alle 63 LPs
`/immobilien-verkaufen/` verlinkt alle 63 LPs gruppiert nach Bezirk.
Hub wird von Homepage-Nav/Footer und den bestehenden `/leipzig/` Seiten verlinkt.

### Ebene 2 — LP → Nachbar-LPs (Pills)
`nachbarn[]` → `/immobilien-verkaufen/[slug]`
Slug-Labels aus `slugMap` der Datendatei (nicht aus dem bestehenden buyer-JSON).

### Ebene 3 — LP → Funktionsseiten
- `/roi-rechner` (Pflicht, in CTA-Block)
- `/so-funktionierts`
- `/immobilien-verkaufen/` (Hub-Rückverlinkung)

### Ebene 4 — Bestehende Buyer-Pages → neue Verkäufer-LPs
5 bestehende `/leipzig/[stadtteil]` Pages erhalten je einen Hinweis-Block:
```
"Sie sind Eigentümer in [Name]? → Immobilie verkaufen in [Name]"
```
Platzierung: Am Ende von Sektion 7 (Nachbar-Stadtteile / Weitere Seiten) als eigene Pill-Gruppe.
Richtung: nur `/leipzig/X` → `/immobilien-verkaufen/X`, nicht umgekehrt.

### Ebene 5 — Homepage → Hub
Homepage-Footer oder Nav → `/immobilien-verkaufen/`

---

## Sitemap

`@astrojs/sitemap` inkludiert alle prerendered Seiten automatisch. Die 63 LPs + Hub werden dadurch ohne Konfigurationsänderung indexiert. Der bestehende Filter (`!page.includes('/danke') && !page.includes('/api/')`) greift nicht für `/immobilien-verkaufen/` — kein Anpassungsbedarf.

---

## 404-Verhalten

Mit `getStaticPaths` + `prerender = true` existieren nur die 63 generierten Pfade. Ein Aufruf von `/immobilien-verkaufen/nichtvorhanden` fällt auf die globale 404-Seite zurück — dieses Verhalten ist akzeptabel und benötigt keine eigene Fehlerseite.

---

## Dateipfade (neu)

```
src/data/stadtteile-verkaufen.ts        ← zentrale Datendatei (63 Einträge)
src/pages/immobilien-verkaufen/
  index.astro                           ← Hub-Seite (prerender = true)
  [...stadtteil].astro                  ← LP-Template (prerender = true)
public/images/
  joachim-kleinke-portrait.jpg          ← existiert bereits ✓
```

---

## Astro Output-Modus

`astro.config.mjs` hat KEIN explizites `output`-Feld. Mit dem `@astrojs/node`-Adapter ist der Default `output: 'server'` (SSR). Seiten mit `getStaticPaths()` oder `export const prerender = true` werden statisch gebaut. Seiten mit `export const prerender = false` (danke, api) bleiben SSR.

**Keine Änderung an `astro.config.mjs` nötig.** Das bestehende Setup unterstützt bereits hybrides SSG+SSR.

## Canonical URL Format

Canonical-URLs ohne trailing slash: `/immobilien-verkaufen/connewitz` (nicht `/connewitz/`).
`@astrojs/sitemap` generiert für SSG-Seiten URLs ohne trailing slash — Canonical-Tags müssen dasselbe Format verwenden.

## Out of Scope

- Kein CMS, keine Datenbank, kein Login
- Keine Pain-Abfrage auf Hub-Seite (separate Initiative)
- Keine Telefonnummer in CTA (Phase 2)
- `nachbarn[]` wird von Stefan manuell befüllt — kein automatischer Adjacency-Graph
- `/danke.astro` und `/api/bewertung.ts` bleiben unverändert (`prerender = false`)
