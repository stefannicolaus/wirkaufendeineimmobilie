# Conversion-Audit — wirkaufendeineimmobilie.de

> Erstellt: 16.03.2026 | Agent: NEXUS Conversion & Funnel
> Basis: Alle src/pages/ Dateien, Marketing-Konzept Sektionen 4+5, ICP-Profile

---

## EXECUTIVE SUMMARY

**Gesamtbewertung: 6/10** — Solide Grundstruktur, aber kritische Conversion-Luecken.

Die Website hat ein klares primaeres Ziel (Bewertungsanfrage), gute Messaging-Ansaetze und eine saubere Informationsarchitektur. Die groessten Probleme: (1) Die Homepage kommuniziert "Wir kaufen" statt "Wir vermitteln" — Messaging-Widerspruch zum Geschaeftsmodell, (2) Kein Social Proof auf der gesamten Website, (3) Die Danke-Seite verschenkt Conversion-Potenzial, (4) Telefonnummer fehlt im Hero, (5) "So funktioniert's" hat keinen CTA above-the-fold.

**Blocker: 2 | High: 7 | Medium: 6 | Low: 4**

---

## SEITEN-AUDIT

### 1. HOMEPAGE (index.astro)

**Primaeres Ziel:** Bewertungsanfrage (= qualifizierter Verkaeufer-Lead)
**Sekundaeres Ziel:** Weiterleitung zu Investoren-Seite

#### Messaging-Hierarchie

| Position | Ist-Zustand | Bewertung |
|----------|-------------|-----------|
| **Above the Fold** | H1: "Deine Immobilie. Unser Angebot. In 48h." | Gut — ergebnis-orientiert, Geschwindigkeit |
| Subheadline | "Sanierungsbeduerftig, geerbt oder vermuellt — wir kaufen im Ist-Zustand." | PROBLEM — sagt "wir kaufen", Geschaeftsmodell ist Vermittlung |
| Social Proof | Trust-Badges (unverbindlich, keine Kosten, 48h, notariell) | Kein echter Social Proof (keine Zahlen, keine Testimonials) |
| CTA | PLZ-Eingabe + "Kostenlos bewerten" | Gut — niedrige Schwelle, spezifisch |
| **Below the Fold** | Stats Bar, Dual Cards, 3 Schritte, Trust, FAQ, Formular | Solide Struktur |
| Trust-Section | "35+ Jahre Erfahrung" + Platzhalter-Text | PROBLEM — Platzhalter sichtbar |
| FAQ | 5 relevante Fragen | Gute Einwand-Behandlung |
| Zweiter CTA | Vollstaendiges Bewertungsformular | Gut — Wiederholung des primaeren Ziels |
| Fallback CTA | Keiner | FEHLT |

#### Findings

```
CONV-BLOCKER-MESSAGING: Homepage sagt "wir kaufen" — Geschaeftsmodell ist Vermittlung
Datei: src/pages/index.astro (Zeile 21)
Fix: Subheadline aendern zu: "Sanierungsbeduerftig, geerbt oder vermuellt — wir finden den richtigen Kaeufer. Ohne Makler, ohne Renovierung, ohne Besichtigungstourismus."
Begruendung: Wenn Verkaeufer mit der Erwartung "Direktankauf" kommen und dann erfahren dass vermittelt wird, bricht Vertrauen. Das ist der groesste Conversion-Killer der gesamten Website.
```

```
CONV-HIGH-SOCIAL-PROOF: Kein echter Social Proof auf der gesamten Homepage
Datei: src/pages/index.astro
Fix: Mindestens eine Zahl einbauen: "X Immobilien vermittelt" oder "X Jahre Erfahrung in Leipzig" als harte Zahl. Trust-Badges ("100% unverbindlich") sind Hygiene, kein Social Proof.
Begruendung: Trust-Badges reduzieren Reibung, ersetzen aber nicht den Beweis dass andere Menschen diesem Service vertraut haben.
```

```
CONV-HIGH-TRUST: Trust-Section hat sichtbaren Platzhalter-Text
Datei: src/pages/index.astro (Zeile 117)
Fix: Platzhalter entfernen oder Section ausblenden bis Joachim-Call-Content verfuegbar ist. "[Platzhalter — wird nach Call 19.03. befuellt]" zerstoert Vertrauen.
```

