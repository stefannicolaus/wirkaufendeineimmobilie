# SEO & GEO Audit: wirkaufendeineimmobilie.de

> Erstellt: 16.03.2026
> Auditor: NEXUS SEO Specialist
> Domain: wirkaufendeineimmobilie.build-upstream.com
> Stack: Astro (hybrid, @astrojs/node)
> Seiten: 13 (5 statisch, 5 Stadtteil-Seiten, 2 Guides, 1 Danke-Seite)

---

## EXECUTIVE SUMMARY

Die Website hat eine solide technische Basis (Astro SSR, JSON-LD im Layout, OG-Tags, canonical URLs). Es gibt jedoch **5 CRITICAL Issues** die vor Go-Live behoben werden muessen: fehlende Sitemap, fehlende OG-Bilddatei, fehlendes Favicon, Platzhalter in Impressum/Datenschutz, und fehlende noindex-Directive auf der Danke-Seite. Die GEO-Optimierung ist fuer eine MVP-Phase akzeptabel, braucht aber mehr zitierbaren Content mit spezifischen Datenpunkten.

**Gesamt-Score: 6.2/10** (gut fuer MVP, CRITICAL-Fixes bringen auf 7.5+)

---

## TEIL 1: TECHNICAL SEO AUDIT

### 1.1 Indexierung

| Check | Status | Severity | Detail |
|-------|--------|----------|--------|
| Sitemap vorhanden | FEHLT | **CRITICAL** | Kein `@astrojs/sitemap` in package.json. robots.txt verweist auf `sitemap-index.xml` die nicht existiert. Phantom-Sitemap-Referenz. |
| Danke-Seite noindex | FEHLT | **CRITICAL** | `/danke` ist SSR (prerender=false), aber hat kein `<meta name="robots" content="noindex">`. Wird indexiert mit "Anfrage eingegangen" als Title. |
| API-Routes indexiert | OK | LOW | API-Routes (`/api/*`) sind server-only, werden nicht gecrawlt. Kein Risiko. |
| Datenschutz/Impressum | OK | -- | Sollen indexiert sein (DSGVO-Pflicht). |

**Fix-Vorschlaege:**
1. `npm install @astrojs/sitemap` + in `astro.config.mjs` als Integration einbinden
2. Danke-Seite: `<meta name="robots" content="noindex, nofollow">` im Layout-Head per prop steuern
3. Sitemap-Filter: `/danke` und `/api/*` explizit ausschliessen

---

### 1.2 Metadata (pro Seite)

