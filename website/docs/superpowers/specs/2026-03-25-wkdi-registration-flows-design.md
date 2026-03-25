# WKDI — Registration Flows, E-Mail-System, Admin Panel, DAU-Test-System
**Spec erstellt:** 2026-03-25
**Projekt:** wirkaufendeineimmobilie.de (Stefan + Joachim Kleinke)
**Status:** Approved — bereit für writing-plans

---

## Scope

Dieses Spec deckt drei zusammenhängende Subsysteme ab:

1. **Registrierungsflows** — Formulare, Personalisierung, Post-Submit-UX
2. **E-Mail-System** — Welcome-Mails, DOI-Flows, Admin-Benachrichtigung
3. **Admin-Panel** — zweiter gesicherter Zugang, Nutzerverwaltung
4. **Security** — Rate-Limiting, Admin-Auth
5. **DAU-Test-System** — Layer 1 (Content Audit) + Layer 2 (E2E Workflows)

---

## 1. Registrierungsflows — 4 Segmente

### 1.1 DOI-Entscheidung

| Segment | DOI | Begründung |
|---------|-----|-----------|
| Investor | ✅ | Partnerschaft — verifizierte E-Mail Pflicht, Kooperationsvereinbarung folgt |
| Tippgeber | ✅ | Kooperationsvereinbarung folgt |
| Makler | ✅ | B2B-Partner, Seriosität signalisieren |
| Verkäufer (Bewertung) | ❌ | Wollen jetzt verkaufen — Reibung tötet Leads |
| Lead Magnets (Scheidung/Erben/Umzug/Kompass/Blueprint) | ✅ | bereits live, bleibt so |
| ROI/KA-Rechner | ✅ | bereits live (custom confirm-report), bleibt so |

### 1.2 Formularfelder pro Segment

**Alle Formulare haben:**
- Pflichtfelder (Name, E-Mail, ggf. Telefon)
- Honeypot-Feld (Spam-Schutz, bereits vorhanden)
- DSGVO-Checkbox
- Optionaler Personalisierungs-Block (Dropdowns + Freitextfeld)

#### Investor
Pflicht: Name, E-Mail, Telefon, Investor-Typ, Erfahrung (Dropdown bereits vorhanden)

Neu — optionaler Block:
- Dropdown: "Wie viele Deals gemacht?" → 0 / 1–3 / mehr als 3
- Dropdown: "Was ist dein Hauptproblem?" → Objektfindung / Finanzierung / Know-how / Noch ganz am Anfang
- Dropdown: "Stehst du vor einem konkreten Deal?" → Ja, aktiv / Nein, aufbauend
- Freitextfeld: **"Was beschäftigt dich gerade am meisten?"**
  - Subtext: *Joachim liest das vor dem ersten Gespräch — spart euch Zeit.*
  - Placeholder: *z.B. Ich suche ein Fix&Flip-Objekt unter 150k in Leipzig-Süd, scheitere aber an der Finanzierung...*

#### Tippgeber
Pflicht: Name, E-Mail, Telefon, Tippgeber-Typ, PLZ

Neu — optionaler Block:
- Dropdown: "Wie kommst du an Infos über Objekte?" → Beruflich / Familie & Bekannte / Netzwerk / Zufall
- Dropdown: "Wie viele Tipps pro Monat?" → 1–2 / 3–5 / mehr
- Freitextfeld: **"Hast du schon ein konkretes Objekt im Kopf?"**
  - Subtext: *Wenn ja — beschreib es kurz. Das beschleunigt alles.*
  - Placeholder: *z.B. Meine Nachbarin in Gohlis will ihre Wohnung verkaufen, traut sich aber nicht...*

#### Makler
Pflicht: Name, E-Mail, Telefon, Maklerbüro

