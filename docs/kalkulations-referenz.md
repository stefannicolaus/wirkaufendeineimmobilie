# WKDI — Kalkulations-Referenz (Verifiziert)

> Stand: 2026-03-22 | Basis: §7 EStG, §21 EStG, BFH-Urteil 14.01.2025 (IX R 19/24)
> Alle Formeln durch Deep Research verifiziert — nicht blind aus Ivan's Excel übernommen.

---

## 1. AfA (Gebäudeabschreibung) — §7 Abs. 4 EStG ✅ KORREKT

### Abschreibungssätze (gesetzlich)

| Baujahr | Satz | Nutzungsdauer |
|---------|------|---------------|
| ≤ 31.12.1924 | **2,5% p.a.** | 40 Jahre |
| 01.01.1925 – 31.12.2022 | **2,0% p.a.** | 50 Jahre |
| ab 01.01.2023 (Neubau) | **3,0% p.a.** | 33,3 Jahre |

### Bemessungsgrundlage

- Nur **Gebäudeanteil** absetzbar — **Bodenwert (Grundstück) NICHT**
- Standard-Annahme: 80% Gebäude / 20% Boden *(vereinfacht — kein gesetzlicher Standard!)*
- Real: abhängig vom Bodenrichtwert (BMF Arbeitshilfe)
- Für Zentrallagen Leipzig: 70/30 oder 65/35 realistischer

### Formel (monatlich)

```
Jahres-AfA = Kaufpreis × Gebäudeanteil% × Abschreibungssatz%
Monatliche AfA = Jahres-AfA / 12
```

**Beispiel:** €200.000 | Baujahr 1920 | 80% Gebäude
- Gebäudeanteil: €160.000
- Jahres-AfA: €160.000 × 2,5% = **€4.000/Jahr**
- Monatlich: **€333/Monat**

### Code (verifiziert)

```typescript
const gebaeudanteil = kaufpreis * gebaeudeanteilProzent; // default 0.80
const afa_satz = baujahr <= 1924 ? 0.025 : (baujahr >= 2023 ? 0.03 : 0.02);
const jahresAfA = gebaeudanteil * afa_satz;
const monatlicheAfA = jahresAfA / 12;
```

---

## 2. Einkommensteuer auf Mieteinnahmen — §21 EStG ✅ KORREKT

### Allowable Werbungskosten

| Position | Absetzbar? | Hinweis |
|----------|-----------|---------|
| Schuldzinsen (Darlehenszinsen) | ✅ Ja — vollständig | Nur Zinsen, **NICHT Tilgung** |
| Tilgung (Amortisation) | ❌ Nein | Kein Werbungskosten |
| AfA Gebäude | ✅ Ja | Wie oben |
| Grundsteuer | ✅ Ja | Als Werbungskosten absetzbar |
| WEG-Verwaltungskosten | ✅ Ja | Nicht umlagefähig → abzugsfähig |
| nicht umlagefähige Betriebskosten | ✅ Ja | |
| WEG-Rücklagen | ⚠️ Technisch NEIN (sofort) | BFH 14.01.2025: erst bei Verausgabung durch WEG. Vereinfacht: als Abzug modellieren |
| Reparaturkosten (Sondereigentum) | ✅ Ja | Wenn nicht aktivierungspflichtig |

> **BFH 14.01.2025 (IX R 19/24):** WEG-Rücklagen erst abzugsfähig wenn WEG das Geld tatsächlich ausgibt — nicht beim Einzahlen! Für Cashflow-Rechner: vereinfachte Sofort-Absetzung als Annahme akzeptabel, aber per Tooltip kommunizieren.

### Berechnung (monatlich)

```
Brutto-Kaltmiete
− Zinsen an Bank (nur Zinsen, nicht Tilgung!)
− Zinsen an Darlehensgeber (Privatdarlehen etc.)
− nicht umlagefähige Kosten (Verwaltung, nicht umlegbare Betriebskosten)
− WEG-Rücklagen (vereinfacht; streng: erst bei Verausgabung)
− monatliche AfA
= zu versteuernder Cashflow (kann negativ sein!)
× persönlicher Grenzsteuersatz
= Einkommensteuer (positiv = Steuerlast, negativ = Steuerersparnis!)

Netto-Kaltmiete = Brutto-Kaltmiete − Einkommensteuer
```

