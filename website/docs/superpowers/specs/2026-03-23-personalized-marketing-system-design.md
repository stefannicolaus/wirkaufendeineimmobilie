# WKDI Personalized Marketing System — Design Spec
**Date:** 2026-03-23
**Branch:** feat/website-build
**Stack:** Astro SSR, SQLite (better-sqlite3), Brevo API

---

## 1. Ziel

Besucher je nach Lebenssituation erkennen, durch den richtigen Funnel führen und in Brevo segmentiert tracken. Grundlage für Email-Serien pro Segment.

---

## 2. Segmente & Brevo-Struktur

7 B2C-Segmente, je eine Brevo-Liste:

| Segment | Lead Magnet | Zustand | Brevo-Listen-Env-Var |
|---|---|---|---|
| Erbengemeinschaft | Aktionsplan Erbengemeinschaft | Email-Gate fehlt | `BREVO_LIST_ID_ERBEN` |
| Fix&Flip Anfänger | 90-Tage-Blueprint | Email-Gate fehlt | `BREVO_LIST_ID_BLUEPRINT` |
| Betreuer/Vormund | Entscheidungskompass | Email-Gate fehlt | `BREVO_LIST_ID_KOMPASS` |
| Kapitalanleger/Renovierung | ROI-Rechner | Email-Gate vorhanden | `BREVO_LIST_ID_ROI` |
| Langzeitinvestor/Vermieter | KA-Rechner | Email-Gate vorhanden | `BREVO_LIST_ID_KAPITALANLEGER` |
| Scheidung | NEU (bauen) | — | `BREVO_LIST_ID_SCHEIDUNG` |
| Beruflicher Umzug | NEU (bauen) | — | `BREVO_LIST_ID_UMZUG` |

**Brevo-Setup (einmalig manuell vor Deploy):**
- 7 Listen in Brevo anlegen
- 1 DOI-Template erstellen (shared, mit segment-spezifischer Redirect-URL)
- 1 Welcome-Automation pro Liste (triggert nach DOI-Bestätigung)
- Alle Listen-IDs als Env-Vars in `.env`

**⚠️ Ausstehend (Phase 2):** Email-Serien-Content für alle 7 Segmente — insbesondere für Scheidung und Umzug. Inhalte werden nach erstem Lead-Eingang mit Joachim entwickelt.

---

## 3. Opt-in Flow (alle Segmente)

### 3a. Bestehende Lead Magnets (Aktionsplan, Blueprint, Kompass)

```
/[lm]/index.astro  →  Email-Gate-Form (Vorname + Email + Checkbox)
  → POST /api/lead-magnet
  → SQLite: INSERT mit doi_confirmed=false, ref_nr
  → Brevo: createDoiContact (segment-spezifische Liste + Redirect-URL)
  → Response: { status: 'doi_pending' }
  → Seite: "Fast fertig" — Zwischenscreen (siehe 3c)

Nutzer klickt Bestätigungslink in DOI-Mail
  → Brevo redirect: /api/confirm-lead?ref=WKDI-YYYYMMDD-XXXX
  → Endpoint: doi_confirmed=true in SQLite
  → Notification an Joachim (Brevo transactional)
  → Brevo Automation: Welcome-Mail startet
  → Weiterleitung: /danke?typ=doi-bestaetigt&segment=[typ]

start.astro (Fragebogen) zugänglich nach DOI-Bestätigung via Link in Welcome-Mail
```

### 3b. Rechner-Lead Magnets (ROI-Rechner, KA-Rechner)

```
/roi-rechner  →  Formular (Kalkulations-Daten + Vorname + Email + Checkbox)
  → POST /api/roi-report
  → Kalkulation durchführen
  → SQLite: INSERT mit doi_confirmed=false, ref_nr, alle Kalkulations-Daten
  → Brevo: createDoiContact (Liste ROI + Redirect-URL mit ref_nr)
  → Seite: "Fast fertig" — Zwischenscreen (siehe 3c)

Nutzer klickt Bestätigungslink in DOI-Mail
  → Brevo redirect: /api/confirm-report?ref=WKDI-YYYYMMDD-XXXX
  → Endpoint: SQLite lookup via ref_nr → PDF generieren (Puppeteer) → Brevo versenden
  → doi_confirmed=true in SQLite
  → Brevo Automation: Welcome-Sequenz startet
  → Weiterleitung: /danke?typ=report-versendet
```

**Gleiches Muster für KA-Rechner** mit `ref_nr`-Präfix `KA-`.

### 3c. "Fast fertig" — Zwischenscreen nach Form-Submit

Segment-spezifischer Screen zwischen Submit und DOI-Bestätigung. Erklärt einem DAU klar was passiert:

```
✉️  Fast fertig — check deine E-Mails

Wir haben dir gerade eine E-Mail von
office@wirkaufendeineimmobilie.de geschickt.
Klick auf den Bestätigungslink darin —
dann erhältst du sofort [Ressource].

Was dich erwartet:
✓ [benefit 1 — segment-spezifisch]
✓ [benefit 2]
✓ [benefit 3]
✓ [benefit 4]

⚠️  Mail nicht da? Schau in deinen Spam-Ordner.
    Absender: office@wirkaufendeineimmobilie.de
```

