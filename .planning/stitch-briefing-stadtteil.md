# Google Stitch Briefing — Stadtteil-Seite (Regionale SEO-Template)

> Copy-Paste in Google Stitch. Basiert auf NEXUS Framework + Brand V2 + WKDI Voice-Profil. Template fuer /leipzig/[stadtteil].

---

## ROLLE

Agiere als Senior Conversion-Spezialist fuer den DACH-Immobilienmarkt mit SEO-Expertise fuer regionale Landing Pages. Du designst ein wiederverwendbares Stadtteil-Template das lokale Marktdaten prominent zeigt, Vertrauen durch Zahlen schafft und sowohl Verkaeufer als auch Kaeufer anspricht. Der Ton ist datengetrieben und professionell — wie ein lokaler Marktbericht, nicht wie eine Makler-Anzeige. Du-Anrede durchgehend.

---

## KONTEXT

Erstelle das Stadtteil-Template (/leipzig/[stadtteil]) fuer wirkaufendeineimmobilie.de. Jede Stadtteil-Seite wird dynamisch aus JSON-Daten generiert (Name, Bezirk, qm-Preise unsaniert/saniert, Trend, 5-Jahres-Entwicklung, Fliesstext, Zielgruppen, Nachbar-Stadtteile). Die Seiten dienen als regionale SEO-Landingpages fuer Suchanfragen wie "sanierungsbeduerftige Wohnung verkaufen Volkmarsdorf". Stadtteile: Volkmarsdorf, Plagwitz, Lindenau, Neustadt-Neuschoenfeld, Reudnitz-Thonberg.

---

## SEITENSTRUKTUR

### Section 1: BREADCRUMB

**Layout:** Volle Breite, kompaktes Padding (16px vertikal).

