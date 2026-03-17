# NEXUS Final Pipeline — Alle Seiten

> Datum: 2026-03-16
> Projekt: brown2green / wirkaufendeineimmobilie.de
> Stack: Astro, CSS Custom Properties, kein Tailwind

---

## Seiten-Status

| Seite | Brand | Code | Reality | Verdict |
|-------|-------|------|---------|---------|
| index.astro (Homepage) | PASS | HIGH | HIGH | NEEDS WORK |
| investoren.astro | PASS | MEDIUM | PASS | PARTIAL |
| so-funktionierts.astro | PASS | MEDIUM | PASS | PARTIAL |
| roi-rechner.astro | PASS | LOW | PASS | PARTIAL |
| leipzig/[...stadtteil].astro | PASS | LOW | PASS | PARTIAL |
| aktionsplan-erbengemeinschaft | PASS | LOW | HIGH | NEEDS WORK |
| 90-tage-blueprint | PASS | LOW | HIGH | NEEDS WORK |
| entscheidungskompass-betreuung | PASS | LOW | HIGH | NEEDS WORK |
| Nav.astro | PASS | PASS | PASS | PASS |
| Footer.astro | PASS | MEDIUM | PASS | PARTIAL |
| Layout.astro | PASS | PASS | PASS | PASS |

---

## Findings (nach Severity)

### BLOCKER

**B1: tokens.md vs. global.css — `--color-text-mid` Widerspruch**
- `tokens.md` definiert `--color-text-mid: #64748B`
- `global.css` implementiert `--color-text-mid: #475569`
- Das sind verschiedene Farben (tokens.md = heller/blauer, global.css = dunkler/gruener)
- **Single Source of Truth verletzt.** tokens.md MUSS mit global.css uebereinstimmen.
- Datei: `/Users/stefan/code/brown2green/website/src/styles/global.css`, Zeile 47
- Datei: `/Users/stefan/code/brown2green/tokens.md`, Zeile 44
- **Fix:** Einen der beiden Werte anpassen. global.css ist deployed, also tokens.md updaten ODER global.css aendern.

**B2: Impressum + Datenschutz — Platzhalter-Texte auf LIVE-Seiten**
- `/impressum`: 5 Platzhalter ([Firmenname], [E-Mail-Adresse], [Erlaubnisbehoerde], [Registriernummer], [Versicherungsunternehmen], [Raeumlicher Geltungsbereich])
- `/datenschutz`: 2 Platzhalter ([Firmenname], [E-Mail-Adresse])
- **DACH Legal: Fehlendes Impressum = Abmahnrisiko.** Platzhalter sind nicht "fehlendes Impressum" im Sinne des Gesetzes, aber unprofessionell und potenziell problematisch.
- **Fix:** Joachim Kleinke / Firmenangaben eintragen.

### HIGH

**H1: Homepage Trust-Card — Platzhalter-Bild (Gradient statt Foto)**
- `index.astro`, Zeile 168: `<!-- Platzhalter-Gradient -->` — Trust-Card zeigt einen blauen Gradient-Kreis statt Joachim Kleinkes Foto
- Screenshot bestaetigt: Der Trust-Bereich hat einen leeren blauen Kreis
- **Fix:** Echtes Foto einbinden

**H2: Lead-Magnet-Seiten sagen "Unsere Experten" — Vermittlungsmodell-Widerspruch**
- `aktionsplan-erbengemeinschaft/index.astro`: "Unsere Experten schauen sich das an"
- `90-tage-blueprint/index.astro`: "Unsere Experten schauen sich das an"
- `entscheidungskompass-betreuung/index.astro`: "Unsere Experten schauen sich das an"
- **Wer sind "unsere Experten"?** Das Geschaeftsmodell hat Joachim Kleinke als Vermittler. "Unsere Experten" klingt nach grossem Team das es nicht gibt. Fantasy-Copy.
- **Fix:** "Joachim Kleinke analysiert..." oder "Wir analysieren..." (konsistent mit dem Rest der Seite, wo Joachim namentlich genannt wird)

**H3: Lead-Magnet-Seiten — Umlaute fehlen durchgehend (oe statt oe)**
- Alle 3 Lead-Magnet-Seiten + deren start-Subpages nutzen ASCII statt UTF-8 Umlaute
- "Persoenlich", "fuer", "Gespraech", "zugeschnitten" etc. — das sieht der Besucher!
- Betrifft: aktionsplan-erbengemeinschaft, 90-tage-blueprint, entscheidungskompass-betreuung
- **Fix:** Alle `oe` -> `ö`, `ue` -> `ü`, `ae` -> `ä` in sichtbarem Content ersetzen

