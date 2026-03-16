# NEXUS Reality Check — wirkaufendeineimmobilie.de

> Datum: 16.03.2026
> Pruefer: NEXUS Reality Checker
> Projekt: wirkaufendeineimmobilie.de
> Pfad: ~/code/brown2green/website/
> Build: PASS (Astro 6, standalone node)

---

## VERDICT: NEEDS WORK

---

### BLOCKER (muessen vor Go-Live gefixt werden)

#### B1: FUNDAMENTALER MESSAGING-WIDERSPRUCH — "wir kaufen" vs. Vermittlungsplattform

**Schweregrad: KRITISCH — rechtlich + strategisch**

Die Website sagt auf der Startseite ZWEI MAL "wir kaufen":
- Hero: "wir kaufen im Ist-Zustand"
- Dual-Card: "wir kaufen alles im Ist-Zustand"

Das ist FALSCH. Laut PROJECT.md und MARKETING-KONZEPT.md ist brown2green eine **Vermittlungsplattform** (§34c GewO), KEIN Ankaeufer. Joachim hat das explizit so definiert:
> "Wir haben eigentlich eine Plattform, wo ganz viele kleine Investoren, kleine Handwerker und kleiner Eigentuemer zusammenkommen."

Auch in der Wettbewerbsmatrix: "brown2green = Vermittler + geschl. Verfahren"

**Warum Blocker:**
1. Rechtsrisiko: "Wir kaufen" suggeriert iBuyer-Modell. Wenn ein Verkaeufer sich darauf beruft, ist das ein Problem.
2. Erwartungs-Mismatch: Verkaeufer erwartet Sofortangebot von brown2green, bekommt stattdessen Vermittlung an Investoren.
3. Verfahren auf der Seite /so-funktionierts widerspricht dem Hero-Claim direkt.

**Betroffen:** `src/pages/index.astro` Zeile 21, 75. Auch Hero-Sub "wir kaufen im Ist-Zustand", Dual Card "wir kaufen alles im Ist-Zustand".

**Fix:** Ersetzen durch Vermittlungs-Sprache aus dem Marketing-Konzept:
- "Wir verkaufen Ihre Wohnung im Ist-Zustand — an gepruefte Kaeufer."
- "Sanierungsbeduerftig? Genau unsere Kaeufer."

---

#### B2: BRAND-PREVIEW "wir kaufen" im Domain-Namen vs. Vermittler-Modell

Die Domain selbst — **wirkaufendeineimmobilie.de** — sagt "wir kaufen". Das verstaerkt den Widerspruch aus B1 massiv. Die gesamte Marke suggeriert Ankauf, nicht Vermittlung.

**Status:** Strategische Entscheidung fuer Stefan + Joachim. Entweder:
- A: Domain behalten und auf JEDER Seite kristallklar machen, dass vermittelt wird (nicht gekauft)
- B: Domain anpassen (wirklich wirkaufendeineimmobilie.de wenn man nur vermittelt?)

Das ist kein technischer Fix — das ist eine Branding-Entscheidung. Aber es MUSS vor Go-Live geklaert werden.

---

#### B3: FEHLENDE DATEIEN — favicon.svg + og-default.jpg

- `favicon.svg` wird in Layout.astro referenziert — existiert NICHT in /public/
- `og-default.jpg` wird als OG-Image Default verwendet — existiert NICHT in /public/
- Jeder Share auf Social Media zeigt ein kaputtes Bild

**Fix:** Dateien erstellen. Favicon = "WDI" in Accent auf Primary-Quadrat (laut tokens.md). OG-Image = Logo zentriert auf Primary-Hintergrund.

---

#### B4: IMPRESSUM IST KOMPLETT PLATZHALTER — RECHTSVERSTOSS

Das Impressum (`src/pages/impressum.astro`) enthaelt ausschliesslich Platzhalter:
- `[Firmenname — Platzhalter]`
- `[Strasse Nr.]`
- `[PLZ Ort]`
- `[Name des Vertretungsberechtigten]`
- `[E-Mail-Adresse — Platzhalter]`
- `[Erlaubnisbehoerde — Platzhalter]`
- `[Nummer — Platzhalter]`
- `[Versicherungsunternehmen — Platzhalter]`