### Grenzsteuersätze (Orientierung 2025)

| Einkommen p.a. | Grenzsteuersatz |
|----------------|----------------|
| bis ~€17.006 | 0% |
| ~€17.006 – €66.760 | 14% – 42% (progressiv) |
| ~€66.760 – €277.826 | **42%** |
| über €277.826 | **45%** |

*Für Rechner: 30%, 40%, 42%, 45% als Auswahloptionen*

### Code (verifiziert)

```typescript
const werbungskosten = zinsen + nichtUmlagefaehigeKosten + monatlicheAfA;
const zuversteuernderCashflow = bruttoKaltmiete - werbungskosten;
const einkommensteuer = zuversteuernderCashflow * grenzsteuersatz;
const nettoKaltmiete = bruttoKaltmiete - einkommensteuer;
// Hinweis: negatives einkommensteuer = Steuerersparnis (mindert Steuerlast auf andere Einkünfte)
```

---

## 3. Hausgeld / Rücklagen / Grundsteuer Leipzig

### Rücklagen Empfehlung (2025)

| Gebäudetyp | €/m²/Monat | €/m²/Jahr |
|-----------|-----------|----------|
| Neubau (< 10 Jahre) | €0,50–€1,00 | €6–€12 |
| Bestand (10–30 Jahre) | €1,00–€1,50 | **€12–€18** |
| Altbau (> 30 Jahre, unsaniert) | €1,50–€2,00+ | **€18–€24+** |

*Ivan's €10–15/m²/Jahr: Untergrenze. Für Altbau Leipzig: €15–20 realistischer.*
*Rechner-Default: €12–15, Altbau-Warning bei Baujahr < 1960*

### Hausgeld Split

| Komponente | Umlagefähig? |
|-----------|------------|
| Heizung, Warmwasser, Wasser, Müll | ✅ Ja |
| Gebäudeversicherung | ✅ Ja |
| Grundsteuer | ✅ Ja (kann umgelegt werden) |
| WEG-Verwaltungskosten | ❌ Nein |
| Instandhaltungsrücklage | ❌ Nein |

**Typischer Split:** ~40% umlagefähig / ~60% nicht umlagefähig
→ Landlord trägt: wenn Hausgeld €3,50–4,50/m²/Monat → ca. €2,10–2,70/m²/Monat

### Grundsteuer Leipzig 2025

- **Hebesatz seit 01.01.2025: 450%** (gesenkt von 650% — Grundsteuerreform 2025)
- Praktische Schätzung für 60–80m² Altbau-ETW: ca. **€200–500/Jahr** (€17–42/Monat)
- Für Rechner: **€1,50–3,00/m²/Jahr** als Schätzwert
- Ist umlagefähig → kann auf Mieter umgelegt werden

---

## 4. Kaufpreisfaktor / Vervielfältiger

### Formeln

```
Kaufpreisfaktor = Kaufpreis / Jahresnettokaltmiete
Brutto-Mietrendite = 100 / Kaufpreisfaktor  [in %]

Netto-Mietrendite = (Jahresmiete − jährliche Bewirtschaftungskosten)
                    / (Kaufpreis + Kaufnebenkosten) × 100
```

### Bewertungstabelle

| Kaufpreisfaktor | Brutto-Rendite | Einschätzung |
|----------------|---------------|-------------|
| < 15 | > 6,7% | Sehr gut / B/C-Lage-Signal |
| 15–20 | 5,0%–6,7% | Gut |
| 20–25 | 4,0%–5,0% | **Standard (Leipzig 2026)** |
| 25–30 | 3,3%–4,0% | Akzeptabel |
| > 30 | < 3,3% | Niedrig (München, Teile Berlins) |

