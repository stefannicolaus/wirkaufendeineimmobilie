# Google Stitch Briefing — ROI-Rechner

> Copy-Paste in Google Stitch. Basiert auf NEXUS Framework + Brand V2 + WKDI Voice-Profil.

---

## ROLLE

Agiere als Senior Conversion-Spezialist fuer den DACH-Immobilienmarkt, spezialisiert auf interaktive Tools fuer Investoren. Du designst einen ROI-Rechner der professionell, clean und taschenrechner-artig wirkt — wie ein Bloomberg-Terminal fuer Fix & Flip. Der Ton ist direkt und zahlengetrieben. Du-Anrede durchgehend.

---

## KONTEXT

Erstelle die ROI-Rechner-Seite (/roi-rechner) fuer wirkaufendeineimmobilie.de — eine Vermittlungsplattform fuer sanierungsbeduerftige Wohnungen in Leipzig. Der Rechner ist das UNIQUE TOOL das kein Wettbewerber hat: Kaufpreis + Sanierung + Nebenkosten = Rendite, mit echten Leipziger Stadtteil-Marktdaten. Zielgruppe: Handwerker-Investoren und Fix & Flip Profis. Der Rechner ist gleichzeitig Lead-Magnet: "Ergebnis als PDF" → Email-Capture.

---

## SEITENSTRUKTUR

### Section 1: HERO (Kurz, auf den Punkt)

**Layout:** Zentriert, max-width 1120px. Kompakt.

**Visuell:**
- Hintergrund: Bg (#FAFBFC)
- Generous Spacing: 80px oben, 48px unten

**Text:**
- H1: "Was bringt dein naechster Flip?" (Slate #0F172A, Outfit 800, 52px) + Zeilenumbruch + "Rechne es durch." (Accent #3B82F6, gleiche Groesse)
- Subheadline: "Fix & Flip Rechner mit echten Leipziger Marktdaten — Rendite, Kosten und Gewinn auf einen Blick." (Outfit 400, 18px, Text-Mid #475569, zentriert)

---

### Section 2: CALCULATOR (2-Spalten Layout — Kern der Seite)

**Layout:** Bg-Alt Hintergrund (#F1F5F9). 2-Spalten Grid (1fr 1fr), Gap 32px. Align-items: start.

**Visuell:**
- Linke Spalte (Inputs): Weisser Hintergrund implizit durch Input-Felder
- Rechte Spalte (Ergebnis): Dark Card (Slate-Bg #0F172A) fuer Kontrast, Border-Radius 16px, Padding 24px, Shadow-lg

#### Linke Spalte: "Deine Zahlen"

- H3: "Deine Zahlen" (Outfit 700, 20px)
- 5 Input-Gruppen, vertikal gestackt, Gap 20px:

1. **Kaufpreis (EUR)** — number input, Default: 65.000, Step 1.000
2. **Wohnflaeche (m2)** — number input, Default: 45, Step 1
3. **Stadtteil** — Dropdown: Volkmarsdorf / Neustadt-Neuschoenfeld / Plagwitz / Lindenau / Reudnitz-Thonberg
4. **Sanierungskosten (EUR)** — number input, Default: 35.000, Step 1.000
5. **Eigenleistung einrechnen** — Toggle-Switch (Accent wenn aktiv)
   - Wenn aktiv: Gewerk-Dropdown erscheint (Maler / Elektriker / SHK / Trockenbau / Fliesenleger)

- Darunter: Nebenkosten-Info Box (weisser Hintergrund, Border, Border-Radius 10px, Padding 16px)
  - H4: "Nebenkosten (automatisch)" (Outfit 600, 14px)
  - 3 Zeilen: "Grunderwerbsteuer (3,5%)" + Wert | "Notar + Grundbuch (2%)" + Wert | "Maklerprovision Kauf (5%)" + Wert
  - Jede Zeile: Flex space-between, Text-Mid, 14px

- Labels: Text-Mid, 13px, Outfit 500
- Inputs: Border (#E2E8F0), Border-Radius 6px, Padding 12px 16px, Focus: Accent-Border

#### Rechte Spalte: "Dein Ergebnis"

- H3: "Dein Ergebnis" (Outfit 700, 20px, weiss auf Slate)
- Ergebnis-Card (Dark Background — Slate #0F172A):
  - Weisser Text, Border-Radius 16px, Padding 24px
  - Zeilen mit Flex space-between:
    - "Gesamtinvestition" — Wert (weiss, Outfit 600)
    - "Erwarteter Verkaufspreis" — Wert
    - Divider (1px Border, 30% Opacity weiss)
    - "Brutto-Gewinn" — Wert
    - "Eigenleistungs-Ersparnis" — Wert (Success-Gruen #10B981, nur wenn Toggle aktiv)
    - "Vermittlungsprovision (5%, erfolgsbasiert)" — Wert
    - Divider
    - **"Netto-Gewinn"** — Wert (Accent #3B82F6, Outfit 800, gross 24px)
    - **"ROI auf Eigenkapital"** — Wert (Accent #3B82F6, Outfit 800, gross 24px)

- Live-Update: Alle Werte berechnen sich bei jeder Input-Aenderung sofort neu

#### PDF-CTA (unter der Ergebnis-Card)

- Text: "Ergebnis als PDF speichern" (Outfit 600, 16px, zentriert)
- Inline-Form: Email-Input + Button "PDF senden →" nebeneinander
- Email-Input: Border, Border-Radius 6px
- Button: Accent-Bg, weiss Text
- Auf Mobile: gestackt

Auf Mobile: 1 Spalte (Inputs oben, Ergebnis-Card darunter).

---

### Section 3: FOOTER (Dark)

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
- Calculator: LIVE-UPDATE — bei jeder Aenderung eines Inputs berechnen sich alle Ergebnis-Werte sofort neu (kein Submit-Button noetig)
- Toggle: Smooth Slide-Animation, Gewerk-Dropdown fadet ein/aus
- Nebenkosten: Berechnen sich automatisch aus Kaufpreis
- Zahlen-Format: deutsches Format (Punkt als Tausender-Trenner, Komma als Dezimal)
- Focus-Visible: 2px Accent Outline, 2px Offset
- prefers-reduced-motion: Alle Animationen deaktivieren
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