| Seite | Title (Zeichen) | Unique? | Description (Zeichen) | Unique? | Canonical | OG komplett? |
|-------|-----------------|---------|----------------------|---------|-----------|-------------|
| `/` (index) | "wirkaufendeineimmobilie.de — Sanierungsbeduerftige Immobilien verkaufen in Leipzig" (79) | Ja | "Sanierungsbeduerftige Immobilien in Leipzig verkaufen — ohne Makler, ohne Renovierung. Angebot in 48h. Kostenlose Bewertung." (120) | Ja | Ja (self-ref) | Ja |
| `/so-funktionierts` | "So funktioniert's — wirkaufendeineimmobilie.de" (50) | Ja | "Vom ersten Kontakt bis zum Geld auf deinem Konto — transparent und fair. Fuer Verkaeufer und Kaeufer." (96) | Ja | Ja | Ja |
| `/investoren` | "Investoren-Zugang — Off-Market Sanierungsobjekte Leipzig \| wirkaufendeineimmobilie.de" (81) | Ja | "Exklusiver Zugang zu kuratierten Fix & Flip Objekten in Leipzig. Off-Market, vorgeprüft, mit Renditepotenzial." (108) | Ja | Ja | Ja |
| `/roi-rechner` | "ROI-Rechner — Fix & Flip Rendite berechnen \| wirkaufendeineimmobilie.de" (69) | Ja | "Der einzige Fix & Flip Rechner mit echten Leipziger Marktdaten. Berechne Rendite, Kosten und Gewinn." (99) | Ja | Ja | Ja |
| `/guides/erbengemeinschaft` | "Erbengemeinschaft & Immobilie — 7 Wege aus der Blockade \| wirkaufendeineimmobilie.de" (83) | Ja | "Einer will nicht verkaufen? Die Kosten laufen? 7 rechtliche Wege, wie Erbengemeinschaften eine Immobilie verwerten koennen." (120) | Ja | Ja | Ja |
| `/guides/fix-flip-starter` | "Fix & Flip Starter-Guide Leipzig — Dein erster Deal in 90 Tagen \| wirkaufendeineimmobilie.de" (89) | Ja | "Kalkulation, Finanzierung, Stadtteil-Analyse, Deal-Quellen — alles was du fuer deinen ersten Fix & Flip Deal in Leipzig brauchst." (127) | Ja | Ja | Ja |
| `/danke` | dynamisch, z.B. "Anfrage eingegangen — wirkaufendeineimmobilie.de" (~50) | Ja | statisch (Layout-Default) | PROBLEM | Ja | Ja |
| `/datenschutz` | "Datenschutzerklaerung — wirkaufendeineimmobilie.de" (50) | Ja | 107 Zeichen | Ja | Ja | Ja |
| `/impressum` | "Impressum — wirkaufendeineimmobilie.de" (40) | Ja | 108 Zeichen | Ja | Ja | Ja |
| `/leipzig/volkmarsdorf` | "Sanierungsbeduerft. Wohnung verkaufen in Volkmarsdorf — wirkaufendeineimmobilie.de" (83) | Ja | dynamisch, ~105 Zeichen | Ja | Ja | Ja |
| (andere Stadtteile) | analog | Ja | analog | Ja | Ja | Ja |

**Issues gefunden:**

| Issue | Severity | Detail |
|-------|----------|--------|
| Titles zu lang | **MEDIUM** | 6 von 10 Seiten ueber 60 Zeichen. Google schneidet ab ~60 ab. Startseite 79 Zeichen, Investoren 81, Erben-Guide 83, Flip-Guide 89. |
| Descriptions zu kurz | **LOW** | `/so-funktionierts` (96 Zeichen) und `/roi-rechner` (99 Zeichen) — unter dem optimalen Bereich von 150-160 Zeichen. Verschenkter SERP-Platz. |
| OG-Image fehlt physisch | **CRITICAL** | Layout referenziert `/og-default.jpg` — Datei existiert NICHT in `public/`. Alle OG-Shares zeigen kein Bild. |
| Favicon fehlt | **CRITICAL** | Layout referenziert `/favicon.svg` — Datei existiert NICHT in `public/`. Browser zeigt Generic-Icon. |
| Kein Twitter-Handle | **LOW** | `twitter:site` und `twitter:creator` fehlen. Nicht blockierend, aber verschenktes Branding. |

---

### 1.3 Structured Data

**Layout (global): RealEstateAgent**
```json
{
  "@type": "RealEstateAgent",
  "name": "wirkaufendeineimmobilie.de",
  "description": "Vermittlungsplattform fuer sanierungsbeduerft. Wohnungen in Leipzig",
  "areaServed": { "@type": "City", "name": "Leipzig" },
  "telephone": "+49341800900",
  "address": { "@type": "PostalAddress", "addressLocality": "Leipzig", "addressCountry": "DE" }
}
```

