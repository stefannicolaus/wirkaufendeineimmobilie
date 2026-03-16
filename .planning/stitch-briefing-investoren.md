# Google Stitch Briefing — Investoren-Zugang (Kaeufer-LP)

> Copy-Paste in Google Stitch. Basiert auf NEXUS Framework + Brand V2 + WKDI Voice-Profil + AIDA-Framework.

---

## ROLLE

Agiere als Senior Conversion-Spezialist fuer den DACH-Immobilienmarkt, spezialisiert auf Kaeufer-Akquise fuer Fix & Flip Objekte. Du designst eine Landing Page die Handwerker und Investoren anspricht — direkt, zahlengetrieben, ohne Broschueren-Sprache. Der Ton ist wie ein erfahrener Investor der dir einen Deal zeigt: sachlich, exklusiv, auf den Punkt. Du-Anrede durchgehend.

---

## KONTEXT

Erstelle die Investoren-Seite (/investoren) fuer wirkaufendeineimmobilie.de — eine Vermittlungsplattform fuer sanierungsbeduerftige Wohnungen in Leipzig. Diese Seite richtet sich an die KAEUFER-Seite: Handwerker (25-45, Maler/Elektriker/SHK/Trockenbauer) die ihr Handwerk in eigenes Vermoegen stecken wollen, und Fix & Flip Profis (3+ Deals/Jahr) die kuratierten Deal-Flow suchen. Schmerz: "Immoscout-Objekte sind immer schon weg oder zu teuer." Versprechen: Off-Market Zugang zu vorgeprüeften Sanierungsobjekten im geschlossenen Angebotsverfahren.

---

## SEITENSTRUKTUR (AIDA: Attention → Interest → Desire → Action)

### Section 1: HERO (Exklusivitaet + CTA above-the-fold)

**Layout:** Zentriert, max-width 1120px. Viel Whitespace.

**Visuell:**
- Hintergrund: Bg (#FAFBFC)
- Badge oben: "EXKLUSIVER INVESTOREN-ZUGANG" (Uppercase, klein, Bg-Alt Hintergrund, Border, Pill-Shape)
- Generous Spacing: 80px oben, 64px unten

**Text:**
- H1: "Dein naechstes Flip-Objekt." (Slate #0F172A, Outfit 800, 52px) + Zeilenumbruch + "Bevor es jemand anderes sieht." (Accent #3B82F6, gleiche Groesse)
- Subheadline: "Off-Market Sanierungsobjekte in Leipzig. Kuratiert, vorgeprueft, mit Renditepotenzial. Exklusiver Zugang fuer verifizierte Investoren." (Outfit 400, 18px, Text-Mid #475569, max-width 640px)
- CTA-Button: "Investoren-Zugang anfragen →" (Accent-Bg #3B82F6, weiss Text, Shadow-accent)

---

### Section 2: VORTEILE-CARDS (3 grosse Cards — Stitch Dual Cards Pattern)

**Layout:** 3-Spalten Grid, gleiche Hoehe. Gap 24px. Max-width 1120px. Bg-Alt Hintergrund (#F1F5F9).

**Visuell:**
- Jede Card: Weisser Hintergrund (#FFFFFF), Border (#E2E8F0), Shadow-sm, Border-Radius 16px, Padding 32px
- Icon-Box oben: 56x56px, Accent-Light Hintergrund (#DBEAFE), Accent Icon (#3B82F6), Border-Radius 10px
- Hover: Shadow-lg + translateY -2px (Transition 200ms)

**Card 1: Off-Market Zugang**
- Icon: Auge (eye)
- H3: "Off-Market Zugang" (Outfit 700, 22px)
- P: "Objekte bevor sie auf ImmoScout landen. Direkter Zugang zu Verkaeufern ueber unser Netzwerk." (Text-Mid, 14px)

**Card 2: Kuratierte Objekte**
- Icon: Checkmark-Kreis
- H3: "Kuratierte Objekte"
- P: "Vorgeprueft, mit Renditepotenzial, kalkulierbar. Wir filtern — du entscheidest."

**Card 3: Geschlossenes Verfahren**
- Icon: Schloss
- H3: "Geschlossenes Verfahren"
- P: "Faire Preisfindung im Angebotsverfahren, kein Bieterwettlauf. Ein Gebot pro Kaeufer."

Auf Mobile: 1 Spalte, gestackt.

---

### Section 3: ROI-TEASER (Link zum Rechner)

**Layout:** Weisser Hintergrund. Zentriert. Max-width 720px.

**Visuell:**
- Generous Spacing
- Zentrierter Text-Block

**Text:**
- H2: "Was bringt dein naechster Flip?" (Outfit 800, 30px, zentriert)
- Sub: "Rechne es durch — mit echten Leipziger Marktdaten." (Text-Mid)
- CTA-Button: "ROI-Rechner oeffnen →" (Accent-Bg, weiss Text, margin-top 24px)

---

### Section 4: REGISTRIERUNGS-FORMULAR (Lead Capture)

**Layout:** Bg-Alt Hintergrund (#F1F5F9). Zentriert. Max-width 700px.

**Visuell:**
- H2: "Investoren-Zugang anfragen" (zentriert)
- Sub: "Wir pruefen jeden Antrag persoenlich. Antwort innerhalb von 48 Stunden." (Text-Mid)
- Formular auf weissem Card-Hintergrund mit Shadow-lg, Border-Radius 16px, Padding 32px

**Formular-Felder:**
- Reihe 1 (3-Spalten Grid): Name*, E-Mail*, Telefon
- Reihe 2 (2-Spalten Grid): Erfahrungslevel* (Dropdown: Noch kein Deal / 1-2 Deals / 3+ Deals), Gewerk optional (Dropdown: Keins / Maler / Elektriker / SHK / Trockenbau / Fliesenleger)
- Labels: Text-Mid, 13px, Outfit 500
- Inputs: Border (#E2E8F0), Border-Radius 6px, Padding 12px 16px, Focus: Accent-Border + Accent-Light Shadow
- Button: "Zugang anfragen →" (Accent-Bg, weiss, zentriert)

Auf Mobile: alle Felder 1 Spalte.

---

### Section 5: FOOTER (Dark)

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
- Hover: Cards heben sich (translateY -2px + shadow-lg Transition 200ms)
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