Neu — optionaler Block:
- Dropdown: "Wie viele Abschlüsse pro Jahr?" → bis 10 / 10–30 / mehr als 30
- Dropdown: "Was interessiert dich?" → Off-Market Zugang / Provisionsmodell / gemeinsame Vermarktung
- Freitextfeld: **"Was suchst du in einer Kooperation, das du bisher nicht gefunden hast?"**
  - Subtext: *Damit wir wissen, wo wir anknüpfen können.*
  - Placeholder: *z.B. Ich hab regelmäßig Investoren-Anfragen aber kein Off-Market-Netzwerk dahinter...*

#### Verkäufer (Bewertung)
Pflicht: Vorname, Nachname, E-Mail, Telefon, PLZ, Immobilientyp

Neu — optionaler Block:
- Dropdown: "Wie dringend wollen Sie verkaufen?" → So schnell wie möglich / Innerhalb 6 Monate / Kein Druck
- Dropdown: "Ist die Immobilie vermietet?" → Ja / Nein
- Freitextfeld: **"Was ist Ihnen beim Verkauf am wichtigsten?"**
  - Subtext: *Schnell, diskret, bester Preis — kurz reicht.*
  - Placeholder: *z.B. Ich muss bis Ende des Jahres verkaufen, die Erbengemeinschaft macht Druck...*

**Datenspeicherung:** Alle Personalisierungsfelder landen in `registrations.lead_magnet_data` (JSON). Kein DB-Schema-Change nötig. Freitextfeld → `registrations.pain_freitext` (Spalte bereits vorhanden).

---

## 2. Post-Submit-UX

**Direkt nach Absenden (auf der Seite, kein Redirect):**

```
✓ Danke, [Vorname]!

📬 Du bekommst gleich eine E-Mail von:
   office@wirkaufendeineimmobilie.de
   → Bitte prüfe auch deinen Spam-Ordner.

Was dich erwartet:
• [Benefit 1]
• [Benefit 2]
• [Benefit 3]

Wir melden uns nach Prüfung innerhalb von 48h bei dir.
```

**Benefits per Segment (von der echten Seite abgeleitet):**

| Segment | Benefit 1 | Benefit 2 | Benefit 3 |
|---------|-----------|-----------|-----------|
| Investor | Off-Market Objekte bevor sie auf ImmoScout landen | Vorgeprüft mit Renditepotenzial & Sanierungskalkulation | Kein Bietergefecht — diskretes Angebotsverfahren |
| Tippgeber | Provision bei Abschluss — du gibst Tipp, wir machen alles andere | Du weißt immer was aus deinem Tipp wird | Schnelle Abwicklung nach Notartermin |
| Makler | Off-Market Deal-Flow für deine Kunden | Klare Provisionsteilung vorab vereinbart | Kooperation, keine Konkurrenz |
| Verkäufer | Kein Makler, keine Provision für Sie | Diskreter Ablauf — keine öffentliche Ausschreibung | Bewertung und erstes Angebot innerhalb 48h |

**Ankündigung Kooperationsvereinbarung** (Investor + Tippgeber):
Letzter Satz unter den Benefits:
> *"Nach Prüfung Ihrer Anmeldung erhalten Sie unsere Kooperationsvereinbarung — das ist unser Standard für alle Partner."*

---

## 3. E-Mail-System

### 3.1 Admin-Benachrichtigung (sofort bei jeder Anmeldung)

An: `office@wirkaufendeineimmobilie.de`
Absender: Brevo (bereits konfiguriert in `db.ts:notifyN8N()`)

**Neues Template-Format:**

```
Betreff: Neue [Investor]-Anmeldung — Klaus Müller

Segment:    Investor
Name:       Klaus Müller
E-Mail:     k.mueller@example.com
Telefon:    0170 / ...
Erfahrung:  1–3 Deals
Problem:    Objektfindung
Notiz:      "Ich suche ein Objekt unter 150k, scheitere an der Finanzierung"

Zeitpunkt:  25.03.2026, 14:32 Uhr
→ Admin-Panel: https://wirkaufendeineimmobilie.de/admin
```