```
CONV-HIGH-TELEFON: Telefonnummer fehlt im Hero
Datei: src/pages/index.astro
Fix: Telefonnummer prominent unter dem Hero-Formular oder neben den Trust-Badges einbauen. Marketing-Konzept Sektion 5.2 sagt explizit: "Telefonnummer PROMINENT (Joachim: MUSS drauf)". Nav hat sie, aber Hero nicht.
Begruendung: Verkaeufer-ICP (Erben, Senioren) wollen oft erstmal anrufen. Die Telefonnummer im Hero senkt die Schwelle massiv.
```

```
CONV-MEDIUM-FALLBACK: Kein Fallback-CTA fuer "noch nicht bereit"
Datei: src/pages/index.astro
Fix: Nach dem FAQ-Block einen Fallback-CTA einbauen: Link zum Erbengemeinschaft-Guide oder Fix-Flip-Guide. "Noch nicht bereit? Laden Sie unseren kostenlosen Guide herunter."
Begruendung: Nicht jeder Besucher ist sofort bereit fuer eine Bewertungsanfrage. Ohne Fallback verliert die Seite 100% der "noch nicht soweit"-Besucher.
```

```
CONV-MEDIUM-HERO-FORM: Hero-Formular fragt nur PLZ — kein Email-Capture
Datei: src/pages/index.astro (Zeile 25-36)
Fix: Nach PLZ-Eingabe zum vollstaendigen Formular (#bewertung) scrollen oder als Progressive Disclosure: PLZ eingeben → Formular expandiert mit Email-Feld.
Begruendung: Wenn der User nur PLZ eingibt und abschickt, wird eine Bewertungsanfrage OHNE Email gespeichert (API speichert null fuer email). Der Lead ist nicht kontaktierbar.
```

```
CONV-LOW-3-PFADE: Marketing-Konzept definiert 3 Pfade ("Eigentuemer / Handwerker / Makler") — Homepage hat nur 2 Dual Cards (Verkaeufer / Kaeufer)
Datei: src/pages/index.astro (Zeile 70-84)
Fix: Dritten Pfad "Fuer Makler" ergaenzen oder bewusst auf spaeter verschieben. Makler-ICP (V5) ist ein Kanal, kein Endkunde — kann MVP-maessig warten.
```

---

### 2. INVESTOREN-SEITE (investoren.astro)

**Primaeres Ziel:** Investoren-Registrierung
**Sekundaeres Ziel:** ROI-Rechner oeffnen

#### Messaging-Hierarchie

| Position | Ist-Zustand | Bewertung |
|----------|-------------|-----------|
| **Above the Fold** | H1: "Dein naechstes Flip-Objekt. Bevor es jemand anderes sieht." | Sehr gut — Exklusivitaet + Dringlichkeit |
| Subheadline | Off-Market, kuratiert, Renditepotenzial | Gut |
| CTA | "Investoren-Zugang anfragen" (Anchor zu Formular) | Gut — spezifisch |
| **Below the Fold** | 3 Vorteile, ROI-Teaser, Registrierungsformular | Solide |
| Social Proof | Keiner | FEHLT |
| Einwand-Behandlung | Keine | FEHLT |
| Fallback CTA | Keiner | FEHLT |

#### Findings

```
CONV-HIGH-SOCIAL-PROOF: Investoren-Seite hat null Social Proof
Datei: src/pages/investoren.astro
Fix: "X Investoren bereits registriert" oder "Naechste Objekte ab [Monat]" oder Testimonial eines fruehen Investors. Selbst "Limitiert auf 50 Investoren in Leipzig" (Kuenstliche Knappheit) waere besser als nichts.
```

```
CONV-HIGH-EINWAENDE: Keine Einwand-Behandlung fuer Kaeufer
Datei: src/pages/investoren.astro
Fix: FAQ-Block ergaenzen: "Was kostet der Zugang?" (Nichts), "Wie oft kommen neue Objekte?" "Was passiert nach meiner Registrierung?" "Muss ich mich verpflichten?" — Das Marketing-Konzept hat fertige Einwand-Antworten (Sektion 4.3).
```

```
CONV-MEDIUM-FORMULAR: Investoren-Formular hat 5 Felder auf einem Schritt
Datei: src/pages/investoren.astro (Zeile 66-106)
Fix: Progressive Disclosure: Schritt 1 = Email + Name, Schritt 2 = Erfahrung + Gewerk. Multi-Step konvertiert 86% besser (Leadformly-Daten).
```

