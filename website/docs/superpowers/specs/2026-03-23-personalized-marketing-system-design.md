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

**Regel: Notification an Joachim feuert immer nach DOI-Bestätigung (confirm-time), nicht bei Form-Submit. Grund: keine Benachrichtigungen für unbestätigte Adressen.**

**DSGVO-Pflicht: Alle Email-Gate-Formulare müssen `<FormPrivacyHint />` + Checkbox mit Link zu /datenschutz enthalten.**

### 3a. Bestehende Lead Magnets (Aktionsplan, Blueprint, Kompass)

```
/[lm]/index.astro  →  Email-Gate-Form (Vorname + Email + FormPrivacyHint + Checkbox)
  → POST /api/lead-magnet
  → SQLite: INSERT mit doi_confirmed=false, ref_nr
  → Brevo: createDoiContact(email, liste, redirectionUrl=BASE_URL+'/api/confirm-lead?ref='+ref_nr)
    ↳ redirectionUrl ist dynamisch pro Submission — KEIN statischer Env-Var
  → Response: { status: 'doi_pending' }
  → Seite: "Fast fertig" — Zwischenscreen (siehe 3c)

Nutzer klickt Bestätigungslink in DOI-Mail
  → Brevo redirect: /api/confirm-lead?ref=WKDI-YYYYMMDD-XXXX (GET)
  → Endpoint-Logik:
      ref nicht gefunden → redirect /danke?typ=doi-fehler
      ref bereits confirmed → redirect /danke?typ=doi-bestaetigt (idempotent, kein Fehler)
      ref valide, unconfirmed:
        → doi_confirmed=true in SQLite
        → Notification an Joachim (Brevo transactional)
        → Brevo Automation startet automatisch via Listen-Mitgliedschaft
        → redirect /danke?typ=doi-bestaetigt&segment=[typ]

start.astro (Fragebogen) zugänglich nach DOI-Bestätigung via Link in Welcome-Mail
```

### 3b. Rechner-Lead Magnets (ROI-Rechner, KA-Rechner)

```
/roi-rechner  →  Formular (Kalkulations-Daten + Vorname + Email + FormPrivacyHint + Checkbox)
  → POST /api/roi-report
  → Kalkulation durchführen
  → SQLite: INSERT mit doi_confirmed=false, ref_nr (Präfix WKDI-), alle Kalkulations-Daten
  → Brevo: createDoiContact(email, BREVO_LIST_ID_ROI, redirectionUrl=BASE_URL+'/api/confirm-report?ref='+ref_nr)
    ↳ redirectionUrl enthält ref_nr dynamisch — so weiß confirm-report welches PDF zu senden ist
  → Seite: "Fast fertig" — Zwischenscreen (siehe 3c)

Nutzer klickt Bestätigungslink in DOI-Mail
  → Brevo redirect: /api/confirm-report?ref=WKDI-YYYYMMDD-XXXX (GET)
  → Endpoint-Logik:
      ref nicht gefunden → redirect /danke?typ=doi-fehler
      ref bereits confirmed → redirect /danke?typ=report-versendet (idempotent, kein Doppel-Send)
      ref valide, unconfirmed:
        → SQLite lookup via ref_nr → PDF generieren (Puppeteer) → Brevo versenden
        → doi_confirmed=true in SQLite
        → Brevo Automation startet automatisch via Listen-Mitgliedschaft
        → redirect /danke?typ=report-versendet
```

**Gleiches Muster für KA-Rechner** mit `ref_nr`-Präfix `KA-`.

**Implementation-Entscheidung PDF-Timing:** Puppeteer-PDF-Generierung dauert 2–8 Sekunden — zu langsam für einen synchronen GET-Handler der dann redirecten muss. Lösung: PDF bereits bei POST (`/api/roi-report`) generieren und als Base64 in SQLite speichern (`pdf_base64 TEXT`). `confirm-report` liest den gespeicherten PDF-Blob aus SQLite und sendet ihn via Brevo — kein zweiter Puppeteer-Aufruf. Spalte `pdf_base64` ebenfalls via idempotentes ALTER TABLE hinzufügen.

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
- Formular enthält `<FormPrivacyHint />` + Datenschutz-Checkbox (DSGVO-Pflicht)
1. Einigung mit Partner? (Ja / Nein / In Verhandlung)
2. Zeitdruck? (Sofort / In 3 Monaten / Kein Druck)
3. PLZ der Immobilie

**Nach DOI:** Notification an Joachim → Joachim antwortet manuell
**⚠️ Ausstehend:** Email-Serien-Content für dieses Segment

### `/umzug` — "Deine Checkliste: Verkauf bei Umzug"

**index.astro:** Landing-Page, schnell verkaufen ohne Stress
**Email-Gate → DOI → start.astro (Fragebogen):**
- Formular enthält `<FormPrivacyHint />` + Datenschutz-Checkbox (DSGVO-Pflicht)
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
- `src/pages/api/confirm-lead.ts` (NEU) — GET-Endpoint, DOI-Bestätigung für manuelle LMs. Logik: ref-not-found → `/danke?typ=doi-fehler`, already-confirmed → `/danke?typ=doi-bestaetigt` (idempotent), valid → confirm + notify + redirect
- `src/pages/api/confirm-report.ts` (NEU) — GET-Endpoint, DOI-Bestätigung + PDF-Versand für Rechner. Gleiche Fehler-Logik; valid → PDF generieren + senden → `/danke?typ=report-versendet`

### Geänderte Dateien
- `src/lib/db.ts`
  - `doi_confirmed BOOLEAN DEFAULT 0` + `ref_nr TEXT` zu `registrations` + `leads_kapitalanleger`
  - Migration via idempotentes `try { ALTER TABLE } catch {}` (bestehendes Pattern — kein `_migrations`-Eintrag)
  - `triggerBrevoDoubleOptIn`: statisches `redirectUrl`-Feld entfernen, stattdessen `redirectionUrl` als Pflicht-Parameter pro Call. Bestehende `BREVO_DOI_REDIRECT_URL` Env-Var entfernen — war global/statisch, wird ersetzt durch dynamische URL pro Submission (`${SITE_BASE_URL}/api/confirm-lead?ref=${ref_nr}`)
- `src/pages/api/lead-magnet.ts` — DOI-Trigger pro Segment mit dynamischer redirectionUrl, Brevo-Listen-Zuweisung
- `src/pages/api/roi-report.ts` — Kalkulation in SQLite speichern (doi_confirmed=false), DOI triggern, kein sofortiger PDF-Versand mehr
- `src/pages/api/kapitalanleger-report.ts` — gleich wie roi-report
- `src/pages/aktionsplan-erbengemeinschaft/index.astro` — Email-Gate einfügen
- `src/pages/90-tage-blueprint/index.astro` — Email-Gate einfügen
- `src/pages/entscheidungskompass-betreuung/index.astro` — Email-Gate einfügen
- `src/pages/index.astro` — Contextual CTAs auf Scenario-Cards
- `src/components/Footer.astro` — Lead Magnet Links entfernen
- `src/components/FormPrivacyHint.astro` — Checkbox (`<input type="checkbox" required>` + Label mit /datenschutz-Link) in Komponente integrieren, damit alle Call-Sites automatisch DSGVO-konform sind
- `src/pages/danke.astro` — Neuen Variant `doi-fehler` hinzufügen ("Link ungültig oder bereits verwendet — bitte erneut das Formular ausfüllen")

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