**H4: `btn-outline` CSS doppelt definiert**
- `investoren.astro` Zeile 162-183 und `so-funktionierts.astro` Zeile 175-196 definieren identischen `.btn-outline` Style
- Code-Duplikation — sollte in global.css oder shared component
- **Fix:** `.btn-outline` in global.css aufnehmen

**H5: Form-Endpoints — keine Validierung ob Honeypot-Feld leer**
- Homepage Bewertungsform hat ein Honeypot-Feld (`name="website"`), aber der JS-Handler prueft nicht ob es leer ist
- Forms senden an `/api/bewertung`, `/api/investor`, `/api/lead-magnet` — Server-seitige Honeypot-Pruefung noetig
- **Fix:** In den API-Routes pruefen ob `website` Feld leer ist

**H6: `font-variant-numeric: tabular-nums` fehlt**
- tokens.md erwaehnt tabular-nums nicht, und global.css setzt es nirgends
- Der ROI-Rechner zeigt Zahlen (Eurobetraege) die bei Aenderung springen wuerden
- Stats-Bar auf Homepage hat grosse Zahlen ohne tabular-nums
- **Fix:** `.stat__number, .roi-result-val { font-variant-numeric: tabular-nums; }` in global.css

### MEDIUM

**M1: rgba() Hardcodes statt CSS Variables fuer Shadows in Seiten-Styles**
- 22 Stellen in .astro-Dateien nutzen inline `rgba(15, 23, 42, ...)` und `rgba(59, 130, 246, ...)` statt `var(--shadow-*)` oder `var(--color-accent-light)`
- global.css definiert `--shadow-sm/md/lg/accent` korrekt — die Seiten-Styles duplizieren diese Werte
- Betrifft: investoren.astro (6x), roi-rechner.astro (6x), index.astro (3x), so-funktionierts.astro (1x), Footer.astro (1x), stadtteil.astro (1x)
- Nicht BLOCKER weil die Werte korrekt sind, aber DRY-Verletzung

**M2: `bewertung-card` shadow ist 3-Layer Custom statt `--shadow-lg`**
- `index.astro` Zeile 769-772: Custom 3-Layer-Shadow statt `var(--shadow-lg)` aus tokens
- Ebenso `inv-form-card` und `roi-inputs-card`
- Konsistenz-Problem: Manche Cards nutzen `var(--shadow-lg)`, andere definieren eigene

**M3: Footer verlinkt /impressum und /datenschutz — existieren, aber mit Platzhaltern (siehe B2)**

**M4: `btn-dark` nur in investoren.astro definiert**
- Kein globaler Button-Style, nur lokal in investoren.astro
- Wenn andere Seiten diesen Stil brauchen, muss er dupliziert werden

**M5: Homepage-Form hat `data-endpoint="/api/bewertung"` aber kein `action` oder `method` Attribut**
- JS uebernimmt, aber ohne JS funktioniert das Form nicht (graceful degradation fehlt)

**M6: Stadtteil-Seite nutzt `set:html` fuer fliesstext**
- `[...stadtteil].astro` Zeile 156: `<div class="st-text-body" set:html={data.fliesstext} />`
- Wenn JSON-Daten aus externer Quelle kommen, ist das ein XSS-Risiko
- Aktuell sind die JSON-Dateien lokal und kontrolliert — trotzdem Sanitization empfohlen

**M7: Stadtteil JSON-LD referenziert `wirkaufendeineimmobilie.build-upstream.com`**
- Die URL im JSON-LD zeigt auf die Staging-Domain, nicht die finale Domain
- Datei: `[...stadtteil].astro`, Zeile 71 und 83-89
- Ebenso in `Layout.astro`, Zeile 28

**M8: Telefonnummer nicht verifiziert**
- `0341 — 800 900 0` bzw. `+49-341-800-900-0` erscheint auf Nav, Footer, JSON-LD
- Ist das eine echte Nummer? Sieht nach Platzhalter aus (zu runde Nummer).

### LOW

**L1: Keine `prefers-color-scheme` / Dark Mode**
- Kein Dark Mode implementiert — nicht erwartet fuer dieses Projekt, aber worth noting