| Check | Status | Severity | Detail |
|-------|--------|----------|--------|
| RealEstateAgent Schema | GUT | -- | Korrekt als global im Layout. |
| Telefonnummer inkonsistent | **MEDIUM** | | Layout: `+49341800900` (fehlt eine 0). Stadtteil-Seiten: `+49-341-800-900-0`. Danke-Seite href: `+493418009000`. **Drei verschiedene Formate, mindestens eins ist falsch.** Die korrekte scheint `+493418009000` zu sein (0341-800 900 0 = +49 341 8009000). |
| Stadtteil-Seiten: LocalBusiness | PROBLEMATISCH | **MEDIUM** | Nutzt `@type: LocalBusiness` statt `Place` oder spezifischeres Schema. LocalBusiness impliziert einen physischen Geschaeftsort im Stadtteil — das ist irreführend. Besser: `RealEstateAgent` mit `areaServed.containsPlace`. |
| Doppeltes JSON-LD auf Stadtteilen | **MEDIUM** | | Stadtteil-Seiten haben JSON-LD im Template UND erben das RealEstateAgent-Schema aus dem Layout. Zwei `<script type="application/ld+json">` Bloecke — das ist technisch OK aber sollte als `@graph` zusammengefasst werden. |
| Person-Schema Joachim Kleinke | FEHLT | **HIGH** | Kein Person-Schema fuer den Experten. E-E-A-T-Signal fehlt komplett. |
| BreadcrumbList Schema | FEHLT | **MEDIUM** | Stadtteil-Seiten haben visuellen Breadcrumb aber kein BreadcrumbList JSON-LD. Google kann Rich Breadcrumbs nicht anzeigen. |
| FAQPage Schema | KORREKT NICHT VORHANDEN | OK | FAQ auf Startseite als `<details>` ohne FAQPage-Schema — richtig fuer kommerzielle Seite. |
| WebSite-Schema mit SearchAction | FEHLT | **LOW** | Optional, aber wuerde Sitelinks-Searchbox ermoeglichen. |

---

### 1.4 Content-SEO

#### H-Tag Hierarchie (pro Seite)

| Seite | H1 | H2s | H3s | Issues |
|-------|-----|-----|-----|--------|
| `/` | "Deine Immobilie. Unser Angebot. In 48h." | "Verkaufen oder Investieren" (sr-only), "In 3 Schritten...", "35+ Jahre...", "Haeufige Fragen", "Jetzt Immobilie bewerten..." | "Ich moechte verkaufen", "Ich suche Objekte", "PLZ eingeben", "Angebot in 48h", "Schluessel ab, fertig" | H2 `sr-only` ist OK fuer A11y aber crawlbar |
| `/so-funktionierts` | "So funktioniert's" | "Das digitale Angebotsverfahren" | "Objekt einreichen", etc. | OK |
| `/investoren` | "Dein naechstes Flip-Objekt..." | "Was bringt dein naechster Flip?", "Investoren-Zugang anfragen" | "Off-Market Zugang", etc. | OK |
| `/roi-rechner` | "Was bringt dein naechster Flip?" | -- | "Deine Zahlen", "Dein Ergebnis" | **MEDIUM**: H3 direkt nach H1, kein H2 dazwischen |
| `/guides/erbengemeinschaft` | "Erbengemeinschaft & Immobilie — 7 Wege..." | "Kommt Ihnen das bekannt vor?" | "Was im Guide steht", "Guide jetzt anfordern" | OK |
| `/guides/fix-flip-starter` | "Fix & Flip Starter-Guide Leipzig..." | "Du willst starten, aber weisst nicht wo?" | "Was im Guide steht", "Guide jetzt anfordern" | OK |
| Stadtteil-Seiten | "Sanierungsbeduerft. Wohnung verkaufen in [Name]" | "Marktdaten [Name]", "Beispielrechnung...", "[Name] im Detail", "Immobilie in [Name] bewerten lassen" | -- | OK, gute Hierarchie |
| `/datenschutz` | "Datenschutzerklaerung" | 6x H2 (Sections) | 1x H3 | OK |
| `/impressum` | "Impressum" | 2x H2 | 5x H3 | OK |

#### Interne Verlinkung