**Benefits-Texte pro Segment** (kein generisches "Joachims persönlicher Kommentar" bei automatisierten Reports):

- ROI-Rechner: Deal-Score, ROI + Eigenkapital-Rendite, Break-even, nächste Schritte
- KA-Rechner: Netto-Cashflow/Monat, AfA-Vorteil/Jahr, NPV-Szenarien, Kaufpreisfaktor
- Aktionsplan Erben: 7 priorisierte Schritte, Blockade-Kosten-Rechner, Verhandlungs-Skript, Marktwert-Schätzung
- Blueprint: 90-Tage-Fahrplan, Budgetplanung, Handwerker-Checkliste
- Kompass: Rechte & Pflichten als Betreuer, Schritt-für-Schritt-Entscheidungsbaum
- Scheidung: Schnell-Aktionsplan auf deine Situation zugeschnitten
- Umzug: Checkliste für stressfreien Verkauf unter Zeitdruck

---

## 4. Neue Lead Magnets

### `/scheidung` — "Dein Schnell-Aktionsplan: Immobilie bei Scheidung"

**index.astro:** Landing-Page, Joachim analysiert persönlich, 24h Rückmeldung
**Email-Gate → DOI → start.astro (Fragebogen):**
1. Einigung mit Partner? (Ja / Nein / In Verhandlung)
2. Zeitdruck? (Sofort / In 3 Monaten / Kein Druck)
3. PLZ der Immobilie

**Nach DOI:** Notification an Joachim → Joachim antwortet manuell
**⚠️ Ausstehend:** Email-Serien-Content für dieses Segment

### `/umzug` — "Deine Checkliste: Verkauf bei Umzug"

**index.astro:** Landing-Page, schnell verkaufen ohne Stress
**Email-Gate → DOI → start.astro (Fragebogen):**
1. Umzug wann? (Bereits erfolgt / 1–3 Monate / 3–6 Monate)
2. Immobilie bereits leer? (Ja / Nein, noch bewohnt)
3. PLZ der Immobilie

**Nach DOI:** Notification an Joachim → Joachim antwortet manuell
**⚠️ Ausstehend:** Email-Serien-Content für dieses Segment

---

## 5. Homepage Contextual CTAs

Scenario-Cards bekommen segment-spezifische CTAs statt generischer Footer-Links:

| Scenario-Card | CTA-Text | Ziel |
|---|---|---|
| Erbengemeinschaft | "Aktionsplan holen →" | `/aktionsplan-erbengemeinschaft` |
| Messie / Trödel | "Kostenlos bewerten →" | `#hero-form` |
| GEG-Sanierung | "Kostenlos bewerten →" | `#hero-form` |
| Insolvenzverfahren | "Kostenlos bewerten →" | `#hero-form` |
| Kapitalanleger/Renovierung | "ROI berechnen →" | `/roi-rechner` |
| Scheidung | "Schnell-Aktionsplan holen →" | `/scheidung` |
| Beruflicher Umzug | "Checkliste holen →" | `/umzug` |

**Footer:** Lead Magnet Links entfernen. Nur: Impressum, Datenschutz, Für Makler, Für Tippgeber.

---

## 6. Code-Änderungen (Übersicht)

### Neue Dateien
- `src/pages/scheidung/index.astro`
- `src/pages/scheidung/start.astro`
- `src/pages/umzug/index.astro`
- `src/pages/umzug/start.astro`
- `src/pages/api/confirm-lead.ts` — DOI-Bestätigung für manuelle LMs
- `src/pages/api/confirm-report.ts` — DOI-Bestätigung + PDF-Versand für Rechner

### Geänderte Dateien
- `src/lib/db.ts` — `doi_confirmed BOOLEAN DEFAULT 0` + `ref_nr TEXT` zu `registrations` + `leads_kapitalanleger`
- `src/pages/api/lead-magnet.ts` — DOI-Trigger pro Segment, Brevo-Listen-Zuweisung
- `src/pages/api/roi-report.ts` — Kalkulation speichern ohne sofort PDF senden; DOI triggern
- `src/pages/api/kapitalanleger-report.ts` — gleich wie roi-report
- `src/pages/aktionsplan-erbengemeinschaft/index.astro` — Email-Gate einfügen
- `src/pages/90-tage-blueprint/index.astro` — Email-Gate einfügen
- `src/pages/entscheidungskompass-betreuung/index.astro` — Email-Gate einfügen
- `src/pages/index.astro` — Contextual CTAs auf Scenario-Cards
- `src/components/Footer.astro` — Lead Magnet Links entfernen

### Env-Vars (neu)
```
BREVO_LIST_ID_ERBEN=
BREVO_LIST_ID_BLUEPRINT=
BREVO_LIST_ID_KOMPASS=
BREVO_LIST_ID_ROI=
BREVO_LIST_ID_KAPITALANLEGER=
BREVO_LIST_ID_SCHEIDUNG=
BREVO_LIST_ID_UMZUG=
```

---

## 7. Offene Punkte (Phase 2)

- Email-Serien-Content für alle 7 Segmente (Texte mit Joachim entwickeln)
- Insbesondere: Scheidung + Umzug Serien
- Brevo Automation-Setup (Welcome + Follow-ups) nach Content-Entwicklung
- Joachims Stimme in Sequenzen einbetten (persönliche Note nach automatisiertem Report)