**L2: `.form-group` doppelt definiert in investoren.astro und index.astro**
- Identische Styles, sollte in global.css leben

**L3: Lead-Magnet-Seiten haben identischen CSS-Block**
- aktionsplan-erbengemeinschaft, 90-tage-blueprint, entscheidungskompass-betreuung haben Copy-Paste CSS
- Sollte als shared Stylesheet oder Astro-Component extrahiert werden

**L4: OG-Image ist `/og-default.svg`**
- SVG als OG-Image ist nicht von allen Plattformen supported
- Empfehlung: PNG/JPG OG-Image mit 1200x630px

**L5: Kein `aria-hidden="true"` auf dekorativen SVGs in Lead-Magnet-Seiten**
- aktionsplan/90-tage/entscheidungskompass SVGs haben kein aria-hidden
- Alle anderen Seiten machen das korrekt

---

## Screenshots

### Desktop (1440x900)

**Homepage** (`/tmp/nexus-final-home.png`):
- Nav: Logo korrekt (wirkaufen**deine**immobilie, "deine" in Accent-Blau), Telefon-Pill, CTA-Button
- Hero: Clean, zentriert, PLZ-Input mit grossem CTA-Button, Trust-Badges darunter
- Stats-Bar: 48h / 0EUR / 100% / 35+ — klar, gut lesbar
- Visuell professionell, kein AI-Slop-Eindruck

**Investoren** (`/tmp/nexus-final-investoren.png`):
- Hero mit 2 CTAs (Primary + Outline)
- 3 Benefit-Cards mit Icon-Boxen — konsistentes Layout
- Clean und professionell

**So funktioniert's** (`/tmp/nexus-final-sofunkt.png`):
- Tab-Switch (Verkaeufer/Kaeufer) gut sichtbar, Verkaeufer aktiv
- 3 Schritt-Cards mit grossen Nummern
- Tabs haben focus-visible und ARIA

**ROI-Rechner** (`/tmp/nexus-final-roi.png`):
- 2-Column Split: weisser Input-Card links, dunkler Results-Card rechts (sticky)
- Zahlen werden korrekt berechnet (106.825 EUR / 34.250 EUR Netto / 32.1% ROI)
- Results-Card hat klare visuelle Hierarchie

**Stadtteil Volkmarsdorf** (`/tmp/nexus-final-stadtteil.png`):
- Breadcrumb korrekt (Home > Leipzig > Volkmarsdorf)
- Label-Badge "OST - LEIPZIG" korrekt
- 4 Markt-Daten-Cards mit Werten
- Quellenangabe sichtbar

**Aktionsplan Erbengemeinschaft** (`/tmp/nexus-final-aktionsplan.png`):
- 3-Schritt-Prozess mit Icons
- "Jetzt starten" CTA prominent
- ABER: Umlaute fehlen — "Persoenlich erstellt", "fuer", "Dafuer" sichtbar im Screenshot

### Mobile (390x844)

**Homepage Mobile** (`/tmp/nexus-final-home-mobile.png`):
- Burger-Menu korrekt sichtbar
- Hero stacked korrekt (PLZ-Input -> Button untereinander)
- Trust-Badges vertikal gestapelt
- Touch-Targets >= 44px (Button, Input)
- Responsive funktioniert gut

---

## Brand Guardian Score

| Dimension | Score | Details |
|-----------|-------|---------|
| Typography | 19/20 | Outfit durchgehend, korrekte Hierarchie, fluid clamp(). -1: tabular-nums fehlt |
| Color | 17/20 | CSS Variables konsistent genutzt, Token-Widerspruch (B1), rgba Hardcodes in Shadows (M1) |
| Voice | 16/25 | Premium-Du durchgehend, kein "wir kaufen", ABER "Unsere Experten" Fantasy (H2), Umlaut-Fehler (H3) |
| Visual Consistency | 19/20 | Spacing konsistent, Sections abwechselnd bg/bg-alt, Shadows layered. -1: Trust-Card Platzhalter-Bild |
| Design System | 13/15 | tokens.md vorhanden + ausfuehrlich, Anti-Slop bestanden, -2: Token-Widerspruch + Shadow-Duplikation |

**BRAND_SCORE: 84/100 — INKONSISTENZEN**

---

## Anti-Slop QC