### 3.2 Welcome-E-Mail pro Segment (nach DOI-Bestätigung / direkt bei Verkäufer)

**Absender:** office@wirkaufendeineimmobilie.de
**Brevo Transactional Template** — eines pro Segment (4 Templates gesamt)

**Aufbau jedes Templates:**
```
Betreff: [Vorname], willkommen — was als nächstes passiert

Hallo [Vorname],

[1 Satz wer wir sind + was wir machen — segmentspezifisch]

Was du von uns bekommst:
• [Benefit 1]
• [Benefit 2]
• [Benefit 3]

Nächster Schritt:
[Was jetzt konkret passiert — segmentspezifisch]

[Für Investor/Tippgeber:]
Nach Prüfung deiner Anmeldung schicken wir dir unsere
Kooperationsvereinbarung zu — das ist unser Standard für alle Partner.

Joachim Kleinke & Team
wirkaufendeineimmobilie.de
Tel: 0341 — 800 900 0
```

### 3.3 DOI-Flow — vollständige Beschreibung

**Für Investor / Tippgeber / Makler:**

1. Nutzer füllt Formular aus → Submit
2. Bildschirm zeigt Post-Submit-UX (Benefits + E-Mail-Hinweis)
3. System speichert Lead in SQLite + löst Brevo DOI aus
4. Nutzer erhält **DOI-E-Mail von office@wirkaufendeineimmobilie.de**
5. DOI-E-Mail-Inhalt:
   ```
   Betreff: [Vorname], bitte bestätige deine Anmeldung

   [Button: Jetzt bestätigen →]

   Was dich nach der Bestätigung erwartet:
   • [Benefit 1]
   • [Benefit 2]
   • [Benefit 3]

   Wir melden uns persönlich bei dir.
   ```
6. Nutzer klickt Bestätigungslink → `/danke?typ=doi-bestaetigt`
7. Welcome-E-Mail wird ausgelöst (Schritt 3.2)
8. Admin-Benachrichtigung an Joachim

**Für Verkäufer (kein DOI):**

1. Formular absenden
2. Post-Submit-UX auf Bildschirm
3. Sofortige E-Mail: Link zu `/unterlagen` für Objekt-Details
4. Admin-Benachrichtigung an Joachim

---

## 4. Admin-Panel

### 4.1 Bestehender Team-Login bleibt unverändert

Das bestehende Login für Joachim (Interview-Tool etc.) wird **nicht** angefasst. Joachim braucht morgen auf der Konferenz Zugang — kein Passwort-Change.

### 4.2 Neuer Admin-Bereich — separater Zugang

**Route:** `/admin` (neu, unabhängig vom bestehenden Login)
**Auth:** Username + Password aus ENV-Variablen (`ADMIN_USER`, `ADMIN_PASSWORD`)
**Session:** httpOnly-Cookie, 7 Tage
**Passwort:** sicheres Zufallspasswort, wird bei Implementierung generiert und in `.env` gesetzt

**Neue Spalten in `registrations`:**
```sql
ALTER TABLE registrations ADD COLUMN status TEXT DEFAULT 'neu';
ALTER TABLE registrations ADD COLUMN notiz TEXT;
```

**Ansichten:**

| Route | Was zu sehen |
|-------|-------------|
| `/admin` | Dashboard: Zahlen heute / Woche / gesamt je Typ |
| `/admin/registrierungen` | Tabelle: alle Leads, filterbar nach Typ + Status, sortierbar nach Datum |
| `/admin/registrierungen/[id]` | Detail: alle Felder, Status setzen, Notiz, Freitextfeld des Nutzers |
| `/admin/kapitalanleger` | Separate Tabelle für KA-Rechner-Leads |

**Aktionen pro Lead:**
- Status setzen: `neu` / `kontaktiert` / `qualifiziert` / `abgeschlossen` / `nicht qualifiziert`
- Freitext-Notiz hinzufügen
- CSV-Export (gefiltert nach Typ/Status)