**Eine Website mit Kontaktformularen ohne vollstaendiges Impressum ist ein Abmahnrisiko nach §5 TMG.**

---

#### B5: DATENSCHUTZERKLAERUNG — VERANTWORTLICHER FEHLT

Gleich wie B4: Der "Verantwortliche" in der Datenschutzerklaerung ist komplett Platzhalter. DSGVO-Verstoss.

---

#### B6: TELEFONNUMMER NICHT VERIFIZIERT

Die Nummer `0341 — 800 900 0` erscheint auf JEDER Seite (Nav, Footer, Danke-Seite).

**Frage an Stefan/Joachim:** Ist diese Nummer aktiv? Geht jemand ran? Wenn nicht, ist das eine massive Trust-Zerstoerung wenn potenzielle Verkaeufer anrufen und ins Leere laufen.

---

### HIGH (sollten bald gefixt werden)

#### H1: HERO-FORM SENDET NUR PLZ — KEIN ECHTER LEAD

Das Hero-Formular fragt NUR nach der PLZ und sendet an `/api/bewertung`. Die API speichert:
```json
{ "plz": "04315", "name": null, "email": null, "telefon": null }
```

Ein Lead OHNE E-Mail oder Telefon ist wertlos. Der User wird nach Submit zu /danke weitergeleitet, hat aber keine Kontaktdaten hinterlassen. Der einzige nutzbare Submit ist das volle Formular unten auf der Seite.

**Fix:** Entweder PLZ-Form leitet zu #bewertung (Scroll zum vollen Formular) statt API-Call, ODER E-Mail-Feld ins Hero-Form einbauen.

---

#### H2: MARKETING-KONZEPT §5.2 — FEHLENDE SEITENSTRUKTUR-ELEMENTE

Aus dem empfohlenen Konzept fehlen auf der Website komplett:

| Element | Status |
|---------|--------|
| 3 Pfade im Hero ("Eigentuemer / Handwerker / Makler") | FEHLT — nur 2 Dual Cards, kein Makler-Pfad |
| Property Cards im Hero (Auction.com Pattern) | FEHLT — keine aktuellen Objekte |
| ROI-Rechner auf Startseite (Section 3) | FEHLT — nur eigene Seite, nicht inline |
| Vorteile nach Rolle (Section 4) | TEILWEISE — Dual Cards, aber nicht nach PropNow-Pattern |
| Aktuelle Objekte / Pipeline (Section 7) | FEHLT |
| Case Study Vorher-Nachher MIT Zahlen | FEHLT |
| Partner-Logos | FEHLT |

**Bewertung:** Vieles davon kann nicht vor MVP existieren (keine Objekte in Pipeline = keine Property Cards). Aber der 3. Pfad "Makler" fehlt komplett, obwohl das Marketing-Konzept Makler als eigenen ICP (V5) fuehrt.

---

#### H3: KEIN SITEMAP KONFIGURIERT

`robots.txt` verweist auf `sitemap-index.xml`, aber Astro hat KEIN Sitemap-Plugin konfiguriert (`@astrojs/sitemap` nicht installiert). Google bekommt 404 beim Sitemap-Crawl.

**Fix:** `npm install @astrojs/sitemap` + in astro.config.mjs einbinden.

---

#### H4: KEIN GA4 TRACKING

Laut Stefans universellen Anforderungen (MEMORY.md) ist GA4 PFLICHT fuer jede Website. Kein Tracking-Code eingebunden.

---

#### H5: GOOGLE FONTS DATENSCHUTZ-RISIKO

Die Website laedt Google Fonts extern (`fonts.googleapis.com`). Seit dem EuGH-Urteil zur DSGVO-Konformitaet ist das in Deutschland problematisch. Die Datenschutzerklaerung erwaehnt es zwar korrekt, aber:
- Besser: Fonts lokal hosten (self-hosting via fontsource oder manueller Download)
- Aktuell: Jeder Pageload sendet die IP des Users an Google

