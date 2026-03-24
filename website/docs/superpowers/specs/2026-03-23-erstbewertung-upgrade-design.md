# WKDI Erstbewertung Upgrade — Design Spec
*Stand: 2026-03-23*

---

## Ziel

Die Erstbewertung von einem einfachen Kontaktformular zu einem 2-stufigen personalisierten Funnel upgraden — mit automatischer Preisindikation, PS-Stil Mirroring im PDF, und Grundlage für eine Brevo-Nachfasssequenz.

**Ergebnis für den Eigentümer:** Er gibt seine Daten ein und bekommt in Minuten ein professionell aussehendes persönliches PDF — mit seiner konkreten Preisspanne, erstellt aus denselben Marktdaten die Gutachter nutzen. Der Eindruck: Joachim hat sich das persönlich angeschaut.

---

## Flow

```
/#bewertung (Step 1)
  → Kontaktdaten: Vorname, Nachname, Email, Telefon, PLZ, Immobilientyp
  → POST /api/bewertung → DB insert → transaktionale Brevo-Mail
  → Mail enthält Link: /unterlagen?email=...&plz=...&ref=ID

/unterlagen (Step 2)
  → Kein Kontakt-Formular (URL-Params werden genutzt, Step 0 entfällt)
  → Objekt-Daten: Baujahr, Wohnfläche, Energieklasse, Zustand, Sanierungsstand,
    was_saniert, Heizung Baujahr, Stellplatz, Vermietet, Etage, Besonderheit
  → Pain-Freitext: "Was ist aktuell das größte Problem für Sie?" (optional)
  → Submit → PATCH /api/bewertung

Backend nach PATCH:
  → calcPreisindikation(daten) → 3 Ampeln + €-Spanne
  → Puppeteer PDF generieren (personalisiert, input-driven)
  → Brevo: PDF-Mail an Eigentümer (Anschreiben + PDF-Anhang)
  → Brevo: Notification an Joachim (alle Daten + Pain-Freitext)

Phase 2 (separat):
  → DOI für Brevo-Sequenz
  → Sequenz: Pain-Freitext-Mirroring ("Sie haben uns geschrieben...")
```

---

## Pain-Collection

**Eine Frage, offen:** *"Was ist aktuell das größte Problem für Sie?"*

- Freitext, optional — je mehr geschrieben wird, desto persönlicher die Nachfass-Mails
- Kein Quickselect, keine vordefinierten Kategorien
- Freitext kommt vollständig in Joachims Notification-Mail → er kennt die Situation vor dem Rückruf
- Freitext kommt in die Brevo-Sequenz (Phase 2), NICHT ins initiale PDF

---

## Mirroring-Mechanismus (nach PS-Vorbild)

Kein AI, kein Template-Mapping. Input-driven conditional content — wie `PersonalReport.tsx` bei Pferdesicht.

### 3 Ampeln (analog PS 4-Themen-Ampeln)

| Ampel | Inputs | Rot | Gelb | Grün |
|-------|--------|-----|------|------|
| **Preispotenzial** | PLZ, Energieklasse, Baujahr, Zustand | Energieklasse F-H + schlechter Zustand + Altbau | Energieklasse C-E oder Renovierungsbedarf | Energieklasse A-B oder modernisiert |
| **Vermarktungsdauer** | PLZ-Lage (zentral/gut/randlage), Immobilientyp, Vermietet | Vermietet + PLZ-Lage=randlage | Vermietet + PLZ-Lage=gut, oder freistehendes Objekt in Randlage | Freistehend + PLZ-Lage=zentral/gut |
| **Aufwertungspotenzial** | Sanierungsstand, Energieklasse, Besonderheit | Große Maßnahmen nötig (Heizung, Fenster) | Kosmetischer Bedarf | Bereits modernisiert |

### Situationsbezogener Einleitungssatz (`getEinleitungssatz()`)

Kombiniert Immobilientyp + Baujahr + PLZ-Bereich zu einem spezifischen Einstieg:

```typescript
// Beispiele:
"Eine 3-Zimmer-Wohnung, Baujahr 1965, in 04229 — diese Kombination kennen wir gut."
"Ein Einfamilienhaus Baujahr 1978 mit Ölheizung — das sehen wir häufig in dieser Region."
"Eine Eigentumswohnung mit Energieklasse A in 04103 — das ist ein starkes Ausgangsprofil."
```

### Bedingte Content-Blöcke (vorgeschrieben, nicht AI)

Für jede Ampel × Zustand existieren vorgeschriebene Textblöcke — analog zu den Entwurm-/Anweide-/Fellwechsel-Blöcken in PS.

Beispiel für Preispotenzial rot:
> *"Energieklasse F bedeutet heute konkret: potenzielle Käufer rechnen mit Sanierungskosten und drücken entsprechend auf den Preis. Das ist kein Makel — es ist ein verhandelbarer Faktor, wenn man weiß was er bedeutet."*

### Anchor statt Pferdename

PS verwendet `${name}` (Pferdename) um den personalisierten Eindruck zu erzeugen. WKDI-Equivalent:

`Ihre ${wohnflaeche}m² ${immobilientyp_label} in ${plz}` — erscheint in jedem Abschnitt.

---

## calcPreisindikation()

### Inputs
- PLZ → Marktregion (3-stelliger Prefix)
- Immobilientyp (ETW / EFH / MFH / Grundstück)
- Wohnfläche (m²)
- Baujahr → Altersabschlag
- Energieklasse → Korrekturfaktor
- Zustand + Sanierungsstand → Zustandsfaktor
- Vermietet → Abschlag (Käufer zahlen weniger für vermietete Objekte)

### Marktdaten (hardcodiert, Gutachterausschuss Leipzig 2025)

```typescript
// src/lib/preisindikation/marktdaten.ts

// €/m² Median ETW — Gutachterausschuss Leipzig 2025
const MARKTDATEN_ETW: Record<string, { min: number; max: number }> = {
  '042': { min: 1_800, max: 2_400 }, // Leipzig-West/Grünau
  '041': { min: 2_600, max: 3_200 }, // Leipzig-Mitte/Nord
  '044': { min: 2_200, max: 2_800 }, // Leipzig-Ost/Süd
  default: { min: 2_000, max: 2_600 },
}

// EFH — ca. +25% über ETW (grobe Schätzung, Gutachterausschuss 2025)
const MARKTDATEN_EFH: Record<string, { min: number; max: number }> = {
  '042': { min: 2_200, max: 3_000 },
  '041': { min: 3_200, max: 4_200 },
  '044': { min: 2_700, max: 3_500 },
  default: { min: 2_500, max: 3_300 },
}

// MFH + Grundstück: Fallback mit Hinweis im PDF
// "Für Mehrfamilienhäuser und Grundstücke erstellt Joachim die Kalkulation persönlich"
// → Ampeln und Einleitungssatz bleiben, €-Spanne wird als "auf Anfrage" ausgegeben

// PLZ-Prefix → Lage-Qualität (für Vermarktungsdauer-Ampel)
const PLZ_LAGE: Record<string, 'zentral' | 'gut' | 'randlage'> = {
  '041': 'zentral',   // Mitte, Gohlis, Südvorstadt
  '044': 'gut',       // Connewitz, Reudnitz, Stötteritz
  '042': 'randlage',  // Grünau, Lausen, Schönau
  default: 'gut',
}

const ENERGIEKLASSE_FAKTOREN: Record<string, number> = {
  'A+': 1.08, 'A': 1.05, 'B': 1.02, 'C': 1.00,
  'D': 0.97, 'E': 0.93, 'F': 0.88, 'G': 0.82, 'H': 0.64,
}

const ZUSTAND_FAKTOREN: Record<string, number> = {
  'neuwertig': 1.10,
  'gut': 1.00,
  'mittel': 0.92,
  'renovierungsbeduerftig': 0.82,
}
```