- [x] Keine verbotenen Fonts (Outfit ist approved)
- [x] Keine AI-Farbpalette (Slate + Blau ist klassisch, nicht purple/cyan)
- [x] Kein pure #000 / #fff — bg ist #FAFBFC (getinted), text ist #0F172A
- [x] Kein gray text auf farbigen Hintergruenden
- [x] Keine identischen Card-Grids endlos wiederholt — Variation vorhanden
- [x] Keine Cards in Cards
- [ ] Hero Metric Layout: Stats-Bar kommt dem nahe (grosse Zahl + Label), aber ist hier funktional korrekt
- [x] Keine Glassmorphism-Dekoration
- [x] Keine Gradient-Text-Headlines
- [x] Layered Shadows (2+ Layer) durchgehend
- [ ] States: Empty/Error/Loading fuer Forms nur teilweise (Button-Text-Change, kein Error-State-Design)
- [x] CSS Variables fuer alle Farben (ausser Shadows in Seiten-Styles)
- [x] Meaningful Whitespace mit section-gap Variation
- [ ] font-variant-numeric: tabular-nums fehlt
- [x] AI Slop Test: Seite wirkt NICHT nach AI — professionell, distinktiv

---

## Reality Checker — Copy-Konsistenz

**Vermittlungsmodell konsistent?**
- Homepage: "wir finden Kaeufer" / "wir vermitteln" -- KORREKT
- Investoren: "Off-Market Zugang" / "kuratiert" -- KORREKT
- So funktioniert's: "Wir starten das Angebotsverfahren" -- KORREKT
- Stadtteil: "Sanierungsbeduerfte Wohnung verkaufen" -- KORREKT
- Lead-Magnets: "Unsere Experten" -- PROBLEMATISCH (siehe H2)

**"Wir kaufen" Check:** BESTANDEN — nirgends steht "wir kaufen deine Immobilie" (trotz Markenname)

**Premium-Du durchgehend?** JA — "deine", "du", "dir" konsistent

**Platzhalter:** Impressum (5x), Datenschutz (2x), Trust-Card Bild (1x), Telefonnummer (1x fraglich)

**Fantasy-Check:**
- "35+ Jahre Erfahrung" — Joachim Kleinke, plausibel
- "Erstbewertung in 48h" — wird als Versprechen dargestellt, keine Einschraenkung
- "Unsere Experten" — Welche? Team existiert nicht in dieser Groesse. FANTASY.
- "Taeglich neue Off-Market Deals" (investoren.astro) — unbelegte Behauptung

**Interne Links:** Alle geprueft, alle Seiten existieren (danke.astro, impressum.astro, datenschutz.astro, alle Start-Seiten, alle Stadtteil-JSONs)

---

## Self-Disprove Check

**Staerkstes PASS-Argument:**
Build clean, Design konsistent und professionell, CSS Token-System sauber implementiert, responsive funktioniert, keine verbotenen Fonts, alle Links funktional, korrekte ARIA auf Tabs/Nav/Burger, JSON-LD vorhanden, Canonical URLs gesetzt.

**Haelt es?** NEIN — Impressum-Platzhalter (Legal Blocker), Token-Widerspruch, Umlaut-Fehler auf 3 Lead-Magnet-Seiten (sichtbar fuer Besucher), "Unsere Experten" Fantasy-Copy.

---

## FINAL VERDICT: NEEDS WORK

**Gruende:**
1. **B1:** Token-Widerspruch verletzt Single Source of Truth
2. **B2:** Impressum/Datenschutz-Platzhalter = Legal-Risiko
3. **H2:** "Unsere Experten" Fantasy-Copy auf 3 Lead-Magnet-Seiten
4. **H3:** Fehlende Umlaute auf 3+ Seiten — sichtbar fuer Besucher

**Naechste Schritte (priorisiert):**
1. B2 fixen: Impressum + Datenschutz mit echten Firmendaten fuellen
2. B1 fixen: tokens.md ODER global.css anpassen (--color-text-mid)
3. H3 fixen: Umlaute auf allen Lead-Magnet-Seiten korrigieren
4. H2 fixen: "Unsere Experten" durch "Joachim Kleinke" / "Wir" ersetzen
5. H1 fixen: Trust-Card Platzhalter-Bild durch echtes Foto ersetzen
6. H6 fixen: tabular-nums fuer Zahlen-Elemente
7. M1-M8: Shadow-Hardcodes zentralisieren, btn-outline/btn-dark/form-group in global.css, JSON-LD Domain korrigieren