| Von | Nach | Vorhanden? |
|-----|------|------------|
| Startseite | /so-funktionierts | Nein (nur in Nav) |
| Startseite | /investoren | Ja (Dual Card) |
| Startseite | /roi-rechner | Nein (nur in Nav) |
| Startseite | /guides/* | **NEIN** |
| Startseite | /leipzig/* | **NEIN** |
| Nav | /guides/* | **NEIN** |
| Nav | /leipzig/* | **NEIN** |
| Footer | /guides/* | Ja |
| Footer | /leipzig/* | **NEIN** |
| Investoren | /roi-rechner | Ja |
| Stadtteil-Seiten | untereinander | Ja (Nachbar-Links) |
| Stadtteil-Seiten | /roi-rechner | Ja |
| Stadtteil-Seiten | /so-funktionierts | Ja |
| Stadtteil-Seiten | / | Ja (Breadcrumb) |

**Issues:**

| Issue | Severity | Detail |
|-------|----------|--------|
| Stadtteil-Seiten verwaist | **HIGH** | Kein Link von Startseite oder Nav zu `/leipzig/*`. Nur ueber Footer-Links auf Guide-Seiten und untereinander verlinkt. Google crawlt sie ggf. nicht zuverlaessig. |
| Guide-Seiten kaum verlinkt | **MEDIUM** | Guides nur im Footer verlinkt, nicht auf Startseite oder in Nav. |
| Kein Stadtteil-Uebersicht | **HIGH** | Es fehlt eine `/leipzig/` Hub-Seite die alle Stadtteile auflistet. Wuerde als interner Linking-Hub dienen. |
| Keine Bilder auf der gesamten Website | **MEDIUM** | Null `<img>` Tags gefunden. Keine Alt-Text-Probleme, aber auch null visuelle Signale fuer Google Image Search und multimodale AI-Zitierung. |

---

### 1.5 Fehlende Dateien

| Datei | Status | Severity |
|-------|--------|----------|
| `/og-default.jpg` | FEHLT | **CRITICAL** |
| `/favicon.svg` | FEHLT | **CRITICAL** |
| Sitemap-Integration | FEHLT | **CRITICAL** |

---

### 1.6 Impressum/Datenschutz Platzhalter

| Issue | Severity | Detail |
|-------|----------|--------|
| Impressum hat 8+ Platzhalter | **CRITICAL** | Firmenname, Adresse, E-Mail, Vertreter, Erlaubnisbehoerde, Registriernummer, Versicherung — alles "[Platzhalter]". **Rechtsrisiko: Impressumspflicht nicht erfuellt.** |
| Datenschutz hat 2 Platzhalter | **CRITICAL** | Firmenname und E-Mail fehlen. **DSGVO-Verstoss.** |
| Trust-Section Platzhalter | **MEDIUM** | Startseite Trust-Section: "[Platzhalter — wird nach Call 19.03. befuellt]" |

---

## TEIL 2: LLM/GEO OPTIMIZATION

### 2.1 AI Crawler in robots.txt

| Crawler | Status | Bewertung |
|---------|--------|-----------|
| GPTBot | Allow: / | OK |
| ClaudeBot | Allow: / | OK |
| PerplexityBot | Allow: / | OK |
| CCBot | Disallow: / | OK (Training-Crawler) |
| Bytespider | Disallow: / | OK |
| OAI-SearchBot | FEHLT | **MEDIUM** — OpenAI Search-Crawler nicht explizit erlaubt |
| ChatGPT-User | FEHLT | **LOW** — ChatGPT Browsing-Crawler nicht explizit erlaubt |
| Google-Extended | FEHLT | **LOW** — Nicht blockiert = Gemini-Training erlaubt. Bewusste Entscheidung? |

### 2.2 llms.txt

| Check | Status | Detail |
|-------|--------|--------|
| Vorhanden | Ja | `/public/llms.txt` |
| Alle Seiten gelistet | TEILWEISE | **FEHLT:** Guides (/guides/erbengemeinschaft, /guides/fix-flip-starter), Impressum, Datenschutz. Guides SOLLTEN rein (SEO-relevanter Content). |
| Kernfakten-Sektion | FEHLT | **MEDIUM** — Keine "Key Facts" Sektion mit Marktdaten, Joachim-Expertise, Angebotsverfahren-Erklaerung. AI-Crawler bekommen keinen schnellen Kontext. |
| Format korrekt | Ja | Markdown-konform |

### 2.3 Citability Score (pro Seite)

| Seite | GEO-Score | Passage-Laenge (optimal: 134-167 Woerter) | Direkte Antwort in 40-60w? | Spezifische Fakten? | "X ist..." Definitionen? | Einzigartige Datenpunkte? |
|-------|-----------|------------------------------------------|-----------------------------|---------------------|--------------------------|---------------------------|
| `/` (Startseite) | 4/10 | Kurze Marketing-Saetze, keine 134w-Bloecke | Nein | Nein | Nein | Nein |
| `/so-funktionierts` | 5/10 | Kurze Schritte, kein Fliesstext | Teilweise (Angebotsverfahren) | "Kein Zuschlagszwang" | Nein | Nein |
| `/investoren` | 4/10 | Marketing-Copy, keine Substanz-Passagen | Nein | Nein | Nein | Nein |
| `/roi-rechner` | 6/10 | Interaktiver Content (nicht zitierbar durch AI) | Nein | Ja (Leipziger qm-Preise im JS) | Nein | Ja (aber im JS, nicht im HTML) |
| `/guides/erbengemeinschaft` | 5/10 | Kurzlisten statt Fliesstext | Nein | Nein (Guide hinter E-Mail) | Nein | Nein |
| `/guides/fix-flip-starter` | 5/10 | Kurzlisten statt Fliesstext | Nein | Nein (Guide hinter E-Mail) | Nein | Nein |
| Stadtteil-Seiten (Schnitt) | **7/10** | Marktdaten direkt im HTML | Ja (qm-Preise sofort sichtbar) | Ja (Preise, Trend, Einwohner) | Nein | **Ja** (lokale Marktdaten) |
| `/datenschutz` | -- | Nicht relevant | -- | -- | -- | -- |
| `/impressum` | -- | Nicht relevant | -- | -- | -- | -- |

**Staerkstes GEO-Asset:** Die Stadtteil-Seiten. Spezifische Leipziger Marktdaten sind genau das, was AI-Modelle als zitierwuerdig einstufen.

**Groesste GEO-Schwaeche:** Startseite und Investoren-Seite sind reine Marketing-Copy ohne zitierbare Substanz. Keine "Was ist ein Angebotsverfahren?"-Definition. Keine Marktdaten im sichtbaren HTML.

### 2.4 E-E-A-T als AI-Vertrauenssignal

| Signal | Status | Severity |
|--------|--------|----------|
| Person-Schema (Joachim Kleinke) | FEHLT | **HIGH** |
| Konsistenter Experten-Name | TEILWEISE | **MEDIUM** — "Joachim Kleinke" nur einmal erwaehnt (Startseite Trust-Section), und das ist noch Platzhalter-Text |
| `sameAs` Social-Links | FEHLT | **HIGH** — Kein LinkedIn, kein Xing, keine Unternehmensseite verlinkt |
| Spezifische Datenpunkte (Leipzig-Markt) | NUR auf Stadtteil-Seiten | **MEDIUM** — Startseite hat null Datenpunkte |
| Autoritative Quellenangaben | FEHLT | **LOW** — Marktdaten ohne Quellenangabe (Gutachterausschuss, Sparkasse Wohnmarktbericht) |

---

## TEIL 3: PROGRAMMATIC SEO — STADTTEIL-SEITEN

### 3.1 Quality Gates

| Metrik | Schwelle | Ergebnis | Status |
|--------|----------|----------|--------|
| Anzahl Seiten | 5 | 5 | OK (unter 100 = kein Spam-Risiko) |
| Unique Content pro Seite | >=40% | ~55-60% | **OK** — Marktdaten, Besonderheit, Infrastruktur, Beispielrechnung sind alle unique pro Stadtteil |
| Wortanzahl (sichtbarer Content) | >=300 | ~250-300 Woerter | **MEDIUM** — Grenzwertig. Einige Stadtteile knapp unter 300w. |
| Standalone-Wert-Test | Bestanden? | **JA** | Jede Seite hat echte lokale Daten die eigenstaendig nuetzlich sind |
| Template vs. Unique | <60% Template | ~40-45% Template | OK |

### 3.2 Content-Differenzierung (Stichprobe)

| Feld | Volkmarsdorf | Plagwitz | Unique? |
|------|-------------|----------|---------|
| qm_unsaniert | 1.500 | 2.200 | Ja |
| qm_saniert | 3.300 | 4.200 | Ja |
| trend | "stark steigend" | "stabil hoch" | Ja |
| trend_5j | "+42%" | "+28%" | Ja |
| besonderheit | 2 Saetze, Gentrifizierung Fruehstadium | 2 Saetze, Vorzeige-Gentrifizierung | Ja |
| typische_objekte | Gruenderzeit, 1-2 Zi, DDR | Industrielofts, denkmalgeschuetzt | Ja |
| infrastruktur | 4 Eintraege | 4 Eintraege | Ja (verschieden) |
| einwohner | 12.800 | 14.200 | Ja |
| sanierungsquote | 38% | 72% | Ja |

**Bewertung:** Die JSON-Daten sind genuegend differenziert. Keine "nur Stadtname ausgetauscht"-Situation. Die `besonderheit`-Texte sind kurz aber einzigartig.

### 3.3 Verbesserungspotenzial

| Issue | Severity | Detail |
|-------|----------|--------|
| Kein Fliesstext-Absatz pro Stadtteil | **MEDIUM** | Jede Stadtteil-Seite braucht 1-2 Absaetze (134-167 Woerter) echten redaktionellen Text. Aktuell nur strukturierte Datenfelder. |
| Keine Bilder/Karten | **MEDIUM** | Stadtteil-Seiten ohne Stadtteilbild/Karte sind fuer Google und Nutzer weniger wertvoll. |
| Nachbar-Verlinkung duenn | **LOW** | Lindenau verlinkt nur auf Plagwitz, nicht auf andere West-Stadtteile. Netz koennte dichter sein. |

---

## TEIL 4: KEYWORD-MAPPING

### 4.1 Aktuelle Zuordnung (aus MARKETING-KONZEPT Sektion 2.4)

| Keyword | Suchintent | Zugeordnete Seite | Status |
|---------|-----------|-------------------|--------|
| "Erbengemeinschaft Haus verkaufen einer will nicht" | Informational/Commercial | `/guides/erbengemeinschaft` | OK, aber Guide hinter Paywall (E-Mail) |
| "geerbte Wohnung verkaufen" | Commercial | `/` oder `/guides/erbengemeinschaft` | **LUECKE** — keine Seite optimiert exakt dafuer |
| "Erbengemeinschaft Immobilie verkaufen" | Commercial | `/guides/erbengemeinschaft` | Teilweise (Title passt) |
| "sanierungsbeduerftige Wohnung verkaufen" | Commercial | `/` | Title-Match, aber generisch |
| "Teilungsversteigerung vermeiden" | Informational | **KEINE SEITE** | **LUECKE** |
| "Erbteil verkaufen" | Transactional | **KEINE SEITE** | **LUECKE** |
| "Immobilie schnell verkaufen Leipzig" | Transactional/Local | `/` | Implizit, nicht optimiert |
| "Wohnung unter Betreuung verkaufen" | Commercial | **KEINE SEITE** | **LUECKE** |
| "Fix und Flip Objekte finden" | Commercial | `/investoren` | Implizit, nicht im Title |
| "Sanierungsobjekt kaufen Leipzig" | Transactional/Local | `/investoren` oder Stadtteil-Seiten | Teilweise |
| "Off-Market Immobilien" | Commercial | `/investoren` | OK (im Title) |
| "Fix und Flip Finanzierung" | Informational | **KEINE SEITE** | **LUECKE** |
| "Fix und Flip ohne Eigenkapital" | Informational | **KEINE SEITE** | **LUECKE** |
| "Erbengemeinschaft aufloesen" | Informational | `/guides/erbengemeinschaft` | Teilweise |
| "Wohnung verkaufen Leipzig" | Transactional/Local | `/` | Ja (aber im Title abgeschnitten) |
| "Angebotsverfahren Immobilie" | Informational | `/so-funktionierts` | **LUECKE** — nicht im Title/Description |
| "Wohnung verkaufen [Stadtteil]" | Local | `/leipzig/[stadtteil]` | JA — genau dafuer gebaut |

### 4.2 Keywords ohne Seite (Content-Luecken)

| Keyword | Empfohlene Seite | Prioritaet |
|---------|-----------------|------------|
| "Teilungsversteigerung vermeiden" | Neuer Guide oder Blog-Artikel | **HIGH** — hoher Intent, starker Fit |
| "Erbteil verkaufen" | Neuer Content-Abschnitt auf Erben-Guide | **HIGH** |
| "Wohnung unter Betreuung verkaufen" | Neue Seite `/guides/betreuung` oder Content auf Startseite | **HIGH** — ICP V2 (Betreute Verkaeufer) hat keinen Content |
| "Fix und Flip Finanzierung" | Neuer Guide `/guides/fix-flip-finanzierung` | **MEDIUM** |
| "Fix und Flip ohne Eigenkapital" | Content auf Flip-Starter-Guide oder separate Seite | **MEDIUM** |
| "Angebotsverfahren Immobilie" | Content-Erweiterung auf `/so-funktionierts` | **MEDIUM** — "Was ist ein Angebotsverfahren?" Definition fehlt komplett |
| "geerbte Wohnung verkaufen Leipzig" | Long-Tail auf Startseite oder Erben-Guide | **HIGH** |
| "Messiwohnung verkaufen" | **KEINE** (lt. Marketing-Konzept: nicht ueber SEO erreichbar) | SKIP |

### 4.3 Long-Tail Keywords (empfohlen)

| Long-Tail Keyword | Zuordnung |
|-------------------|-----------|
| "Erbengemeinschaft Wohnung verkaufen Leipzig" | /guides/erbengemeinschaft |
| "unsanierte Wohnung verkaufen ohne Makler" | / |
| "Fix und Flip Leipzig Erfahrungen" | /guides/fix-flip-starter |
| "Wohnung im Ist-Zustand verkaufen" | / |
| "Sanierungsobjekt Leipzig Ost kaufen" | /leipzig/volkmarsdorf |
| "Quadratmeterpreis unsaniert Leipzig [Stadtteil]" | /leipzig/[stadtteil] |
| "Immobilie geerbt was tun" | /guides/erbengemeinschaft |
| "Handwerker als Investor" | /investoren |

---

## TEIL 5: GEO-SCORE PRO SEITE

| Seite | GEO-Score | Staerkste Signale | Groesste Schwaechen |
|-------|-----------|-------------------|---------------------|
| `/` | 4/10 | OG-Tags, Schema | Kein zitierbarer Content, keine Fakten, kein Experte |
| `/so-funktionierts` | 5/10 | Prozess-Erklaerung | Keine Definition "Angebotsverfahren", zu kurze Passagen |
| `/investoren` | 4/10 | OG-Tags | Rein werblich, keine Datenpunkte |
| `/roi-rechner` | 6/10 | Interaktiv, Marktdaten (im JS) | Marktdaten nicht im HTML, AI kann JS nicht ausfuehren |
| `/guides/erbengemeinschaft` | 5/10 | Pain-Points treffen VOC | Content hinter E-Mail-Gate, kein offener Fliesstext |
| `/guides/fix-flip-starter` | 5/10 | Pain-Points treffen VOC | Content hinter E-Mail-Gate |
| `/leipzig/volkmarsdorf` | **7/10** | Spezifische Marktdaten, lokale Fakten, Einwohner, Trend | Kein Fliesstext-Absatz, keine Quellenangabe |
| `/leipzig/plagwitz` | **7/10** | analog | analog |
| `/leipzig/lindenau` | **7/10** | analog | analog |
| `/leipzig/neustadt-neuschonefeld` | **7/10** | analog | analog |
| `/leipzig/reudnitz-thonberg` | **7/10** | analog | analog |

---

## TOP 10 PRIORITAETEN-LISTE

| # | Issue | Severity | Aufwand | Impact |
|---|-------|----------|---------|--------|
| 1 | **Sitemap installieren** (`@astrojs/sitemap`) + Danke/API ausschliessen | CRITICAL | 15 min | Indexierung aller Seiten |
| 2 | **OG-Image erstellen** (`/public/og-default.jpg`, 1200x630px) | CRITICAL | 30 min | Social-Sharing funktioniert |
| 3 | **Favicon erstellen** (`/public/favicon.svg`) | CRITICAL | 15 min | Professionalitaet, Browser-Tab |
| 4 | **Danke-Seite noindex** setzen | CRITICAL | 5 min | Verhindert Thin-Content-Indexierung |
| 5 | **Impressum/Datenschutz Platzhalter fuellen** (nach Joachim-Call) | CRITICAL | Extern | Rechtspflicht |
| 6 | **Person-Schema Joachim Kleinke** im Layout oder auf relevanten Seiten | HIGH | 30 min | E-E-A-T Signal fuer AI + Google |
| 7 | **Stadtteil-Hub-Seite** `/leipzig/` erstellen mit Uebersicht aller 5 Stadtteile | HIGH | 1h | Interne Verlinkung, Crawlability |
| 8 | **Titles kuerzen** auf max 60 Zeichen (Startseite, Investoren, Guides) | MEDIUM | 20 min | Bessere SERP-Darstellung |
| 9 | **llms.txt erweitern**: Guides hinzufuegen + Kernfakten-Sektion mit Marktdaten | MEDIUM | 20 min | AI-Citability |
| 10 | **OAI-SearchBot in robots.txt** erlauben | MEDIUM | 2 min | OpenAI Search Sichtbarkeit |

---

## ANHANG A: Telefonnummer-Inkonsistenz

Die Telefonnummer erscheint in 3 verschiedenen Formaten:
- Layout JSON-LD: `+49341800900` (FALSCH — fehlt eine Ziffer)
- Stadtteil JSON-LD: `+49-341-800-900-0`
- Danke-Seite href: `+493418009000`
- Nav/Footer sichtbar: `0341 — 800 900 0`

**Empfehlung:** Einheitlich auf `+49 341 8009000` normalisieren. Im JSON-LD: `"+493418009000"`.

## ANHANG B: Google Fonts Datenschutz-Risiko

Layout laedt Google Fonts via `fonts.googleapis.com`. Das Datenschutz-Dokument erwaehnt das korrekt, aber:
- **MEDIUM**: Google Fonts extern laden ist seit EuGH/LG-Muenchen-Urteil (Jan 2022) in DE problematisch. Empfehlung: Fonts lokal hosten (`/fonts/outfit-*.woff2`) statt von Google-Servern.

## ANHANG C: Fehlende Stadtteil-Links auf Startseite

Vorschlag: "Stadtteile in Leipzig" Sektion auf der Startseite mit Links zu allen 5 Stadtteil-Seiten. Dient als:
1. Interner Linking-Hub
2. Lokales SEO-Signal
3. Nutzer-Navigation
4. Crawlability-Verbesserung

---

*SEO-Audit v1.0 — Erstellt: 16.03.2026 durch NEXUS SEO Specialist*
*Naechster Review: nach Umsetzung der CRITICAL-Fixes*
