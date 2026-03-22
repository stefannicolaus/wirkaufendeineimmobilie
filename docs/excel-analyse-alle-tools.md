# WKDI — Analyse aller 4 Kalkulationstools
> Stand: 2026-03-22 | Alle 4 Dateien aus Downloads extrahiert und verglichen

---

## Übersicht: Was haben wir analysiert?

| Datei | Erstellt von | Sheets | Zweck |
|-------|-------------|--------|-------|
| `Vorlage Kalkulationstabelle.xlsx` | Ivan (Investor) | Buy and Hold, Fix und Flip | Leere Vorlage |
| `Projekt Kalkulationstabelle F&F - B&H.xlsx` | Ivan (Investor) | Buy and Hold, Fix und Flip, Netzschkau | Reales Projektbeispiel |
| `Variante Cockpit - immocation` | immocation | 8 Sheets | Dashboard + Bankgespräch |
| `Variante Roter Faden - immocation` | immocation | 31 Sheets | Geführter 16-Schritte-Prozess |

---

## 1. Ivan's Tools — Detailanalyse

### Buy and Hold Sheet (beide Dateien identisch)

**Objektdaten:**
- Strasse, PLZ/Ort, Typ, Etage
- Baujahr, Wohnfläche m², Energieeffizienzklasse, Wohneinheiten insgesamt

**Ausgaben (monatlich):**
- Hausgeld nicht umlagefähig
- Hausgeld umlagefähig
- Grundsteuer
- Einkommensteuer (berechnet)
- Rücklagen 10€/m² (als Default)
- Bank (Zins + Rate)
- Investor/Darlehensgeber (Zins + Rate)
- → Summe: mon. Ausgaben insgesamt

**Einnahmen:**
- AfA (berechnet)
- Warmmiete
- Brutto Kaltmiete
- Netto Kaltmiete

**Ergebnis:** Cashflow (Einnahmen - Ausgaben)

**Anschaffungskosten:**
- Kaufpreis, Preis/m²
- Grunderwerbsteuer: **6%** (Sachsen — Ivan nutzt 6%, korrekt wäre Sachsen = 3,5%)
- Notar: 1,5%
- Grundbucheintrag: 0,5%
- Makler: 3,57%
- → Insgesamt: 11,57% Nebenkosten
- Renovierung
- GIK (Gesamte Investitionskosten)

**Finanzierung:**
- Bank: Betrag, monatliche Rate, Zins
- Darlehensgeber (Investor): Betrag, monatliche Rate, Zins
- Eigenkapital
- Insgesamt monatlich

**Kennzahlen:**
- Faktor (Kaufpreisfaktor)
- Netto Rendite
- Brutto Rendite

**AfA-Berechnung (inline dokumentiert):**
- Baujahr ≤1924: 2,5% | 40 Jahre
- Baujahr ≥1925: 2,0% | 50 Jahre
- Gebäudeanteil: 80%
- Formel: Kaufpreis × 80% × Satz / 12 = monatliche AfA

**Einkommensteuer-Berechnung (inline dokumentiert):**
1. Zinsen Bank + Zinsen Darlehensgeber
2. + nicht umlagefähige Kosten (inkl. WEG-Rücklagen)
3. + monatliche AfA
4. − Brutto Kaltmiete
5. = zu versteuernder Cashflow
6. × persönlicher Grenzsteuersatz (z.B. 40%)
7. = Einkommensteuer
8. Bruttokaltmiete − Einkommensteuer = Netto Kaltmiete

> Beispiel aus Ivans Datei: Miete €1.800 | Werbungskosten €1.341 | zu verst. CF: −€459 | bei 40% → Steuerersparnis

### Fix und Flip Sheet

**Eingaben:**
- Objektdaten: Typ, Straße, Ort, Baujahr, Wohnfläche
- Renovierungskosten: eigene Schätzung ODER Kostentabelle (2 Varianten)
- Dauer der Maßnahme (Wochen) — inkl. Verkaufszeit
- Kaufpreis
- Nebenkosten: GrESt 6%, Notar 2%, Makler 3,57%
- Finanzierung Bank: Betrag, Zinssatz, Bearbeitungsgebühr, Laufzeit
- Eigenkapitaleinsatz
- Erzielbarer Verkaufspreis

**Besonderheit: Co-Investor-Modul**
- Investment des Co-Investors
- Zinssatz p.a. (z.B. 10%)
- Gewinnbeteiligung % (z.B. 10%)
- Einmaliger Zins %
- → Finanzierungskosten Co-Investor

**Projektkalkulation "Top-Down":**
```
Erwarteter Verkaufspreis
− GIK (Gesamte Investitionskosten)
− Renovierungskosten
− Finanzierungskosten
− Hausgeld
− Nebenkosten Gesamt
− Kaufpreis
= Gewinn
Gewinnmarge = Gewinn / GIK
```

### Reales Beispiel: Netzschkau, Geschwister-Scholl Str. 3