---

#### H6: API ENDPOINTS — KEINE E-MAIL-BENACHRICHTIGUNG

Alle 3 API-Endpoints (`/api/bewertung`, `/api/investor`, `/api/guide`) schreiben nur JSON-Dateien auf die Festplatte. Es gibt:
- Keine E-Mail-Benachrichtigung an Joachim/Stefan
- Keine Auto-Reply an den User
- Keine Anbindung an ein CRM oder Brevo

Im Containerized Deployment (Docker/Coolify) gehen diese Dateien bei jedem Redeploy verloren.

**Fix:** Mindestens E-Mail-Notification (Brevo MCP ist verfuegbar) + persistenter Storage.

---

### MEDIUM (nice to have)

#### M1: TRUST-SECTION IST PLATZHALTER

`src/pages/index.astro` Zeile 116-118:
```
[Platzhalter — wird nach Call 19.03. befüllt]
```

Das steht so sichtbar auf der Live-Seite.

---

#### M2: STADTTEIL-SEITEN BEWERTUNGS-FORM FRAGT NUR PLZ

Die Stadtteil-Seiten (`/leipzig/volkmarsdorf` etc.) haben ein Inline-Form das NUR PLZ fragt, OHNE E-Mail/Name. Selbes Problem wie H1 — wertloser Lead.

---

#### M3: ROI-RECHNER — PROVISION DOPPELT BERECHNET

Der ROI-Rechner berechnet:
1. Nebenkosten: "Provision (5%)" auf den KAUFPREIS (= Kaeufer-Provision an Makler)
2. Ergebnis: "Provision (unsere 5%)" auf den VERKAUFSPREIS

Das sind zwei verschiedene Provisionen die beide "5%" heissen. Das ist:
- Verwirrend fuer den User
- Die Nebenkosten-Provision ist die Maklerprovision beim KAUF — muesste "Maklerprovision Kauf" heissen
- Die Ergebnis-Provision ist die Provision beim Verkauf — muesste klarer sein

Auch: 5% Gesamtprovision (2.5% Kaeufer + 2.5% Verkaeufer laut PROJECT.md) wird hier als 5% auf den Verkaufspreis berechnet. Nicht korrekt.

---

#### M4: DESIGN-BRIEF NICHT UMGESETZT

Das Marketing-Konzept §5.3 sagt:
> "Farbwelt: Gruen (brown→green!) + Kupfer-Akzente"

Die Website nutzt Slate + Blau. Das ist die Brand V2 "Direkt & Modern" die Stefan bestaetigt hat, also KEIN Fehler — aber es weicht vom Marketing-Konzept ab. Ggf. Marketing-Konzept aktualisieren.

---

#### M5: KEIN COOKIE-BANNER

Aktuell keine Cookies = kein Banner noetig. ABER: Sobald GA4 kommt (H4), braucht es einen Cookie-Consent. Proaktiv planen.

---

#### M6: DANKE-SEITE NICHT INDIZIERBAR

Die Danke-Seite (`/danke`) hat `prerender = false` und ist Server-rendered. Das ist korrekt (kein SEO noetig). Aber: robots.txt blockiert sie nicht explizit. Ggf. `noindex` Meta-Tag hinzufuegen.

---

### LOW (Feinschliff)

#### L1: BRAND V2 PREVIEW VS. LIVE SITE — DIVERGENZ

Die Preview (`preview-brand-v2.html`) nutzt `'Segoe UI', system-ui` als Font. Die Live-Seite nutzt korrekt Outfit. Die Preview ist nur eine Referenz, kein Problem — aber sie ist veraltet.

#### L2: JSON-LD "RealEstateAgent" SCHEMA-TYPE