### Output
```typescript
{
  preisMin: number,       // €
  preisMax: number,       // €
  qmPreisMin: number,     // €/m²
  qmPreisMax: number,     // €/m²
  ampeln: {
    preispotenzial: 'gruen' | 'gelb' | 'rot',
    vermarktungsdauer: 'gruen' | 'gelb' | 'rot',
    aufwertungspotenzial: 'gruen' | 'gelb' | 'rot',
  },
  einleitungssatz: string,
}
```

---

## PDF-Aufbau (Puppeteer, wie roi-report.ts)

```
1. Cover
   - "Ihre persönliche Preisindikation"
   - Name, PLZ, Datum
   - WKDI Logo + Joachim Foto

2. Anschreiben (personalisiert)
   - Einleitungssatz (input-driven)
   - 3 Ampeln mit Kurztexten
   - "Joachim Kleinke ruft Sie persönlich zurück"

3. Ihre Immobilie
   - Alle Objekt-Daten sauber tabellarisch

4. Preisindikation
   - €-Spanne prominent
   - Erklärung der 3 Hauptfaktoren die den Preis beeinflussen

5. Disclaimer
   - "Indikation auf Basis aktueller Marktdaten — kein Gutachten"
   - Nächster Schritt: persönliches Gespräch
```

---

## Neue Dateien

| Datei | Zweck |
|-------|-------|
| `src/lib/preisindikation/marktdaten.ts` | Hardcodierte Marktdaten Leipzig (PLZ-Mapping, Energieklasse-Faktoren, Lage-Mapping) |
| `src/lib/preisindikation/calc.ts` | calcPreisindikation() + Ampeln + Einleitungssatz — reine Library-Funktion, kein HTTP |
| `src/lib/preisindikation/pdf.ts` | generatePreisindikationPdf() — HTML-Template + Puppeteer-Aufruf + Brevo-Mail |

**Kein separater API-Route für PDF.** Alle Logik (calc + PDF + Mail) wird direkt im PATCH-Handler von `bewertung.ts` aufgerufen — identisches Muster wie `roi-report.ts`.

## Geänderte Dateien

| Datei | Änderung |
|-------|----------|
| `src/pages/index.astro` | Schritt 02 Copy + Schritt 03 Copy |
| `src/pages/unterlagen.astro` | Step 0 entfällt bei URL-Params, Pain-Freitext-Feld hinzu, Copy fix |
| `src/pages/api/bewertung.ts` | PATCH: UPDATE-Statement um `pain_freitext` erweitern + nach DB-Update calcPreisindikation() + generatePreisindikationPdf() direkt aufrufen (await — Response erst nach Mail-Versand). `immobilientyp` kommt aus dem DB-Row-SELECT nach UPDATE, nicht aus dem PATCH-Body. |
| `src/lib/db.ts` | Idempotente ALTER TABLE: `pain_freitext TEXT` Spalte hinzu |

---

## Sales Copy — Betroffene Seiten

### index.astro — Schritt 02 "Erstbewertung in 48h"
**Vorher:** Generische Beschreibung
**Nachher:** Benefit-fokussiert, Gutachter-Credibility, konkrete Preisspanne als Versprechen

### index.astro — Schritt 03
**Vorher:** Prozessbeschreibung
**Nachher:** Emotionaler Benefit — Ausweg aus der Situation, nicht nur Ablaufbeschreibung

### so-funktionierts.astro
**Nachher:** Erklärt die 2-Schritt-Methodik + was die Preisindikation liefert

---

## Was explizit NICHT gebaut wird (Phase 1)

- DOI / Brevo-Marketing-Sequenz (→ Phase 2)
- Freitext-Mirroring in Emails (→ Phase 2)
- Andere Städte außer Leipzig (→ wenn skaliert wird)
- Admin-UI für Marktdaten-Pflege (→ wenn nötig)