```
CONV-LOW-FALLBACK: Kein Fallback-CTA fuer Investoren die "noch nicht bereit" sind
Datei: src/pages/investoren.astro
Fix: Link zum Fix & Flip Starter-Guide nach dem Formular: "Noch kein Deal abgeschlossen? Starte mit unserem kostenlosen Guide."
```

---

### 3. ROI-RECHNER (roi-rechner.astro)

**Primaeres Ziel:** Lead-Capture via PDF-Email
**Sekundaeres Ziel:** Engagement + Verweildauer

#### Messaging-Hierarchie

| Position | Ist-Zustand | Bewertung |
|----------|-------------|-----------|
| **Above the Fold** | H1: "Was bringt dein naechster Flip? Rechne es durch." | Sehr gut |
| Tool | Interaktiver Rechner mit echten Leipzig-Daten | Einzigartig — kein Wettbewerber hat das |
| CTA | "PDF senden" nach Email-Eingabe | Gut — niedriger Schwellenwert |
| Social Proof | Keiner | FEHLT |
| Weiterleitung | Keine nach dem Rechner | FEHLT |

#### Findings

```
CONV-MEDIUM-NACH-RECHNER: Kein zweiter CTA nach dem Rechner-Ergebnis
Datei: src/pages/roi-rechner.astro
Fix: Nach dem PDF-Formular: "Bereit fuer deinen ersten Deal? → Investoren-Zugang anfragen" Button. Der User hat gerade seine Rendite berechnet — er ist warm. Diesen Moment nicht verschwenden.
```

```
CONV-LOW-PROVISION: Rechner zeigt "Provision (unsere 5%)" — das wird von Kaeufern als hoch empfunden
Datei: src/pages/roi-rechner.astro (Zeile 100-101)
Fix: Kontextualisieren: "Provision (5%, erfolgsbasiert)" oder in Klammern "inklusive aller Vermittlungsleistungen". Alternativ: Provision in der Nebenkosten-Sektion mit erklaeren.
```

---

### 4. SO FUNKTIONIERT'S (so-funktionierts.astro)

**Primaeres Ziel:** Verstaendnis aufbauen → Weiterleitung zu Bewertung/Investoren
**Sekundaeres Ziel:** Vertrauen durch Transparenz

#### Messaging-Hierarchie

| Position | Ist-Zustand | Bewertung |
|----------|-------------|-----------|
| **Above the Fold** | H1: "So funktioniert's" + kurze Subheadline | Informativ, kein CTA |
| Tabs | Verkaeufer/Kaeufer-Perspektive | Sehr gut — personalisiert |
| Prozess | 3 Schritte je Perspektive | Klar und verstaendlich |
| Angebotsverfahren | 4 Punkte (Geschlossen, Fair, Transparent, Rechtssicher) | Gut |
| CTA | Am Ende jedes Tab-Panels | Gut — kontextbezogen |
| Fallback CTA | Keiner | FEHLT |

#### Findings

```
CONV-BLOCKER-CTA: Kein CTA above-the-fold auf "So funktioniert's"
Datei: src/pages/so-funktionierts.astro
Fix: CTA-Button direkt unter die Subheadline: "Jetzt Immobilie einreichen" fuer Verkaeufer. Die Seite muss innerhalb von 5 Sekunden zeigen was der naechste Schritt ist.
Begruendung: Ein Besucher der "So funktioniert's" anklickt hat bereits Interesse. Wenn er above-the-fold keinen CTA sieht, muss er scrollen um zu handeln.
```

```
CONV-MEDIUM-ANGEBOTSVERFAHREN: Angebotsverfahren-Sektion hat keinen CTA
Datei: src/pages/so-funktionierts.astro (Zeile 89-136)
Fix: Am Ende der Angebotsverfahren-Sektion einen CTA ergaenzen: "Klingt fair? → Jetzt Objekt einreichen" oder "→ Investoren-Zugang sichern".
```

---

### 5. DANKE-SEITE (danke.astro)

**Primaeres Ziel:** Naechsten Funnel-Schritt anbieten
**Sekundaeres Ziel:** Erwartungsmanagement

#### Findings

