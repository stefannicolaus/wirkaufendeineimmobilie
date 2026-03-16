# NEXUS V3 Pipeline — Homepage Final Check

> Datum: 2026-03-16
> Seite: index.astro + Nav.astro + Footer.astro + Layout.astro + global.css
> Stack: Astro, CSS Custom Properties, kein Tailwind

---

## Brand Guardian: NEEDS WORK

### Typography: KONSISTENT
- Outfit durchgehend als einziger Font via `--font-family` CSS Variable
- Lokal gehostet (`/fonts/outfit.woff2`), DSGVO-konform
- Keine verbotenen Fonts gefunden (kein Inter, Roboto, Arial, Geist, Space Grotesk)
- Variable Font (300-800) korrekt geladen
- Fluid Type Scale mit clamp() implementiert

### Farben: FAST KONSISTENT — 2 Hardcodes gefunden

**BLOCKER: Hardcodierte Hex-Werte in index.astro (Scoped Styles)**
1. `background: #334155;` (Zeile 477, `.card__icon-box--dark`) — sollte `var(--color-primary-muted)` sein
2. `color: #F59E0B;` (Zeile 628, `.trust-card__stars`) — sollte `var(--color-warning)` sein

**SUGGESTION: tokens.md vs global.css Diskrepanz**
- tokens.md definiert `--color-text-mid: #64748B`
- global.css setzt `--color-text-mid: #475569`
- Unterschiedliche Werte! CSS ist dunkler (Slate 600 vs Slate 500). Einer muss korrigiert werden. Da CSS die SSoT zur Laufzeit ist, sollte tokens.md angepasst werden — oder umgekehrt.

**SUGGESTION: Bewertungs-Section nutzt rgba Hardcode**
- `background: rgba(59, 130, 246, 0.05);` (Zeile 747) — koennte als CSS Variable definiert werden

**SUGGESTION: Bewertungs-Card Shadow ist inline statt Variable**
- Zeile 763-766: Drei-Layer Shadow ist hardcodiert statt `var(--shadow-lg)` oder eine eigene Variable

### Logo: PASS
- `wirkaufen[deine]immobilie` korrekt: "deine" in `.logo-accent` (accent color), Rest in primary
- Lowercase durchgehend, keine Leerzeichen, keine Punkte
- Nav: 20px, Footer: 20px (konsistent)
- Footer auf dunklem Hintergrund: korrekt `--color-text-on-dark` + accent

### Shadows: PASS
- Layered Shadows (2+ Layer) durchgehend: `--shadow-sm`, `--shadow-md`, `--shadow-lg`, `--shadow-accent`
- Alle in `:root` definiert als CSS Variables
- Korrekt ambient + direct Layers

### Anti-Slop QC
- [x] Keine verbotenen Fonts
- [x] Keine purple/blue Gradients auf weissem Hintergrund
- [x] Kein pure #000 — tinted neutrals (Slate-Palette)
- [x] Layered Shadows
- [ ] Kein pure #fff — `--color-bg-card: #FFFFFF` und `--color-text-on-accent: #FFFFFF` sind pure white. SUGGESTION: auf #FEFEFE oder #FDFDFE tinten
- [x] CSS Variables fuer fast alle Farben (2 Ausnahmen oben)
- [x] Kein gray text auf farbigen Hintergruenden
- [x] Keine identischen Card-Grids (Dual Cards sind bewusst verschieden: Seller=hell, Buyer=dunkel)
- [x] Kein Hero Metric Template (Stats-Bar ist separat, nicht im Hero)
- [ ] `font-variant-numeric: tabular-nums` fehlt auf Stats-Bar Zahlen — SUGGESTION