**Text:**
- Home › Leipzig › [Stadtteil-Name]
- Font: Outfit 400, 14px, Text-Muted (#94A3B8)
- Links: Text-Muted, Hover: Accent
- Aktueller Stadtteil: Text (#0F172A), Outfit 500

---

### Section 2: HERO (Stadtteil-Name + Bezirk-Badge)

**Layout:** Bg (#FAFBFC). Links-ausgerichtet (NICHT zentriert — asymmetrisch). Max-width 1120px.

**Visuell:**
- Generous Spacing: 64px oben, 32px unten

**Text:**
- Badge: "[Bezirk] · Leipzig" (Uppercase, klein, Bg-Alt Hintergrund, Border, Pill-Shape)
- H1: "Sanierungsbeduerftige Wohnung verkaufen in [Stadtteil]" (Slate #0F172A, Outfit 800, 42px)
- Subheadline: [Besonderheit aus JSON — z.B. "Gruenderzeit-Bestand trifft aufstrebende Gentrifizierung"] (Outfit 400, 18px, Text-Mid)

---

### Section 3: DEFINITION (AI-Citability Snippet)

**Layout:** Weisser Hintergrund. Kompakt, wenig Spacing.

**Text:**
- 1-2 Saetze Definition des Stadtteils (kursiv, Text-Mid, Line-Height 1.7)
- Dient als Featured-Snippet-Kandidat fuer Google/AI

---

### Section 4: MARKTDATEN (4 Cards im Grid)

**Layout:** Bg-Alt Hintergrund (#F1F5F9). 4-Spalten Grid, Gap 16px. Max-width 1120px.

**Visuell:**
- Jede Card: Weisser Hintergrund (#FFFFFF), Border (#E2E8F0), Shadow-sm, Border-Radius 10px, Padding 20px, zentriert
- Wert: Outfit 800, 30px, Slate
- Label: Outfit 400, 14px, Text-Mid

**4 Cards:**
1. "[qm_unsaniert] EUR/m2" — "Unsaniert"
2. "[qm_saniert] EUR/m2" — "Saniert"
3. "[trend]" — "Trend"
4. "[trend_5j]" — "5-Jahres-Entwicklung"

- Quelle darunter: "[marktdaten_quelle]" (Text-Muted, 12px)

Auf Mobile: 2x2 Grid.

---

### Section 5: FLIESSTEXT (Stadtteil als Immobilienstandort)

**Layout:** Weisser Hintergrund. Max-width 720px. Links-ausgerichtet.

**Text:**
- H2: "[Stadtteil] als Immobilienstandort" (Outfit 800, 30px)
- Fliesstext aus JSON: mehrere Absaetze, Body-Text (Outfit 400, 16px, Text-Mid, Line-Height 1.8)
- Quelle darunter

---

### Section 6: MINI-ROI BEISPIELRECHNUNG

**Layout:** Bg-Alt Hintergrund (#F1F5F9). Zentriert. Max-width 600px.

**Visuell:**
- H2: "Beispielrechnung fuer [Stadtteil]" (zentriert)
- Sub: "45 m2 Wohnung, typisches Sanierungsobjekt" (Text-Mid)
- Rechnung als gestackte Zeilen:
  - Jede Zeile: Flex space-between, Border-Bottom 1px (#E2E8F0), Padding 8px vertikal
  - "Kauf (45 m2 x [qm_unsaniert] EUR)" — "[Kaufpreis] EUR"
  - "Sanierung" — "35.000 EUR"
  - "Verkauf (45 m2 x [qm_saniert] EUR)" — "[Verkaufspreis] EUR"
  - Ergebnis-Zeile: Border-Top 2px Slate, Bold, groesser
  - "Gewinn (vor Nebenkosten)" — "[Gewinn] EUR" (Accent #3B82F6, Outfit 800)
- Erklaerungstext darunter (Text-Mid, 14px, links-ausgerichtet)
- CTA-Button: "Exakt berechnen im ROI-Rechner →" (Accent-Bg, margin-top 24px)

---

### Section 7: ZIELGRUPPEN (Wer verkauft / Wer kauft)

**Layout:** Weisser Hintergrund. 2-Spalten Grid, Gap 32px. Max-width 1120px.

**Visuell:**
- Linke Spalte: H2 "Wer verkauft in [Stadtteil]?" + Fliesstext (Text-Mid)
- Rechte Spalte: H2 "Wer kauft in [Stadtteil]?" + Fliesstext (Text-Mid)
- H2: Outfit 700, 20px

Auf Mobile: 1 Spalte, gestackt.

---

### Section 8: DETAIL-INFOS (Lokale Daten)

**Layout:** Bg-Alt Hintergrund (#F1F5F9). 2x2 Grid, Gap 24px.

**4 Bloecke:**
1. "Typische Objekte" — Fliesstext aus JSON
2. "Infrastruktur" — Bullet-List aus JSON (Accent-Dots)
3. "Einwohner" — Zahl aus JSON
4. "Sanierungsquote" — Text aus JSON

---

### Section 9: CTA MIT INLINE-FORM

**Layout:** Weisser Hintergrund. Zentriert.

**Text:**
- H2: "Immobilie in [Stadtteil] bewerten lassen" (zentriert)
- Inline-Form: PLZ-Input + Button "Kostenlos bewerten →" nebeneinander
  - Max-width 520px, zentriert
  - Input: Border, Border-Radius 6px, PLZ-Pattern
  - Button: Accent-Bg, weiss Text

Auf Mobile: gestackt.

---

### Section 10: NACHBAR-STADTTEILE (Pill-Links)

**Layout:** Bg-Alt Hintergrund (#F1F5F9).

**Visuell:**
- H4: "Nachbar-Stadtteile" (Outfit 600, 16px)
- Pill-Buttons als Flex-Wrap: Links zu den Nachbar-Stadtteilen
- Pill-Style: Weisser Hintergrund, Border, Border-Radius 9999px, Padding 8px 16px, Outfit 500, 14px, min-height 44px
- Hover: Accent-Border, Accent-Text
- H4: "Weitere Seiten"
- Pill-Links: ROI-Rechner / So funktioniert's / Startseite

---

### Section 11: FOOTER (Dark)

**Layout:** Slate-Hintergrund (#0F172A). 4-Spalten Grid.

**Visuell:**
- Logo: "wirkaufen" (weiss) + "deine" (Accent #3B82F6) + "immobilie" (weiss), Outfit 800, 20px
- Tagline: "Sanierungsbeduerftige Immobilien in Leipzig — fair, schnell, diskret." (Text-On-Dark 70% Opacity)
- Telefon: "0341 — 800 900 0"
- 3 Link-Spalten: Navigation / Fuer Verkaeufer / Fuer Investoren
- Bottom: Impressum | Datenschutz | © 2026 (Border-Top, Text-Muted)

---

## VISUELLE PARAMETER

```
Farbschema (Brand V2 — "Direkt & Modern"):
  Primary (Slate):   #0F172A (dark), #1E293B (light), #334155 (muted)
  Accent (Blau):     #3B82F6 (CTA, Highlights), #2563EB (hover), #DBEAFE (light)
  Success (Gruen):   #10B981 (Dots, Badges)
  Background:        #FAFBFC (bg), #F1F5F9 (bg-alt), #FFFFFF (cards)
  Text:              #0F172A (primary), #475569 (mid), #94A3B8 (muted)
  Border:            #E2E8F0

Typografie:
  Font:     Outfit (Variable, Google Fonts)
  Headlines: Outfit 800, 36-52px, letter-spacing -0.02em
  Body:      Outfit 400, 15-16px, line-height 1.6
  Labels:    Outfit 600, 12-13px, uppercase, letter-spacing 0.1em

Spacing: 4px Grid
  Section-Abstand: 48-96px (clamp)
  Container max-width: 1120px
  Container padding: 16-48px (clamp)

Shadows (Layered — Anti-Slop):
  sm: 0 1px 2px rgba(15,23,42,0.04), 0 1px 3px rgba(15,23,42,0.06)
  md: 0 2px 4px rgba(15,23,42,0.04), 0 4px 12px rgba(15,23,42,0.08)
  lg: 0 4px 8px rgba(15,23,42,0.04), 0 8px 24px rgba(15,23,42,0.1)
  accent: 0 2px 4px rgba(59,130,246,0.15), 0 4px 16px rgba(59,130,246,0.2)

Border-Radius: 6px (Buttons/Inputs), 10px (Cards), 16px (grosse Cards), 9999px (Badges/Pills)

Stimmung: Tech-Clean wie SaaS, aber warm. Vertrauen durch Klarheit.
NICHT: Makler-Broschuere, aggressive Immobilien-Werbung, Stockfotos von Haeusern.
NICHT: Purple Gradients, Inter/Roboto/Arial, Cards-in-Cards, identische Grids.
```

---

## VERHALTEN

- Mobile-First: Alles beginnt bei 320px Breite
- Touch-Targets: min 44px (Buttons min 48px)
- Sticky Nav auf Desktop + Mobile (weiss, Shadow-sm, z-index 200)
- Breadcrumb: Immer sichtbar, nicht sticky
- Marktdaten-Cards: Statisch (kein Hover-Effekt noetig — reine Info)
- Inline-Form: Submit sendet an /api/bewertung, Redirect zu /danke
- Pill-Links Hover: Accent-Border + Accent-Text (Transition 100ms)
- Focus-Visible: 2px Accent Outline, 2px Offset
- prefers-reduced-motion: Alle Animationen deaktivieren
- JSON-LD Structured Data: LocalBusiness + BreadcrumbList Schema
- Nav: Logo links + 3 Links (So funktioniert's, Fuer Investoren, ROI-Rechner) + Telefon-Pill rechts
- Mobile Nav: Hamburger-Menu

---

## LOGO

Wortmarke: "wirkaufen**deine**immobilie"
- "wirkaufen" + "immobilie" → Slate #0F172A, Outfit 800, 20px
- "deine" → Accent #3B82F6, gleicher Font
- Keine Trennung, keine Punkte, keine Leerzeichen, durchgehend Lowercase
- Auf dunklem Hintergrund (Footer): "wirkaufen" + "immobilie" → Weiss, "deine" → Accent

---

## ANTI-SLOP REGELN (Design-Qualitaet)

- KEINE verbotenen Fonts (Inter, Roboto, Arial, Geist, Space Grotesk)
- KEINE purple/blue Gradients auf weissem Hintergrund
- KEINE identischen Card-Grids (Dual Cards sind bewusst asymmetrisch)
- KEINE Cards-in-Cards
- Layered Shadows (2+ Layer) auf allen erhobenen Elementen
- CSS Variables fuer ALLE Farben (keine Hardcodes)
- Alle States designed: Empty, Error, Loading, Focus, Hover
- Nicht alles zentrieren — asymmetrisches Layout wo sinnvoll
- Visueller Rhythmus durch variiertes Spacing

AI Slop Test: "Wenn du dieses Interface jemandem zeigst und sagst 'AI hat das gemacht' — wuerden sie dir sofort glauben? Wenn ja, ist das das Problem."