```
CONV-HIGH-DANKE: Danke-Seite verschenkt Conversion-Potenzial
Datei: src/pages/danke.astro
Fix: Die Danke-Seite macht einiges richtig (naechster Schritt, Telefonnummer). Aber:
1. Verkaeufer-Danke: "Wie funktioniert das Angebotsverfahren?" ist schwach. Besser: "Waehrend wir Ihre Immobilie bewerten — laden Sie unseren Guide herunter: 7 Wege aus der Erben-Blockade"
2. Investor-Danke: "ROI-Rechner ausprobieren" ist gut.
3. Guide-Danke: CTA ist kontextabhaengig — gut.
Begruendung: Die Danke-Seite ist der Moment hoechster Aufmerksamkeit. Der Besucher hat gerade gehandelt. Jede Danke-Seite ohne starken naechsten Schritt ist verschwendete Conversion.
```

---

### 6. GUIDE: ERBENGEMEINSCHAFT (guides/erbengemeinschaft.astro)

**Primaeres Ziel:** Lead-Capture (Email fuer Guide-Download)
**Sekundaeres Ziel:** Qualifizierung (Anzahl Erben, Blockade-Dauer, PLZ)

#### Messaging-Hierarchie

| Position | Ist-Zustand | Bewertung |
|----------|-------------|-----------|
| **Above the Fold** | H1: "Erbengemeinschaft & Immobilie — 7 Wege aus der Blockade" | Sehr gut — Pain-Point direkt |
| Pain Points | 5 konkrete "Kommt Ihnen das bekannt vor?" Punkte | Sehr gut — VOC-basiert |
| Formular | 4 Felder (Anzahl, Dauer, PLZ, Email) | Gut — qualifizierende Fragen |
| CTA | "Guide kostenlos erhalten" | Gut — spezifisch |
| Social Proof | "Kostenlos. 14 Seiten. Sofort per E-Mail." | Minimal |

#### Findings

```
CONV-MEDIUM-GUIDE-PROOF: Erben-Guide hat keinen Social Proof
Datei: src/pages/guides/erbengemeinschaft.astro
Fix: "Bereits von X Erben heruntergeladen" oder ein Zitat aus dem Guide: "68% der Faelle blockieren Geschwister die Aufloesung — oft ueber Jahre." (VOC-Daten aus Marketing-Konzept).
```

---

### 7. GUIDE: FIX & FLIP STARTER (guides/fix-flip-starter.astro)

**Primaeres Ziel:** Lead-Capture (Email fuer Guide-Download)
**Sekundaeres Ziel:** Qualifizierung (Erfahrung, Budget, Handwerker)

#### Findings

```
CONV-LOW-GUIDE-CTA: CTA-Text "Guide kostenlos erhalten" koennte spezifischer sein
Datei: src/pages/guides/fix-flip-starter.astro (Zeile 72)
Fix: "90-Tage-Fahrplan jetzt herunterladen" — ergebnisorientierter, greift den Guide-Titel auf.
```

---

### 8. STADTTEIL-SEITEN (leipzig/[...stadtteil].astro)

**Primaeres Ziel:** SEO-Landingpage → Bewertungsanfrage
**Sekundaeres Ziel:** Weiterleitung zu ROI-Rechner

#### Findings

```
CONV-MEDIUM-STADTTEIL: Stadtteil-Seiten haben keinen Fallback-CTA
Datei: src/pages/leipzig/[...stadtteil].astro
Fix: Zwischen CTA-Sektion und Internal Links einen Fallback ergaenzen: Link zum passenden Guide ("Wohnung geerbt in [Stadtteil]? Guide herunterladen").
```

---

### 9. LEGAL PAGES (impressum.astro, datenschutz.astro)

Keine Conversion-relevanten Findings. Platzhalter in Impressum und Datenschutz muessen vor Go-Live befuellt werden — das ist kein Conversion-Issue sondern Legal-Compliance.

---

## CROSS-SITE FINDINGS

```
CONV-HIGH-MESSAGING-WIDERSPRUCH: "Wir kaufen" vs. Vermittlungsmodell — zieht sich durch die gesamte Website
Dateien: index.astro (Zeile 21), Domain "wirkaufendeineimmobilie.de"
Fix: Die Domain impliziert Direktankauf. Der Subheadline-Text verstaerkt das. Die FAQ klaert es (Angebotsverfahren), aber die meisten Besucher lesen keine FAQ. Vorschlag:
- Hero-Copy aendern: "Wir finden den passenden Kaeufer — in 48h" statt "wir kaufen"
- Alternativ: bewusst bei "wir kaufen" bleiben und im Gespraech aufklaeren (Joachim-Entscheidung)
- Die Domain selbst ist stark und sollte bleiben — aber die Copy muss die Realitaet widerspiegeln
```