Der Schema-Typ ist `RealEstateAgent`. Das impliziert Maklertaetigkeit. Passt zum Vermittler-Modell, ist aber nicht exakt. Ggf. `RealEstateAgent` + `additionalType: "https://schema.org/OnlineBusiness"`.

#### L3: prefers-reduced-motion KORREKT

Gut: `prefers-reduced-motion: reduce` wird respektiert. Nur der Hero-Dot-Pulse hat eine Animation die korrekt deaktiviert wird.

#### L4: KEIN "Makler" NAV-LINK

Marketing-Konzept definiert 3 Pfade: Eigentuemer / Investor / Makler. Die Navigation hat nur "So funktioniert's / Fuer Investoren / ROI-Rechner". Kein Makler-Pfad.

---

### Platzhalter-Liste (was noch von Joachim/Stefan kommen muss)

| Was | Wo | Von wem |
|-----|-----|---------|
| Firmenname + Adresse + Vertretung | Impressum + Datenschutz | Joachim (§34c-Inhaber) |
| E-Mail-Adresse (z.B. info@wirkaufendeineimmobilie.de) | Impressum + Datenschutz | Stefan (Domain-Setup) |
| §34c Erlaubnisbehoerde + Registriernummer | Impressum | Joachim |
| Berufshaftpflicht-Daten | Impressum (DL-InfoV) | Joachim |
| Telefonnummer verifizieren (0341-800 900 0) | Global | Joachim |
| Trust-Section Text (Joachim Bio/Track Record) | Startseite #trust | Joachim (nach Call 19.03.) |
| Favicon SVG | /public/favicon.svg | Stefan |
| OG-Image | /public/og-default.jpg | Stefan |
| Echte Objekte fuer Property Cards | Startseite | Joachim (Pipeline) |
| Vorher-Nachher Case Study MIT Zahlen | Startseite / eigene Seite | Joachim |
| Guides PDFs (Erbengemeinschaft + Fix&Flip Starter) | E-Mail-Versand | Stefan + Joachim |

---

### Fantasy-Check (was nicht belegt ist)

| Behauptung | Wo | Status | Bewertung |
|------------|-----|--------|-----------|
| "Angebot in 48h" | Hero, Stats, Form | NICHT BELEGBAR — Es gibt kein System das in 48h ein Angebot generiert. Bei einem Vermittlungsmodell muss erst ein Kaeufer gefunden werden. | KRITISCH — Muss entweder belegt oder entfernt werden |
| "Auszahlung in 14 Tagen" | Stats-Bar | UNREALISTISCH — Selbst bei sofortigem Notartermin dauert Grundbucheintragung + Zahlungsfreigabe laenger. Normal: 4-8 Wochen ab Vertragsunterschrift | KRITISCH |
| "0 EUR Kosten fuer dich" | Stats-Bar | IRREFUEHREND — Verkaeufer zahlt 2.5% Provision (§656c BGB, haelftige Teilung). "Keine Kosten fuer die Bewertung" waere korrekt. "0 EUR Kosten" ist falsch. | KRITISCH |
| "100% Diskretion" | Stats-Bar | NICHT MESSBAR — Was heisst das konkret? Kein Beweis dafuer. | MEDIUM |
| "35+ Jahre Immobilien-Erfahrung" | Trust-Section | PLAUSIBEL — Joachim war bei 21st Real, hat langjährige Branchenerfahrung. Aber: Platzhalter-Text, keine Details. | OK wenn befuellt |
| "Notar, Entruempelung, alle Kosten uebernehmen wir" | Schritt 3 | FALSCH — brown2green uebernimmt KEINE Kosten. Der Kaeufer zahlt Notar + Entruempelung. brown2green vermittelt nur. | KRITISCH |
| "Der einzige Fix & Flip Rechner mit echten Leipziger Marktdaten" | ROI-Rechner Hero | NICHT BELEGBAR — Nicht verifiziert ob es keinen anderen gibt. Vorsichtige Formulierung besser. | MEDIUM |

