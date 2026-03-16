# Google Stitch Briefing — So funktioniert's

> Copy-Paste in Google Stitch. Basiert auf NEXUS Framework + Brand V2 + WKDI Voice-Profil.

---

## ROLLE

Agiere als Senior Conversion-Spezialist fuer den DACH-Immobilienmarkt, spezialisiert auf zweiseitige Plattformen (Verkaeufer + Kaeufer). Du designst eine Prozess-Erklaerungsseite die Vertrauen durch Transparenz schafft. Der Ton ist sachlich-warm, wie ein Freund der sich mit Immobilien auskennt. Du-Anrede durchgehend.

---

## KONTEXT

Erstelle die "So funktioniert's"-Seite (/so-funktionierts) fuer wirkaufendeineimmobilie.de — eine Vermittlungsplattform fuer sanierungsbeduerftige Wohnungen in Leipzig. Diese Seite erklaert BEIDEN Zielgruppen den Prozess: Verkaeufern (Erben 45-70, ueberfordert) und Kaeufern (Handwerker 25-45, Deal-orientiert). Kern: Das geschlossene Angebotsverfahren — kein Bieterwettlauf, kein Zwang, volle Transparenz. Die Seite muss Angst nehmen ("Ist das eine Auktion?") und Klarheit schaffen.

---

## SEITENSTRUKTUR

### Section 1: HERO (Klarheit + CTA above-the-fold)

**Layout:** Zentriert, max-width 1120px. Viel Whitespace.

**Visuell:**
- Hintergrund: Bg (#FAFBFC)
- Generous Spacing: 80px oben, 48px unten

**Text:**
- H1: "So funktioniert's" (Slate #0F172A, Outfit 800, 52px, zentriert)
- Subheadline: "Vom ersten Kontakt bis zum Geld auf deinem Konto — transparent und fair." (Outfit 400, 18px, Text-Mid #475569, zentriert)
- CTA-Button: "Jetzt Immobilie einreichen →" (Accent-Bg #3B82F6, weiss Text)

---

### Section 2: PERSPEKTIV-TABS (Verkaeufer / Kaeufer)

**Layout:** Bg-Alt Hintergrund (#F1F5F9). Volle Breite. Max-width 800px Content.

**Visuell:**
- Tab-Switch oben zentriert: 2 Pill-Buttons nebeneinander ("Verkaeufer" | "Kaeufer")
- Aktiver Tab: Accent-Bg (#3B82F6), weisser Text, Accent Border
- Inaktiver Tab: Weisser Hintergrund, Border (#E2E8F0), Text-Mid
- Tab-Switch Border-Radius: 9999px (Pill)
- Min-height 44px pro Tab-Button

**Verkaeufer-Panel (default aktiv):**

3 Schritte, vertikal gestackt. Jeder Schritt:
- Links: Nummer in Box (48x48px, Accent-Light Bg, Accent Text, Border-Radius 10px, Outfit 800)
- Rechts: Titel (H3, Outfit 700) + Beschreibung (Text-Mid, 14px)

Schritt 1: "Objekt einreichen" — "PLZ + Basisdaten — 2 Minuten. Keine Fotos noetig, kein Aufraeumen. Wir bewerten die Substanz."
Schritt 2: "Wir starten das Angebotsverfahren" — "Nur gepruefte Kaeufer. Geschlossen, fair, dokumentiert. Jeder Kaeufer gibt ein verdecktes Angebot ab."
Schritt 3: "Du entscheidest" — "Alle Angebote einsehen. Frei waehlen. Wir koordinieren den Notartermin. Kein Zwang, kein Zeitdruck."

CTA darunter: "Jetzt Objekt einreichen →" (Accent-Bg, zentriert)

**Kaeufer-Panel (hidden, wird per Tab-Click sichtbar):**

Schritt 1: "Zugang sichern" — "Registrieren, verifizieren, Deal-Profil anlegen. Wir pruefen jeden Antrag persoenlich."
Schritt 2: "Objekte pruefen & bieten" — "Kuratierte Objekte, alle Unterlagen, ein Gebot. Verdeckt — niemand sieht dein Angebot."
Schritt 3: "Zuschlag & Sanierung" — "Notartermin, Schluessel, lossanieren. Schnelle Abwicklung — wir koordinieren alles bis zum Notar."

CTA darunter: "Investoren-Zugang anfragen →" (Accent-Bg, zentriert)

Auf Mobile: 1 Spalte, Steps gestackt (Nummer + Content untereinander).

---

### Section 3: ANGEBOTSVERFAHREN ERKLAERT (4-Punkte Grid)

**Layout:** Weisser Hintergrund. Zentriert.

**Visuell:**
- H2: "Das digitale Angebotsverfahren" (zentriert)
- Intro-Text: "Kein Bieterwettlauf. Kein Zwang. — Jeder gibt sein bestes Angebot ab, verdeckt. Der Verkaeufer sieht alle Angebote und entscheidet frei." (Text-Mid, zentriert, max-width 640px)
- 2x2 Grid darunter, Gap 24px

Jeder Punkt:
- Links: Icon-Box (44x44px, Accent-Light Bg, Accent Icon, Border-Radius 6px)
- Rechts: Titel (H3, Outfit 600, 18px) + Beschreibung (Text-Mid, 14px)

**4 Punkte:**
1. Schloss-Icon: "Geschlossen" — "Niemand sieht andere Gebote. Kein Hochbieten, kein FOMO."
2. Personen-Icon: "Fair" — "Ein Gebot pro Kaeufer. Gleiche Regeln fuer alle."
3. Auge-Icon: "Transparent" — "Alle Angebote werden dem Verkaeufer gezeigt. Vollstaendige Einsicht."
4. Schild-Icon: "Rechtssicher" — "Kaufvertrag kommt erst durch notarielle Beurkundung zustande."

Auf Mobile: 1 Spalte.

---

### Section 4: FOOTER (Dark)

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
- Tab-Switch: Accessible (role="tablist", aria-selected, aria-controls)
- Tab-Panels: hidden-Attribut fuer inaktive Panels, smooth Transition
- Hover: Cards/Points heben sich (translateY -1px + shadow-md Transition 200ms)
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