```
CONV-HIGH-KEIN-SOCIAL-PROOF-GLOBAL: Keine einzige Seite hat echten Social Proof (Testimonial, Case Study, Zahl)
Dateien: Alle
Fix: Prioritaet fuer Joachim-Call: Mindestens 1 Case Study (Vorher-Nachher MIT Zahlen), 1 Testimonial (Verkaeufer oder Kaeufer), 1 harte Zahl (Deals, Jahre, Netzwerk-Groesse). Bis dahin: "35+ Jahre Immobilienerfahrung" als harte Zahl nutzen, nicht als Platzhalter-Text.
```

---

## FORMULAR-AUDIT

| Formular | Felder | Problem | Fix |
|----------|--------|---------|-----|
| Hero PLZ-Form | 1 (PLZ) | Kein Email-Capture — Lead nicht kontaktierbar | Progressive Disclosure oder Scroll zu #bewertung |
| Bewertungs-Form | 4 (PLZ, Name, Email, Tel) | OK — 2 Pflicht, 2 optional | Gut |
| Investor-Form | 5 (Name, Email, Tel, Erfahrung, Gewerk) | Zu viele Felder auf einem Schritt | Multi-Step (Email+Name → Rest) |
| Erben-Guide-Form | 4 (Anzahl, Dauer, PLZ, Email) | OK — gute Qualifizierungsfragen | Gut |
| Flip-Guide-Form | 4 (Erfahrung, Budget, Handwerker, Email) | OK — gute Qualifizierungsfragen | Gut |
| ROI-PDF-Form | 1 (Email) | Gut — minimale Schwelle | Gut |
| Stadtteil-Form | 1 (PLZ) | Gleicher Bug wie Hero-Form: kein Email | Progressive Disclosure |

---

## A/B-TEST-HYPOTHESEN

### Hypothese 1: Hero-Headline Verkaeufer-Fokus

**Seite:** / (Homepage)
**Element:** H1 Headline
**Hypothese:** Wenn wir die H1 von "Deine Immobilie. Unser Angebot. In 48h." zu "Geerbt. Blockiert. Geloest." aendern, dann steigt die Bewertungsanfrage-Rate um 15-25%, weil die Erbengemeinschaft das groesste ICP-Segment ist (670 verkaufswillig/Jahr in Leipzig) und die emotionale Ansprache staerker konvertiert als die generische.
**Metrik:** Bewertungs-Formular Submissions / Homepage Sessions
**Prioritaet:** HIGH
**Aufwand:** S

### Hypothese 2: PLZ-Form → Full Form Progressive Disclosure

**Seite:** / (Homepage Hero)
**Element:** Hero-Formular
**Hypothese:** Wenn wir nach PLZ-Eingabe das Formular um Email-Feld expandieren (statt nur PLZ abzuschicken), dann steigt die kontaktierbare-Lead-Rate um 40-60%, weil der User bereits committed ist (PLZ eingegeben) und ein zweites Feld niedrige Zusatzreibung hat.
**Metrik:** Bewertungs-Submissions MIT Email / Alle Submissions
**Prioritaet:** HIGH
**Aufwand:** S

### Hypothese 3: Telefonnummer im Hero

**Seite:** / (Homepage)
**Element:** Hero-Section
**Hypothese:** Wenn wir die Telefonnummer prominent im Hero platzieren (neben oder unter dem Formular), dann steigen die Telefon-Leads um 20-30%, weil das primaere Verkaeufer-ICP (45-70 Jahre, Erben) telefonische Erstansprache bevorzugt.
**Metrik:** Eingehende Anrufe / Homepage Sessions (Tracking via Call-Tracking-Nummer)
**Prioritaet:** HIGH
**Aufwand:** S

### Hypothese 4: Social Proof Bar nach Hero

**Seite:** / (Homepage)
**Element:** Neue Section zwischen Hero und Stats Bar
**Hypothese:** Wenn wir eine Social-Proof-Bar mit "35+ Jahre Erfahrung | X Objekte vermittelt | Leipzig-Spezialist" direkt nach dem Hero einbauen, dann steigt die Scroll-Tiefe um 15% und die Formular-Completion um 10%, weil Trust-Signale frueh im Funnel die Abbruchrate reduzieren.
**Metrik:** Scroll Depth + Formular Submissions
**Prioritaet:** MEDIUM
**Aufwand:** S