---

## 5. Security

**Bestehend & OK:**
- Parameterisierte Queries (better-sqlite3) → kein SQL-Injection-Risiko ✓
- Honeypot-Felder auf allen Formularen ✓
- SQLite-Datei nur serverseitig erreichbar ✓
- HTTPS via Coolify/Cloudflare ✓

**Neu zu implementieren:**

| Maßnahme | Risiko ohne | Umsetzung |
|----------|-------------|-----------|
| Rate-Limiting auf allen `/api/*` Endpunkten | MEDIUM — Spam-Flut | In-Memory-Map: max 30 Requests/Minute per IP |
| Admin-Auth | KRITISCH | httpOnly-Cookie + ENV-Passwort |
| Puppeteer Sandbox | LOW | `--no-sandbox` Flag |

---

## 6. DAU-Test-System

### Verbindung zu den Flows oben

**Layer 1 — Content Audit** prüft:
- Sind die Benefits auf jeder Registrierungsseite klar kommuniziert?
- Weiß der Nutzer nach dem Lesen was der nächste Schritt ist?
- Ist die E-Mail-Adresse des Absenders sichtbar (Spam-Prävention)?

**Layer 2 — E2E Workflow-Tests** prüfen:
- Formular absenden → DB-Eintrag vorhanden?
- Admin-Benachrichtigungs-E-Mail angekommen?
- DOI-E-Mail angekommen (info@hempura.de via Gmail MCP)?
- DOI-Link klicken → `doi_confirmed = 1` in DB?
- Welcome-E-Mail mit korrekten Benefits angekommen?
- PDF-Anhang vorhanden (ROI/KA)?

**Test-E-Mail:** `info@hempura.de` (Gmail, Zugriff via Google Workspace MCP)
**Brevo-Zugriff:** via Brevo MCP (Account bestätigt)
**Vollautomatisch:** kein manueller Eingriff nötig

### Test-Struktur

```
wkdi-temp/website/test-system/
  personas.ts          → Testdaten für alle 6 Personas
  layer1-content.ts    → Content Audit (Claude API, liest .astro Dateien)
  layer2-workflow.ts   → E2E Tests (Playwright + Gmail/Brevo MCP)
  report.ts            → HTML-Report-Generator
  run.ts               → Hauptrunner
```

---

## 7. Implementierungs-Details (Reviewer-Fixes)

### 7.1 DOI-Bestätigungs-Endpunkt

`/api/confirm-report` **existiert bereits** und übernimmt:
- `GET /api/confirm-report?ref=WKDI-xxx` → `confirmRegistrationByRef(ref)` → `doi_confirmed = 1`
- Danach: Welcome-E-Mail via `sendTransactionalEmail()` senden

Für **Investor/Makler/Tippgeber** (Brevo-DOI): Brevo leitet nach Klick auf `/danke?typ=doi-bestaetigt` weiter. Welcome-E-Mail wird direkt in diesem Redirect-Handler ausgelöst — entweder in `/api/confirm-report` (wenn ref-basiert) oder über einen neuen `/api/doi-welcome` Endpunkt der von der `/danke` Seite via JS getriggert wird.

**Einfachste Lösung:** Brevo-DOI Redirect-URL → `/api/confirm-welcome?typ=investor&email=...` → DB update + Welcome-E-Mail senden.

### 7.2 API-Endpunkte die aktualisiert werden

Alle 4 müssen die neuen Personalisierungsfelder verarbeiten:

| Datei | Neue Felder |
|-------|-------------|
| `src/pages/api/investor.ts` | `erfahrung_deals`, `hauptproblem`, `konkreter_deal` → `lead_magnet_data` JSON; `pain_freitext` → eigene Spalte |
| `src/pages/api/tippgeber.ts` | `objekt_quelle`, `tipps_monat` → `lead_magnet_data`; `pain_freitext` |
| `src/pages/api/makler.ts` | `abschluesse_jahr`, `kooperation_interesse` → `lead_magnet_data`; `pain_freitext` |
| `src/pages/api/bewertung.ts` | `dringlichkeit`, `vermietet` → `lead_magnet_data`; `pain_freitext` |

