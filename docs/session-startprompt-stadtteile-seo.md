# Startprompt: WKDI Stadtteile-Landingpages SEO

Starte `/superpowers:brainstorming` für folgendes Vorhaben:

---

## Kontext

**Projekt:** wirkaufendeineimmobilie.de (WKDI)
**Stack:** Astro SSR, @astrojs/node, deployed auf Hetzner/Coolify
**Repo:** ~/code/brown2green/website (Branch: feat/website-build)
**Deploy:** `curl -s "http://178.104.15.187:8000/api/v1/deploy?uuid=wisjftvt2q9b53z13nciq9dh" -H "Authorization: Bearer 34|4140dc1a1b2a699456ab4184ce45c091aaafa9fb03cd6b30bee1105735697e3ec8173c750bf828c8"`

**Business:** Joachim Kleinke kauft Problemimmobilien in Leipzig (Messie, Erbschaft, GEG-Sanierungspflicht, Insolvenz/Zwangslage). Zielgruppe: Eigentümer die schnell und unkompliziert verkaufen wollen — keine Makler, kein Stress.

---

## Vorhaben

**63 SEO-Landingpages** — eine pro Leipziger Stadtteil.

Beispiel-URL-Schema:
- `/immobilien-verkaufen/gohlis-sued`
- `/immobilien-verkaufen/connewitz`
- `/immobilien-verkaufen/gruenau-nord`

### Pflichtinhalte pro LP:

1. **Lokaler Marktpreis** — aktueller €/m² aus Immowelt (März 2026), z.B. "Gohlis-Süd: Ø 2.682 €/m²"
2. **Milieuschutz-Hinweis** — nur wenn Stadtteil betroffen (11 Stadtteile), Erklärung was das für den Verkäufer bedeutet
3. **Objekttypen-Kontext** — welche Problemimmobilien kommen in diesem Stadtteil typisch vor?
4. **Lokaler CTA** — "Ich kaufe Ihre Immobilie in [Stadtteil]" + Kontaktformular/Telefon
5. **ROI-Rechner Cross-Link** — "Was bekomme ich für meine Immobilie in [Stadtteil]?"

### Datenbasis (bereits vorhanden):

```typescript
// Marktpreise €/m² (Immowelt März 2026) — alle 63 Stadtteile
const PREISE = {
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

// Milieuschutz-Gebiete (11 Stadtteile)
const MILIEUSCHUTZ = new Set([
  'eutritzsch', 'schoenefeld-abtnaundorf', 'neustadt-neuschoenef',
  'volkmarsdorf', 'reudnitz-thonberg', 'connewitz', 'plagwitz',
  'kleinzschocher', 'lindenau', 'alt-lindenau', 'leutzsch',
]);
```

### Technische Kernfrage für Brainstorming:

**Statisch oder dynamisch?**
- **Option A:** 63 statische `.astro` Dateien (oder Astro Content Collections) — einfach, kein Runtime-Overhead
- **Option B:** Eine dynamische Route `[stadtteil].astro` mit zentralem Datenobjekt — 1 Datei, skalierbar
- **Option C:** Hybrid — Astro SSG mit `getStaticPaths()` aus Datendatei

### SEO-Ziele:
- Ranking für "[Stadtteil] Immobilie verkaufen Leipzig"
- Ranking für "Wohnung verkaufen [Stadtteil]"
- Long-tail: "Erbschaft Immobilie verkaufen [Stadtteil]"
- Interne Verlinkung: Alle 63 LPs untereinander + Hauptseite + ROI-Rechner

### Was NICHT gebaut wird:
- Kein eigenes CMS
- Kein Nutzer-Login
- Keine Datenbank
- Copy kann templated sein (kein individueller Text pro LP nötig — Daten machen den Unterschied)

---

## Startbefehl

`/superpowers:brainstorming` — Fang mit der technischen Architektur an (Option A/B/C), dann Copy-Struktur pro LP, dann interne Verlinkungsstrategie.