### Hypothese 5: Investoren Multi-Step-Formular

**Seite:** /investoren
**Element:** Registrierungsformular
**Hypothese:** Wenn wir das 5-Feld-Formular in einen 2-Step-Flow umbauen (Step 1: Email + Name, Step 2: Erfahrung + Gewerk), dann steigt die Completion-Rate um 30-50%, weil Multi-Step-Formulare 86% besser konvertieren als Single-Step (Leadformly, 10.000+ Formulare).
**Metrik:** Investor-Registrierungen / Investoren-Page Sessions
**Prioritaet:** MEDIUM
**Aufwand:** M

---

## PRIORITAETEN-MATRIX

| # | Finding | Severity | Aufwand | Impact |
|---|---------|----------|---------|--------|
| 1 | Messaging "wir kaufen" vs. Vermittlung | BLOCKER | S | Website-Glaubwuerdigkeit |
| 2 | Kein CTA above-the-fold auf /so-funktionierts | BLOCKER | S | Verlorene warme Leads |
| 3 | Hero-Form ohne Email-Capture | HIGH | S | Nicht-kontaktierbare Leads |
| 4 | Kein Social Proof global | HIGH | M | Vertrauensdefizit |
| 5 | Telefonnummer fehlt im Hero | HIGH | S | Verlorene Telefon-Leads |
| 6 | Trust-Section Platzhalter sichtbar | HIGH | S | Vertrauensbruch |
| 7 | Danke-Seite verschenkt Potenzial | HIGH | S | Verlorene Cross-Sell |
| 8 | Investoren: Keine Einwaende | HIGH | M | Hohe Abbruchrate |
| 9 | Investoren: Kein Social Proof | HIGH | M | Fehlendes Vertrauen |
| 10 | Homepage: Kein Fallback-CTA | MEDIUM | S | Verlorene "nicht bereit"-Leads |
| 11 | Investoren: Formular zu lang | MEDIUM | M | Abbruch bei Registrierung |
| 12 | ROI-Rechner: Kein zweiter CTA | MEDIUM | S | Warme Leads nicht konvertiert |
| 13 | So-funktioniert's: Angebotsverfahren ohne CTA | MEDIUM | S | Fehlende Handlungsaufforderung |
| 14 | Erben-Guide: Kein Social Proof | MEDIUM | S | Weniger Downloads |
| 15 | Stadtteil-Seiten: Kein Fallback | MEDIUM | S | Verlorene SEO-Leads |
| 16 | 3 Pfade statt 2 auf Homepage | LOW | M | Fehlender Makler-Kanal |
| 17 | Flip-Guide CTA-Text generisch | LOW | S | Marginal |
| 18 | ROI-Rechner Provision nicht erklaert | LOW | S | Marginal |
| 19 | Stadtteil-Form ohne Email (wie Hero) | LOW | S | Gleicher Bug |

---

## EMPFOHLENE REIHENFOLGE (vor Joachim-Call Do 19.03.)

**Sofort fixbar (30 Min):**
1. Hero-Subheadline: "wir kaufen" → "wir finden den richtigen Kaeufer" (oder Joachim entscheidet bewusst bei "kaufen" zu bleiben)
2. Trust-Section Platzhalter entfernen/ausblenden
3. CTA above-the-fold auf /so-funktionierts ergaenzen
4. Telefonnummer im Hero prominent machen

**Vor Launch (2-3h):**
5. Hero-Form → Progressive Disclosure (PLZ → Email)
6. Danke-Seite staerken (Guide-Link fuer Verkaeufer)
7. Fallback-CTAs auf Homepage + Investoren + Stadtteil-Seiten
8. Investoren FAQ-Block (Einwand-Behandlung aus Marketing-Konzept Sektion 4.3)

**Nach Joachim-Call (Content noetig):**
9. Social Proof befuellen (Zahlen, Case Study, Testimonial)
10. Trust-Section mit echtem Content
11. Investoren Multi-Step-Formular

---

*Conversion-Audit v1.0 — NEXUS Conversion & Funnel Agent*
*Basis: 10 Seiten, 7 Formulare, Marketing-Konzept Sektionen 1-5*