### Leipzig-Marktdaten 2025/2026

| Kennzahl | Wert |
|---------|------|
| Ø Kaufpreis ETW | ca. €3.100–3.450/m² |
| Ø Kaltmiete (60–80m²) | ca. €9–11/m² |
| Implied Bruttorendite | ca. **3,75%** |
| Implied Kaufpreisfaktor | ca. **25–28** |

**Gutes Deal in Leipzig:** Faktor ≤ 22–25 (Rendite ≥ 4%)

---

## 5. DCF (Discounted Cash Flow) — Immobilien

### Grundformel

```
NPV = Σ [CFt / (1+r)^t]  +  [TV / (1+r)^n]
       t=1 bis n

CF = Netto-Cashflow in Jahr t (nach Kosten)
r  = Diskontierungszinssatz
TV = Terminal Value (Residualwert) in Jahr n
n  = Haltedauer (typisch 10, 20, 30 Jahre)
```

### Terminal Value

```
TV = Jahresnettomiete_Jahr_n × Kaufpreisfaktor_Exit
```
Oder: Gordon Growth Model: `TV = CF(n+1) / (r − g)`

### Diskontierungszinssatz Leipzig 2025

| Lagenqualität | Typische Bandbreite |
|--------------|-------------------|
| A-Städte, Toplage | 3,5%–4,5% |
| **B-Städte, gute Lage (Leipzig)** | **4,5%–6,0%** |
| Periphere / einfache Lagen | 6,0%–8,5% |

**Empfehlung für Rechner: 5,0% als Default** (adjustierbar 3,5%–8%)

### Mietsteigerungs-Annahmen

| Szenario | Rate p.a. |
|---------|----------|
| Konservativ | 1,0% |
| **Standard (Empfehlung)** | **2,0%** |
| Optimistisch (Leipzig Trend) | 2,5%–3,0% |

*Leipzig 2011–2026: ca. 5% p.a. (Aufholphase). Forward: 2,0%–2,5% realistisch.*

### Code (verifiziert)

```typescript
let npv = 0;
let cashflowAktuell = nettoJahresCashflow; // Jahr 1
for (let t = 1; t <= haltedauer; t++) {
  cashflowAktuell = nettoJahresCashflow * Math.pow(1 + mietsteigerung, t - 1);
  npv += cashflowAktuell / Math.pow(1 + diskontRate, t);
}
const terminalValue = (cashflowAktuell / 12 * 12) * exitKaufpreisfaktor; // letzte Jahresnettomiete × Faktor
npv += terminalValue / Math.pow(1 + diskontRate, haltedauer);
```

### Empfohlene Rechner-Defaults

| Parameter | Default | Range |
|-----------|---------|-------|
| Diskontrate | 5,0% | 3,5%–8% |
| Mietsteigerung | 2,0% | 1%–3% |
| Exit-Kaufpreisfaktor | =Einstiegsfaktor | −3 |
| Haltedauer | 10 Jahre | 5/10/20/30 |

---

## 6. GIK — Gesamte Investitionskosten

```
GIK = Kaufpreis
    + Grunderwerbsteuer (Sachsen: 3,5%)
    + Notar & Grundbuch (~1,5–2,0%)
    + Makler (0–3,57%)
    + Renovierungskosten
= echter Kapitaleinsatz für Renditeberechnung
```

---

## Quellen (verifiziert)

- §7 Abs. 4 EStG — gesetze-im-internet.de
- §21 EStG — gesetze-im-internet.de
- BFH-Urteil 14.01.2025 (IX R 19/24) — WEG-Rücklagen
- BMF Arbeitshilfe Kaufpreisaufteilung — bundesfinanzministerium.de
- Grundsteuer Leipzig Hebesatz 450% ab 2025 — Stadt Leipzig / Leipziger Zeitung
- GeoMap Renditeatlas 2025 — realestatepilot.com
- Immoprentice.de — Hausgeld Split
- VDIV — Rücklageempfehlungen 2024/2025