### Volle Breite (Hintergruende): PASS
- Hero: volle Viewport-Breite (default body bg)
- Stats-Bar: `background: var(--color-bg-alt)` + Borders — volle Breite
- Steps: `background: var(--color-bg-alt)` — volle Breite
- FAQ: `bg-alt` Klasse — volle Breite
- Bewertung: `rgba(59, 130, 246, 0.05)` — volle Breite
- Footer: `var(--color-bg-dark)` — volle Breite
- Trust-Section: **KEIN eigener Hintergrund** — default body bg (#FAFBFC). Optisch okay, aber koennte staerker kontrastieren. NIT.
- Stadtteile-Section: **KEIN eigener Hintergrund** — default body bg. NIT.

### BRAND_SCORE: 79/100
| Dimension | Score | Max | Details |
|-----------|-------|-----|---------|
| Typography | 19 | 20 | tabular-nums fehlt |
| Color | 14 | 20 | 2 Hardcodes, tokens/CSS Diskrepanz, pure white |
| Voice | 22 | 25 | Vermittlungsmodell korrekt, "wir finden" statt "wir kaufen" |
| Visual Consistency | 18 | 20 | Trust + Stadtteile ohne eigenen Hintergrund |
| Design System | 6 | 15 | tokens.md/CSS Diskrepanz, einige Hardcodes |

---

## Code Reviewer: NEEDS WORK

### BLOCKER

**Form "typ" Feld wird nicht ans Backend gesendet**
Datei: `src/pages/index.astro`, Zeile 241-270 + `src/pages/api/bewertung.ts`
```
// bewertung.ts liest:
typ: data.get('typ'),   // ← FEHLT im submission object!
```
Tatsaechlich: `bewertung.ts` Zeile 11 fehlt `typ` komplett. Das `select` Feld fuer "Art der Immobilie" wird gesammelt aber im Backend NICHT gespeichert.

**API Endpoint hat kein Rate Limiting / CSRF Protection**
Datei: `src/pages/api/bewertung.ts`
- Kein CSRF Token
- Kein Rate Limiting
- Kein Honeypot-Feld gegen Bots
- Schreibt direkt ins Filesystem — bei Spam-Attacke werden tausende JSON-Dateien erzeugt

### SUGGESTION

**Heading-Hierarchie: H2 nach sr-only Skip**
Datei: `src/pages/index.astro`, Zeile 78-79
- `<h2 class="sr-only">Verkaufen oder Investieren</h2>` gefolgt von `<h3>` in den Cards — das ist korrekt.
- Aber: Trust-Section hat direkt `<h2>` — Hierarchie konsistent.

**Hero PLZ Input fehlt `<form>` Wrapper**
Datei: `src/pages/index.astro`, Zeile 26-42
- Das Hero-PLZ-Feld ist kein `<form>` — es nutzt JS `click` Handler. Kein `Enter`-Key-Support zum Abschicken.
- Fix: In `<form>` wrappen oder `keydown` Event auf Enter hinzufuegen.

**Fehlende Input-Validierung im Frontend**
- Bewertungs-Formular: PLZ-Feld hat `pattern="[0-9]{5}"` — aber keine custom Fehlermeldung. Browser-Default ist unschoeen.
- Email-Feld hat `required` aber keine Validierung ob es eine echte Email-Domain ist.

**Magic Numbers in Scoped Styles**
- `padding: 40px` (Zeile 434, .card) — sollte `var(--space-10)` sein
- `padding: 48px` (Zeile 604, .trust-card) — sollte `var(--space-12)` sein
- `padding: 32px` (Zeile 669, .trust-card mobile) — sollte `var(--space-8)` sein
- `padding: 32px` (Zeile 762, .bewertung-card) — sollte `var(--space-8)` sein
- `border-radius: 12px` (Zeile 319, .hero-form-card) — sollte `var(--radius-md)` oder `var(--radius-lg)` sein
- `border-radius: 16px` (Zeile 762, .bewertung-card) — sollte `var(--radius-lg)` sein
- `font-size: 120px` (Zeile 551, .step__num) — kein Token, aber als dekoratives Element akzeptabel
- `padding: 8px` (Zeile 320, .hero-form-card) — sollte `var(--space-2)` sein
- `gap: 8px` (Zeile 329, .hero-form-card__inner) — sollte `var(--space-2)` sein
- `gap: 2px` (Zeile 628, .trust-card__stars) — akzeptabel fuer Icon-Gap

**Performance: prefers-reduced-motion vorhanden**
- global.css respektiert `prefers-reduced-motion: reduce` — PASS

**Semantik: Landmarks korrekt**
- `<header>` (Nav), `<main>` (Content), `<footer>` (Footer) — PASS
- `<nav aria-label="Hauptnavigation">` — PASS
- Skip-to-content Link vorhanden — PASS

### NIT

**Footer border-top nutzt rgba statt Variable**
- `border-bottom: 1px solid rgba(255, 255, 255, 0.1);` — koennte eine CSS Variable sein

**Empty style rule**
- `global.css` Zeile 195-196: `p { }` — leere Regel, sollte entfernt werden

**TypeScript casts in Astro Script**
- `as HTMLInputElement` casts im Script-Block sind korrekt fuer Astro.

### Positiv
- Semantisches HTML mit korrekten Landmarks
- Accessibility: Skip-Link, aria-labels, aria-hidden auf dekorativen SVGs, min-height 44px auf interaktiven Elementen
- Mobile-responsive mit sinnvollen Breakpoints
- `scroll-behavior: smooth` mit reduced-motion Fallback
- Kein JS-Framework, kein jQuery, kein DOM-Manipulation-Antipattern
- Form Submit mit async/await und Error Handling
- Focus-visible statt outline:none

---

## Evidence Collector: Screenshots

### Desktop (1440x900)
- **Nav:** Sticky, weisser Hintergrund. Logo links mit "deine" in Blau — korrekt. Phone-Button in hellblau Pill, CTA "Immobilie bewerten" in solidem Blau. Sauber.
- **Hero:** Zentriert. Label-Pill mit gruenem Dot + Uppercase Text. H1 gross, "den richtigen Kaeufer" in Accent-Blau. Sub-Text in Mid-Gray. PLZ-Eingabefeld als prominente Karte mit Location-Icon und blauem CTA-Button. Trust-Badges darunter. Alles visuell clean.
- **Stats-Bar:** 4-Spalten Grid, grosse Zahlen in Slate-Dark, Labels in Mid-Gray. Volle Breite mit hellem Hintergrund. Sieht professionell aus.
- **Dual Cards:** Seller-Card hell mit blauem Icon-Box, Buyer-Card dunkel (Slate). Beide mit Checkmark-Listen. Guter Kontrast. Cards sind nicht identisch — Anti-Slop konform.
- **Steps:** Grosse dekorative Nummern (01, 02, 03) mit niedriger Opacity in Blau. Icons + Headlines zentriert. Clean.
- **Trust-Card:** Horizontale Karte mit rundem Platzhalter-Gradient (!) links, 5 goldene Sterne, Zitat, Autor. Platzhalter-Bild ist sichtbar als Gradient-Kreis — kein echtes Foto.
- **FAQ:** Accordion-Items mit Plus-Icon, sauber gestyled auf hellem Hintergrund.
- **Stadtteile:** Pills mit Stadtteilnamen, zentriert, hover-faehig.
- **Bewertung:** Formular auf leicht blau getintetem Hintergrund. Card mit Shadow. 5 Felder + Submit-Button.
- **Footer:** Dunkel (Slate), 4-Spalten Layout. Logo, Tagline, Phone. Navigations-Spalten. Legal-Zeile.

### Mobile (390x844)
- **Nav:** Logo + Burger-Menu. Sauber.
- **Hero:** Zentriert, PLZ-Feld und Button stacked vertikal. Trust-Badges vertikal gestapelt. Funktioniert.
- **Stats-Bar:** 2x2 Grid. Zahlen gut lesbar.
- **Dual Cards:** Gestackt. Seller oben, Buyer unten. Korrekt.
- **Steps:** Vertikal, Nummern kleiner (80px). Funktioniert.
- **Trust-Card:** Vertikal gestackt, zentriert. Gradient-Platzhalter kleiner.
- **FAQ:** Volle Breite, gut lesbar.
- **Formular:** 1-Spaltig. Alle Felder erreichbar.
- **Footer:** 1-Spaltig. Alle Links sichtbar.

### Kritische Beobachtungen aus Screenshots
1. **Trust-Card Platzhalter-Bild** ist deutlich als generischer Gradient sichtbar — kein echtes Foto von Joachim Kleinke. Das untergräbt die Trust-Wirkung massiv.
2. **Kein Scroll-Indikator** oder visuelles Element das signalisiert "hier geht's weiter" nach dem Hero.
3. **Stadtteile-Section wirkt duenn** — nur 5 Pills, koennte mehr Substanz vertragen.

---

## Reality Checker: NEEDS WORK

### Vermittlungsmodell-Check
- [x] Kein "wir kaufen" in der Copy — korrekt, es heisst "wir finden Kaeufer" / "wir vermitteln"
- [x] Hero-Sub: "wir finden Kaeufer, die genau das suchen" — Vermittlung, nicht Ankauf
- [x] FAQ: "Vermittlungsprovision" erwaehnt — korrekt
- [x] Dual Cards: "wir vermitteln an Kaeufer" — korrekt
- [x] JSON-LD: "Vermittlungsplattform" — korrekt
- **ABER:** Der Title-Tag sagt "Sanierungsbedürftige Immobilien **vermitteln**" — das passt zum Modell. Gut.

### Stats-Bar Zahlen: TEILWEISE BELEGBAR
- **48h Erstbewertung:** Service-Versprechen, belegbar durch Geschaeftsprozess. OK.
- **0EUR fuer die Bewertung:** Stimmt mit FAQ ueberein ("Bewertung und Angebotsverfahren sind kostenlos"). OK.
- **100% Diskretion:** Marketing-Claim, nicht quantifizierbar. SUGGESTION: Konkreter formulieren.
- **35+ Jahre Erfahrung:** Bezieht sich auf Joachim Kleinke. Stimmt mit Trust-Card ueberein. Sollte validiert werden (Joachim bestaetigen lassen).

### Trust-Section: BLOCKER — PLATZHALTER
- **Kein echtes Foto** von Joachim Kleinke — nur ein Gradient-Kreis (`linear-gradient(135deg, var(--color-accent-light), var(--color-accent))` mit `opacity: 0.6`)
- Das ist ein **Trust-Killer**: Ein Testimonial ohne echtes Foto wirkt unglaubwuerdig
- Das Zitat ist generisch formuliert ("Fingerspitzengefuehl und ein starkes Netzwerk") — koennte staerker sein
- **Fix:** Echtes Foto von Joachim Kleinke einbinden. Ohne Foto ist die Trust-Section kontraproduktiv.

### Formular: FUNKTIONAL MIT EINSCHRAENKUNGEN
- Form submitted an `/api/bewertung` — Endpoint existiert, gibt 200 zurueck
- **BLOCKER:** `typ` Feld (Art der Immobilie) wird im Backend NICHT gespeichert (fehlt im submission Object)
- Redirect nach Submit geht zu `/danke?typ=verkaeufer` — Seite existiert (200)
- Kein Honeypot, kein CSRF — Spam-Anfaellig

### Interne Links: PASS
Alle internen Links auf der Homepage + Nav + Footer fuehren zu existierenden Seiten:
- `/so-funktionierts` → 200
- `/investoren` → 200
- `/roi-rechner` → 200
- `/impressum` → 200
- `/datenschutz` → 200
- `/aktionsplan-erbengemeinschaft` → 200
- `/entscheidungskompass-betreuung` → 200
- `/90-tage-blueprint` → 200
- `/leipzig/volkmarsdorf` → 200
- `/leipzig/plagwitz` → 200
- Alle weiteren Stadtteil-Links → 200
- `/#bewertung` → Anchor auf gleicher Seite → OK
- `tel:+493418009000` → Telefon-Link → OK

### SEO/Meta: PASS
- Title-Tag gesetzt
- Meta Description gesetzt
- Canonical URL generiert
- OG Tags komplett (type, title, description, url, image, locale, site_name)
- Twitter Cards komplett
- JSON-LD: RealEstateAgent + Person (Joachim Kleinke)
- `lang="de"` auf HTML-Element
- Favicon vorhanden

### Self-Disprove Check
**Staerkstes PASS-Argument:** Build ist clean. Alle Links funktionieren. Copy ist konsistent mit dem Vermittlungsmodell. Design-System ist zu 90% sauber implementiert. Mobile + Desktop sehen professionell aus.
**Haelt es?** NEIN — wegen Trust-Platzhalter-Bild und Backend-Bug (typ nicht gespeichert). Beides sind substantielle Issues die vor Go-Live gefixt werden muessen.

---

## FINAL VERDICT: NEEDS WORK

### Blocker (muessen gefixt werden)
1. **Trust-Section: Kein echtes Foto** — Gradient-Platzhalter ist ein Trust-Killer. Echtes Foto von Joachim Kleinke noetig.
2. **Backend-Bug: `typ` Feld nicht gespeichert** — Art der Immobilie geht verloren
3. **2 hardcodierte Hex-Werte** in index.astro (`#334155`, `#F59E0B`) — muessen CSS Variables nutzen
4. **Kein Spam-Schutz** auf Bewertungs-Formular — mindestens Honeypot-Feld

### Should-Fix (vor Launch)
5. tokens.md vs global.css: `--color-text-mid` Diskrepanz (#64748B vs #475569)
6. Magic Numbers in Scoped Styles (40px, 48px, 32px, 12px, 8px) statt CSS Variables
7. Hero PLZ: Enter-Key Support fehlt (kein `<form>` Wrapper)
8. `--color-bg-card: #FFFFFF` ist pure white — tinten auf mindestens #FEFEFE
9. `font-variant-numeric: tabular-nums` auf Stats-Bar
10. Leere `p {}` Regel in global.css entfernen

### Nits
11. Trust + Stadtteile Sections ohne eigenen Hintergrund (optisch okay, aber koennte staerker kontrastieren)
12. Footer rgba Border koennte CSS Variable sein
13. Bewertungs-Section rgba Hintergrund koennte Variable sein

**Zusammenfassung:** Die Homepage ist technisch solide gebaut, visuell professionell und copy-seitig konsistent mit dem Vermittlungsmodell. Aber das Platzhalter-Bild in der Trust-Section und der Backend-Bug beim Formular sind showstopper fuer Go-Live. Die hardcodierten Hex-Werte und Magic Numbers verletzen das Design-System und muessen aufgeraeumt werden.