### 7.3 Admin-Auth — Astro SSR Implementierung

```
src/pages/admin/index.astro        → Dashboard (prüft Cookie)
src/pages/admin/login.astro        → Login-Formular
src/pages/api/admin-login.ts       → POST: vergleicht ADMIN_USER/ADMIN_PASSWORD (ENV), setzt Cookie
src/pages/api/admin-logout.ts      → DELETE Cookie
src/middleware.ts                  → Bestehende Middleware: /admin/* prüft Cookie
```

**Auth-Mechanismus:** Plaintext-Vergleich gegen ENV-Variablen `ADMIN_USER` + `ADMIN_PASSWORD` — kein bcrypt nötig für diesen Use Case. Cookie-Name: `wkdi_admin_session`, httpOnly, Secure, SameSite=Lax, 7 Tage.

### 7.4 ENV-Variablen (vollständige Liste)

```env
# Bestehend
BREVO_API_KEY=
BREVO_DOI_TEMPLATE_ID=
BREVO_LIST_ID_INVESTOR=
BREVO_LIST_ID_MAKLER=
BREVO_LIST_ID_TIPPGEBER=
BREVO_LIST_ID_ROI=
BREVO_LIST_ID_KAPITALANLEGER=
BREVO_LIST_ID_ERBEN=
BREVO_LIST_ID_BLUEPRINT=
BREVO_LIST_ID_KOMPASS=
BREVO_LIST_ID_SCHEIDUNG=
BREVO_LIST_ID_UMZUG=
NOTIFY_EMAIL=office@wirkaufendeineimmobilie.de
SITE_URL=https://wirkaufendeineimmobilie.de

# Neu
ADMIN_USER=admin
ADMIN_PASSWORD=<sicheres-zufalls-pw-bei-implementierung-generieren>
BREVO_TEMPLATE_ID_WELCOME_INVESTOR=
BREVO_TEMPLATE_ID_WELCOME_TIPPGEBER=
BREVO_TEMPLATE_ID_WELCOME_MAKLER=
BREVO_TEMPLATE_ID_WELCOME_VERKAEUFER=
```

### 7.5 Admin SQL-Sicherheit

Admin-Abfragen mit dynamischem Sort/Filter: **Whitelist-Validation** für Spalten- und Richtungswerte vor SQL-Ausführung. Kein String-Concat — nur parameterisierte Queries via `better-sqlite3`.

```ts
const ALLOWED_SORT_COLS = ['created_at', 'name', 'typ', 'status'];
const col = ALLOWED_SORT_COLS.includes(req.sort) ? req.sort : 'created_at';
```

### 7.6 CSV-Export

- Encoding: UTF-8 mit BOM (`\uFEFF`) für Excel-Kompatibilität
- Spaltenreihenfolge: `id, typ, name, email, telefon, status, notiz, pain_freitext, created_at`
- Dateiname: `wkdi-leads-[typ]-[YYYY-MM-DD].csv`
- Rate-Limiting (In-Memory-Map): Überlebt Server-Restart nicht — bewusste Entscheidung, akzeptables Trade-off für diesen Scale.

---

## 8. Offene Entscheidungen (nicht blockierend)

1. **Brevo-Listen-IDs + Template-IDs** — werden bei Implementierung in `.env` eingetragen
2. **Provision-Betrag Tippgeber** — nicht im Scope, kommt von Joachim
3. **Kooperationsvereinbarungs-PDF** — Inhalt kommt von Joachim, als Brevo-Attachment hinterlegt

---

*Spec approved by Stefan — 2026-03-25*