| Kennzahl | Wert |
|---------|------|
| Typ | 4-Familienhaus |
| Wohnfläche | 285,16 m² |
| Kaufpreis | €50.000 |
| GrESt | 5,5% = €2.750 |
| Notar | 1,5% = €750 |
| Makler | 0% |
| Ankaufskosten | €53.500 |
| Renovierung (eigene Schätzung) | €75.000 |
| Finanzierung | €50.000 zu 4% über 2 Jahre |
| Finanzierungskosten | €1.667 |
| Erzielbarer Verkaufspreis | €125.000 |
| GIK | €55.167 |
| **Gewinn** | **€69.833** |
| **Gewinnmarge** | **1,27x (127%) auf GIK** |

---

## 2. immocation Cockpit — Detailanalyse

### Sheets (8):
1. **Deckblatt** — Disclaimer
2. **Cockpit** — Haupt-Dashboard
3. **Bankgespräch** — Druckfertige Bankvorlage
4. **Kennzahlen im Verlauf** — Zeitreihe (gesperrt in Gratis)
5. **Diagramme** — Charts (gesperrt)
6. **Konfiguration** — Globale Parameter
7. **Haushaltsrechnung** — Persönliche Finanzen
8. **Vermögensaufstellung** — Vermögensübersicht

### Cockpit — Zusätzlich zu Ivan:

**Inputs:**
- Kaufdatum
- Stellplätze + Mietanteil
- Sonstiges (weitere Einnahmen)
- Anteil Gebäude an Kaufpreis: **75%** (vs Ivan's 80%)
- Kalkulatorischer Mietausfall: 3% (Leerstandsrisiko!)
- Darlehen I + Darlehen II (zwei separate Darlehen)

**Zukunftsprojektionen (Konfiguration):**
- Kostensteigerung p.a.: 5%
- Mietsteigerung p.a.: 7%
- Wertsteigerung p.a.: 2%
- → Hochrechnung für Jahr X (z.B. 2034 = 17 Jahre nach Kauf)

**Kennzahlen heute:**
- Bruttomietrendite
- Nettomietrendite
- Faktor (Kaufpreisfaktor)
- Cashflow operativ (vor Steuer)
- Cashflow nach Steuern
- Jahr der Volltilgung

**Kennzahlen in der Zukunft (Vollversion):**
- Vermögenszuwachs p.a. (mit + ohne Wertsteigerung)
- Nettokaltmiete pro Jahr (Hochrechnung)
- Wert der Immobilie (Jahresende)
- Cashflow operativ (zukünftig)
- Cashflow nach Steuern (zukünftig)

**Eigenkapitalrendite:**
- Eigenkapitalrendite p.a.
- ohne Wertsteigerung

**Zinsänderungsrisiko:**
- "Monatl. Zinsen für CF 0 nach Steuern" = Break-even Zinssatz
- Zinssatz gewichtet (p.a.)

### Bankgespräch Sheet:
- Investitionsübersicht druckfertig
- Foto des Objekts einfügbar
- Objektdetails + Haupt-Darlehen + Erwartete Mieteinkünfte
- Cashflow-Tabelle: Einnahme vs. Ausgabe
- Bewirtschaftungskosten-Details
- Verweise auf Haushaltsrechnung + Vermögensübersicht
- **Zitat:** "So zeigst du, dass du deine Zahlen wirklich im Griff hast und erhöhst deine Chance auf beste Konditionen"

---

## 3. immocation Roter Faden — Detailanalyse

### Sheets (31):
- Deckblatt, Roter Faden (Übersicht), Sheets 0–15 (16 Schritte)
- Cockpit, Bankgespräch (identisch mit Cockpit-Variante)
- calc_rf, cnfg_rf, txt_rf, ekst_rf (Backend-Berechnungen)

### Geführter Prozess (16 Schritte):
- Sheet 0: Objektadresse, Wohnfläche, Kaufdatum
- Sheets 1–15: Schrittweise Eingabe (Kaufpreis → Nebenkosten → Finanzierung → Miete → Kosten → Steuer → Kennzahlen)
- Jeder Schritt hat erklärenden Text + Eingabefelder

### Backend-Sheets:
- **calc_rf**: Alle Berechnungen (AfA, Steuer, Cashflow, Renditen)
- **cnfg_rf**: Konfiguration (Steuersätze, Annahmen)
- **ekst_rf**: Einkommensteuer-Berechnung (dediziertes Sheet)

---

## 4. GAP-ANALYSE: Was fehlt unserem ROI Rechner?

### Bereits vorhanden (ROI Rechner Phase 1):
- ✅ Kaufpreis, Nebenkosten (GrESt 3,5%, Notar 2%, Makler 2,38%)
- ✅ Objekt-Typ (Fix&Flip vs. Kapitalanleger)
- ✅ Stadtteil mit Marktpreisen
- ✅ Renovierungskosten
- ✅ BEG-Förderung 40%
- ✅ ARV (After Repair Value)
- ✅ ROI, Deal Score A-D
- ✅ 70%-Regel

### Gap-Liste — Phase 2 Kapitalanleger-Rechner:

| Priorität | Feature | Woher | Impact |
|-----------|---------|-------|--------|
| 🔴 P1 | **Cashflow nach Steuer** (AfA + §21 EStG) | Ivan | Kernunterschied: echter Netto-CF |
| 🔴 P1 | **Eigenkapitalrendite p.a.** | immocation | Wichtigste Renditekennzahl für Investoren |
| 🔴 P1 | **Finanzierungs-Modul** (Zinssatz, Tilgung, Rate) | Ivan + immocation | Ohne = nur Rechner, nicht Entscheidungshilfe |
| 🔴 P1 | **Kaufpreisfaktor** | Ivan + immocation | Standard-Kennzahl die jeder kennt |
| 🟡 P2 | **DCF / Kennzahlen im Verlauf** (10/20 Jahre) | immocation | Differenzierungsmerkmal |
| 🟡 P2 | **Kalkulatorischer Mietausfall** (3% Leerstand) | immocation | Realistischer als 100% Auslastung |
| 🟡 P2 | **Zinsänderungsrisiko** (Break-even Zinssatz) | immocation | Für Bankgespräch sehr wertvoll |
| 🟡 P2 | **Co-Investor-Modul** | Ivan | Für erfahrene Investoren, Nice-to-have |
| 🟢 P3 | **Bankgespräch PDF** | immocation | GROSSER Differenziator vs. immocation |
| 🟢 P3 | **Wertsteigerung / Vermögenszuwachs** | immocation | Langfrist-Perspektive |

### Fix & Flip spezifische Gaps:

| Feature | Woher | Impact |
|---------|-------|--------|
| **Top-Down Kalkulation** (von Zielpreis rückwärts) | Ivan | Profi-Methode: "Was darf das kosten?" |
| **Haltedauer** in Wochen + Finanzierungskosten | Ivan | F&F entscheidend: Zeit = Geld |
| **Co-Investor-Modul** | Ivan | Realistisch für F&F-Projekte |
| **Gewinnmarge auf GIK** | Ivan | Standardkennzahl |

### Was immocation hat, aber wir NICHT brauchen:
- Haushaltsrechnung (zu persönlich, nicht Scope)
- Vermögensaufstellung (zu komplex für Lead-Magnet)
- 16-Schritte geführter Prozess (unser Quiz ersetzt das besser)

---

## 5. Ivans Fehler / Korrekturen

| Ivans Annahme | Korrekt? | Tatsächlich |
|--------------|---------|------------|
| GrESt 6% (Sachsen) | ❌ FALSCH | Sachsen: **3,5%** (nicht 6%!) |
| Gebäudeanteil 80% | ⚠️ Vereinfacht | Kein gesetzlicher Standard, variiert |
| AfA-Sätze 2,5% / 2,0% | ✅ Korrekt | §7 Abs. 4 EStG bestätigt |
| Einkommensteuer-Formel | ✅ Korrekt | §21 EStG bestätigt |
| WEG-Rücklagen sofort abzugsfähig | ⚠️ Vereinfacht | BFH 2025: erst bei Verausgabung |
| Rücklagen 10€/m²/Jahr | ⚠️ Niedrig | Altbau: 15-20€ realistischer |

> **Wichtig:** GrESt 6% = Thüringen/Sachsen-Anhalt. Sachsen = 3,5%. Bei Leipzig-Fokus muss das korrigiert werden!

---

## 6. Strategische Empfehlung für Phase 2

### Was baut der Kapitalanleger-Rechner?

**Minimale Version (MVP):**
1. Finanzierungs-Modul (Darlehen, Zinssatz, Tilgung)
2. Cashflow-Rechnung: vor Steuer
3. AfA + Einkommensteuer (§21 EStG)
4. Cashflow nach Steuer
5. Eigenkapitalrendite p.a.
6. Kaufpreisfaktor

**Differenzierungs-Feature (macht uns besser als immocation):**
- **"Bankgespräch-PDF"** — aber anstatt statisches Excel-Format:
  → Unser PDF zeigt: "Dein Deal auf 1 Seite — drucke das für die Bank"
  → Mit Joachims Kontakt als "Ihr Ansprechpartner für Finanzierungsfragen"
  → Lead-Nurturing + Conversion in einem

**10-Jahres-Projektion** (einfach):
- Miete +2%/Jahr
- Kosten +2%/Jahr
- Zinsen sinken (Tilgungsplan)
- → Cashflow-Entwicklung als Grafik

---

## Quellen
- Ivan's Excel-Dateien (selbsterstellt, authentischer Investor)
- immocation Cockpit + Roter Faden (Gratis-Version, 2017)
- Verifikation der Formeln: siehe `docs/kalkulations-referenz.md`

*Tags: #wkdi #rechner #analyse #excel #kapitalanleger #fix-flip*