**Zusammenfassung Fantasy-Check:** Die Stats-Bar (48h, 0 EUR, 14T) und der Schritt 3 ("alle Kosten uebernehmen wir") sind NICHT vereinbar mit einem Vermittlungsmodell. Diese Zahlen stammen aus der Brand-Preview die ein iBuyer/Ankauf-Modell simuliert hat. Sie wurden 1:1 in die Vermittlungs-Website uebernommen — das ist ein **fundamentaler Widerspruch**.

---

### Brand-Konsistenz (Abweichungen)

| Kriterium | Status | Details |
|-----------|--------|---------|
| Farben Slate #0F172A + Blau #3B82F6 | PASS | Konsistent ueber alle Seiten, CSS Variables korrekt |
| Font Outfit durchgehend | PASS | Nur Outfit geladen, ueberall var(--font-family) |
| Logo "wirkaufen[deine]immobilie" | PASS | Korrekt auf allen Seiten: Nav + Footer, primary + accent |
| Keine verbotenen Fonts | PASS | Outfit nicht auf der Verbotsliste |
| CSS Variables statt Hardcodes | PASS | Keine hardcodierten Hex-Werte in .astro Dateien gefunden |
| Layered Shadows | PASS | --shadow-sm/md/lg alle 2-Layer, korrekt aus tokens.md |
| Type Scale | PASS | Fluid clamp() aus tokens.md 1:1 umgesetzt |
| prefers-reduced-motion | PASS | Korrekt implementiert |
| Touch Targets >= 44px | PASS | Alle Buttons + Links haben min-height: 44px |
| focus-visible | PASS | Korrekt auf Buttons, Links, Inputs |
| Skip-to-Content Link | PASS | Vorhanden in Layout.astro |
| Anti-Slop Check | PASS | Keine verbotenen Patterns (purple gradients, cards-in-cards, etc.) |

**Brand-Konsistenz ist gut.** Die technische Umsetzung der Design-Tokens ist sauber.

---

## Self-Disprove Check

**Staerkstes PASS-Argument:** Build ist clean, Brand ist konsistent, alle Design Tokens korrekt umgesetzt, Accessibility-Basics vorhanden, alle Seiten existieren und sind funktional, SEO-Meta auf allen Seiten, responsive Design mit Mobile-Breakpoints. Die handwerkliche Qualitaet ist hoch.

**Haelt es?** NEIN. Die handwerkliche Qualitaet kann die inhaltlichen Blocker nicht kompensieren:
1. Der Messaging-Widerspruch (Ankauf vs. Vermittlung) ist ein FUNDAMENTAL-Problem, nicht ein Nit
2. Die Fantasy-Zahlen (48h, 0 EUR, 14T) sind bei einem Vermittlungsmodell nicht haltbar
3. Impressum ist komplett leer — Abmahnrisiko
4. API-Endpoints verlieren Daten bei Redeploy

**Verdict bleibt: NEEDS WORK.**

---

## Naechste Schritte (priorisiert)

1. **SOFORT (vor jeder Vorstellung):** Messaging von "wir kaufen" auf "wir vermitteln" aendern. Stats-Bar Zahlen ueberarbeiten oder entfernen.
2. **VOR GO-LIVE:** Impressum + Datenschutz mit echten Daten befuellen (Joachim-Call 19.03.)
3. **VOR GO-LIVE:** favicon.svg + og-default.jpg erstellen
4. **VOR GO-LIVE:** Hero-Form fixen (PLZ-only → Scroll zu vollem Formular, oder E-Mail dazu)
5. **VOR GO-LIVE:** API-Endpoints mit E-Mail-Notification ausstatten (Brevo)
6. **VOR GO-LIVE:** Sitemap-Plugin installieren
7. **BALD:** GA4 einbinden
8. **BALD:** Google Fonts lokal hosten
9. **BALD:** Trust-Section mit echtem Content befuellen
10. **SPAETER:** Makler-Pfad hinzufuegen, Property Cards wenn Objekte vorhanden

---

*Reality Check v1.0 — 16.03.2026*
*NEXUS Reality Checker, default: NEEDS WORK*
