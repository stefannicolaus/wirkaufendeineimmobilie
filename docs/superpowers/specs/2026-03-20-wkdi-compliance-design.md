# WKDI Compliance-Umsetzung — Design Spec

**Projekt:** wirkaufendeineimmobilie.de (Kleinke Real Estate)
**Erstellt:** 2026-03-20
**Status:** Approved
**Scope:** DSGVO + gesetzliche Vorschriften — Code, Dokumente, Brevo-Config

---

## Kontext

WKDI ist eine Vermittlungsplattform fuer sanierungsbeduerftige Wohnungen in Leipzig. Betreiber: Joachim Kleinke (Kleinke Real Estate, §34c GewO). Technischer Betrieb: SDLF Worldwide Solutions LLC (Stefan). Stack: Astro, SQLite, Brevo, Hetzner/Coolify.

Die Plattform sammelt personenbezogene Daten ueber 7 Formulare (Bewertungsanfragen, Investor-Registrierung, Makler-Bewerbung, Tippgeber-Anmeldung, 3x Lead-Magnet) und speichert sie in einer SQLite-Datenbank. Bestaetigungsmails werden ueber Brevo versendet.

### Ist-Zustand (Stand 20.03.2026)

**Vorhanden:**
- Impressum-Seite (mit Platzhaltern fuer Behoerde + Registriernummer + Versicherung)
- Datenschutzerklaerung (Basis, veraltet — enthaelt falschen Google-Fonts-Absatz)
- Google Fonts lokal gehostet (Outfit via woff2) — kein externer Aufruf
- Footer mit Links zu Impressum + Datenschutz
- SQLite-DB fuer Leads (bewertung, investor, makler, tippgeber, lead-magnet)
- Brevo-E-Mails an Joachim + Bestaetigungsmails an Registranten
- Kein Cookie-Tracking, kein GA4, kein Pixel
- GwG-Risikoanalyse (v1.1, vollstaendig, in `.planning/assets/`)

**Fehlt:**
- Impressum-Platzhalter ausfuellen
- Datenschutzerklaerung komplett neuschreiben
- Formular-Hinweise unter allen Formularen
- Abmelde-Hinweis in Bestaetigungs-E-Mails
- Loeschkonzept
- Auftragsverarbeitungsvertrag (AVV)
- Verarbeitungsverzeichnis
- Service Agreement LLC <> KRE
- Double Opt-In in Brevo

### Quellen

- DSGVO Praxis-Konzept: `~/Obsidian/Stefan/Projects/WKDI-DSGVO-Praxis-Konzept.md`
- Gewerbeerlaubnis §34c: Bezirksamt Spandau von Berlin, Geschaeftszeichen Wi 13, 09.12.2004
- GwG-Risikoanalyse: `.planning/assets/gwg-risikoanalyse.md` (v1.1)
- DSGVO-Board fuer Joachim: `build-upstream.com/boards/wkdi-dsgvo`

---

## Wave 1: Website-Code

### 1.1 Impressum vervollstaendigen

**Datei:** `src/pages/impressum.astro`

Aenderungen:
- Erlaubnisbehoerde eintragen: "Bezirksamt Spandau von Berlin, Abt Personal und Wirtschaft — Wirtschaftsamt"
- Geschaeftszeichen eintragen: "Wi 13"
- Berufshaftpflichtversicherung-Sektion komplett entfernen (nicht vorhanden, keine Pflicht fuer §34c-Makler)
- DL-InfoV Sektion entfernen (Berufshaftpflicht war der einzige Inhalt)
- Zustaendige IHK bleibt (Leipzig ist korrekt fuer den Geschaeftsort)

### 1.2 Datenschutzerklaerung neuschreiben

**Datei:** `src/pages/datenschutz.astro`

Komplett ersetzen. 9 Bausteine:

1. **Verantwortlicher:** Kleinke Real Estate, Inh. Joachim Kleinke, Tangermuender Weg 13, 13583 Berlin, E-Mail: datenschutz@wirkaufendeineimmobilie.de, Tel: 0341 — 800 900 0
2. **Welche Daten:** Name, E-Mail, Telefon, PLZ, Immobilienangaben, Quiz-Antworten, Server-Logs
3. **Zwecke + Rechtsgrundlagen:**
   - Bewertungsanfragen: Art. 6(1)(b) — vorvertragliche Massnahmen
   - Investor-Registrierung: Art. 6(1)(a) — Einwilligung
   - Tippgeber-Anmeldung: Art. 6(1)(b) — Vertragsdurchfuehrung
   - Makler-Bewerbung: Art. 6(1)(b) — Vertragsdurchfuehrung
   - Lead-Magnet-Downloads: Art. 6(1)(a) — Einwilligung
   - Personalisierte Empfehlungen: Art. 6(1)(b) — Service den der Nutzer angefragt hat
   - Kontaktaufnahme durch Joachim: Art. 6(1)(b) — vorvertragliche Massnahmen
   - Server-Logs: Art. 6(1)(f) — berechtigtes Interesse
4. **Speicherdauer:** Leads ohne Geschaeft 12 Monate, Vertragsdaten 5 Jahre (MaBV), Rechnungen 8 Jahre (AO, seit BEG IV), GwG-Unterlagen 5 Jahre
5. **Empfaenger:** Joachim Kleinke (KRE), SDLF Worldwide Solutions LLC (technischer Betrieb), Hetzner Online GmbH (Hosting), Brevo (Sendinblue GmbH, E-Mail-Versand)
6. **Drittlandtransfer:** Zugriff durch SDLF LLC (USA) — abgesichert durch Data Privacy Framework + Standardvertragsklauseln (EU 2021/914)
7. **Betroffenenrechte:** Auskunft (Art. 15), Berichtigung (Art. 16), Loeschung (Art. 17), Einschraenkung (Art. 18), Datenuebertragbarkeit (Art. 20), Widerspruch (Art. 21), Beschwerde bei Aufsichtsbehoerde — Kontakt: datenschutz@wirkaufendeineimmobilie.de
8. **Kein Tracking, keine Cookies** (aktuell). Hinweis: Falls zukuenftig Analyse-Tools eingesetzt werden, wird dieser Abschnitt aktualisiert und ggf. ein Cookie-Consent eingeholt.
9. **Kein Datenschutzbeauftragter noetig** (unter 20 Personen mit regelmaessiger Datenverarbeitung)

Google-Fonts-Absatz wird entfernt (Fonts sind lokal).

### 1.3 Formular-Hinweis-Komponente

**Neue Datei:** `src/components/FormPrivacyHint.astro`

```astro
---
---
<p class="form-privacy-hint">
  Mit dem Absenden stimmst du der Verarbeitung deiner Daten gemaess unserer
  <a href="/datenschutz">Datenschutzerklaerung</a> zu. Wir nutzen deine Angaben
  um dir eine persoenliche Einschaetzung zu erstellen und dich zu kontaktieren.
</p>

<style>
  .form-privacy-hint {
    font-size: var(--text-xs);
    color: var(--color-text-muted);
    line-height: var(--leading-normal);
    margin-top: var(--space-3);
  }
  .form-privacy-hint a {
    color: var(--color-text-muted);
    text-decoration: underline;
  }
</style>
```

Einbinden in 7 Seiten:
- `src/pages/index.astro` (Bewertungsformular)
- `src/pages/investoren.astro`
- `src/pages/makler.astro`
- `src/pages/tippgeber.astro`
- `src/pages/unterlagen.astro`
- `src/pages/aktionsplan-erbengemeinschaft/start.astro`
- `src/pages/90-tage-blueprint/start.astro`
- `src/pages/entscheidungskompass-betreuung/start.astro`

### 1.4 Abmelde-Hinweis in E-Mails

**Datei:** `src/lib/db.ts`

In der Bestaetigungsmail-Funktion den Text ergaenzen:

```
\n\nDu moechtest keine E-Mails mehr erhalten? Schreib uns an datenschutz@wirkaufendeineimmobilie.de
```

Betrifft die Bestaetigungsmails an investor, makler, tippgeber (Zeile 82-88 in db.ts). Kein technischer Unsubscribe-Link noetig — das sind transaktionale Einzelmails, kein Newsletter.

### 1.5 AI Act Code-Kommentar

**Datei:** `src/layouts/Layout.astro`

Kommentar im Head-Bereich:

```html
<!-- AI Act (ab 02.08.2026): KI-generierte Bilder die realistisch wirken
     muessen mit "Symbolbild" gekennzeichnet werden. Redaktionell bearbeitete
     Bilder sind ausgenommen. Bei neuen KI-Bildern pruefen und ggf.
     <figcaption>Symbolbild</figcaption> hinzufuegen. -->
```

---

## Wave 2: Rechtsdokumente

Alle Dokumente werden als Markdown in `.planning/assets/` erstellt und committed. Fuer Joachim werden sie als PDF exportiert und/oder auf dem DSGVO-Board verlinkt.

### 2.1 Loeschkonzept

**Datei:** `.planning/assets/loeschkonzept.md`

Titel: "Loeschkonzept nach DSGVO — wirkaufendeineimmobilie.de"

| Datenkategorie | Loeschfrist | Trigger |
|---|---|---|
| Bewertungsanfragen ohne Folgegeschaeft | 12 Monate nach letztem Kontakt | Kein Vertrag/Kontakt |
| Investor-Registrierungen ohne Aktivitaet | 12 Monate nach Registrierung | Kein Login/Kontakt |
| Tippgeber ohne aktiven Vertrag | 3 Jahre nach Vertragsende | Verjaehrungsfrist |
| Bieterverfahren — nicht-erfolgreiche Bieter | 6 Monate nach Abschluss | Verfahren beendet |
| Vertragsunterlagen (Maklervertrag, Provision) | 5 Jahre | §14 MaBV |
| Rechnungen + Buchungsbelege | 8 Jahre | §147 AO (seit BEG IV 01/2025) |
| GwG-Identifizierungsunterlagen | 5 Jahre nach Geschaeftsbeziehung | §8 GwG |

Pruefrhythmus: Einmal jaehrlich (Januar). Verantwortlich: Stefan (technisch) + Joachim (fachlich).

### 2.2 Verarbeitungsverzeichnis (Art. 30 DSGVO)

**Datei:** `.planning/assets/verarbeitungsverzeichnis.md`

| Taetigkeit | Zweck | Betroffene | Daten | Rechtsgrundlage | Empfaenger | Loeschfrist |
|---|---|---|---|---|---|---|
| Bewertungsanfragen | Vorvertragliche Massnahmen | Verkaeufer | Name, E-Mail, Tel, PLZ, Immobilientyp | Art. 6(1)(b) | KRE, SDLF LLC | 12 Monate |
| Investor-Registrierung | Einwilligung | Investoren | Name, E-Mail, Investor-Typ, Erfahrung | Art. 6(1)(a) | KRE, SDLF LLC | 12 Monate |
| Makler-Bewerbungen | Vertragsdurchfuehrung | Makler | Name, E-Mail, Maklerbuero | Art. 6(1)(b) | KRE, SDLF LLC | Vertragsende +3J |
| Tippgeber-Anmeldungen | Vertragsdurchfuehrung | Tippgeber | Name, E-Mail, Typ, PLZ | Art. 6(1)(b) | KRE, SDLF LLC | Vertragsende +3J |
| Lead-Magnet-Downloads | Einwilligung | Interessenten | E-Mail, Quiz-Antworten | Art. 6(1)(a) | KRE, SDLF LLC | 12 Monate |
| E-Mail-Bestaetigungen | Vertragsdurchfuehrung | Alle Registranten | E-Mail, Name | Art. 6(1)(b) | Brevo | Mit Stammdaten |
| Unterlagen-Upload | Vorvertragliche Massnahmen | Verkaeufer | Name, E-Mail, Dokumente | Art. 6(1)(b) | KRE, SDLF LLC | 12 Monate |
| Server-Logs | Berechtigtes Interesse | Website-Besucher | IP, User-Agent, Zeitstempel | Art. 6(1)(f) | Hetzner | 30 Tage |

Verantwortlicher: Kleinke Real Estate, Inh. Joachim Kleinke
Technisch-organisatorische Massnahmen: Verweis auf AVV Anhang

### 2.3 Auftragsverarbeitungsvertrag (AVV)

**Datei:** `.planning/assets/avv-kre-sdlf.md`

Basierend auf BfDI-Mustervorlage. Inhalte:

1. **Parteien:** Auftraggeber = Kleinke Real Estate (Joachim Kleinke), Auftragnehmer = SDLF Worldwide Solutions LLC (Stefan Nicolaus)
2. **Gegenstand:** Technischer Betrieb der Plattform wirkaufendeineimmobilie.de — Entwicklung, Hosting, Datenbankzugriff, E-Mail-Versand via Brevo, Wartung
3. **Art der Daten:** Name, E-Mail, Telefon, PLZ, Immobilienangaben, Quiz-Antworten
4. **Kategorien Betroffener:** Verkaeufer, Investoren, Makler, Tippgeber, Interessenten
5. **Pflichten des Auftragnehmers:** Weisungsgebundenheit, Vertraulichkeit, technisch-organisatorische Massnahmen, Unterstuetzung bei Betroffenenrechten, Loeschung nach Vertragsende
6. **Unterauftragnehmer:** Hetzner Online GmbH (Hosting), Brevo / Sendinblue GmbH (E-Mail)
7. **Technisch-organisatorische Massnahmen (TOMs):** SSH-Zugriff mit Key-Auth, verschluesselte Datenbank-Backups, HTTPS/TLS, Zugriffsprotokollierung, regelmassige Updates
8. **Laufzeit:** Unbefristet, endet mit dem Hauptvertrag (Service Agreement)
9. **Anhang: Standardvertragsklauseln (SCCs)** nach EU-Durchfuehrungsbeschluss 2021/914 — Modul 2 (Controller-to-Processor), ausgefuellt fuer KRE (Datenexporteur) und SDLF LLC (Datenimporteur)

### 2.4 Service Agreement LLC <> KRE

**Datei:** `.planning/assets/service-agreement-sdlf-kre.md`

1. **Parteien:** SDLF Worldwide Solutions LLC (Dienstleister) und Kleinke Real Estate (Auftraggeber)
2. **Leistungen SDLF LLC:**
   - Platform Development & Technical Operations
   - Digital Marketing Strategy & Execution
   - Lead Generation & Funnel Management
   - Content Production & Brand Management
   - Data Analytics, Reporting & Business Intelligence
   - CRM & Customer Communication Systems
3. **Leistungen KRE:**
   - §34c Maklererlaubnis & regulatorische Compliance
   - Persoenlicher Kundenkontakt & Besichtigungen
   - Notartermine & Vertragsabwicklung
   - GwG-Pflichten & Identifizierung
   - Lokale Marktkenntnis Leipzig
4. **Verguetung:** [PLATZHALTER — wird in /coach Session mit Hardy-Modell als Referenz festgelegt. Optionen: Revenue Share %, Monatspauschale, oder Hybrid]
5. **Arm's-Length-Begruendung:** Marktuebliche Saetze fuer vergleichbare digitale Dienstleistungen. Referenz: Freelancer-/Agentur-Tagessaetze DACH-Markt.
6. **Laufzeit:** Unbefristet, 3 Monate Kuendigungsfrist
7. **Gerichtsstand:** Florida, USA (Sitz der LLC)

### 2.5 GwG-Risikoanalyse

**Datei:** `.planning/assets/gwg-risikoanalyse.md`
**Status:** Vorhanden, v1.1, vollstaendig. Firmenname aktualisiert von "brown2green" auf "wirkaufendeineimmobilie.de".

---

## Wave 3: Brevo Double Opt-In

### 3.1 Brevo-Konfiguration

- DOI-Workflow in Brevo aktivieren
- Bestaetigungsmail-Template erstellen: Betreff "Bitte bestaetigen Sie Ihre Registrierung bei wirkaufendeineimmobilie.de"
- Kontakt wird erst nach Klick auf Bestaetigungslink aktiv

**Betrifft:**
- Investor-Registrierung
- Tippgeber-Anmeldung
- Makler-Bewerbung

**Betrifft NICHT:**
- Bewertungsanfragen (vorvertragliche Massnahme, einmalige Antwort)
- Lead-Magnet-Downloads (einmalige Auslieferung, kein laufender Kontakt)
- Unterlagen-Upload (einmalige Bearbeitung)

### 3.2 Code-Anpassung

**Dateien:** `src/pages/api/investor.ts`, `src/pages/api/tippgeber.ts`, `src/pages/api/makler.ts`

Nach DB-Insert: Statt sofort Bestaetigungsmail zu senden, Brevo DOI-Workflow triggern. Die Bestaetigungsmail kommt dann von Brevo mit Klick-Link.

**Datei:** `src/pages/danke.astro`

Texte fuer investor, makler, tippgeber anpassen: "Pruefe deinen Posteingang und bestaetigen deinen Zugang per Klick auf den Link in der E-Mail."

---

## Nicht im Scope

| Thema | Grund |
|---|---|
| DPF Self-Certification | Kein reales Risiko aktuell, "wenn Zeit ist" |
| Cookie-Consent-Banner | Kein Tracking, keine Cookies — nicht noetig |
| GA4 / Analytics | Nicht implementiert, wenn kommt dann eigenes Ticket |
| Gemeinsame Firma (GbR/GmbH/UG) | Stefan will keine Substanz in Deutschland |
| GwG-Risikoanalyse | Bereits vorhanden (v1.1) |
| Verguetungsstruktur 50/50 | Wird in /coach Session festgelegt, Hardy-Modell als Referenz |

---

## Abhaengigkeiten

- **Joachim muss liefern:** Nichts — alle Daten sind aus der Gewerbeerlaubnis extrahiert
- **Stefan braucht:** Brevo-Login fuer DOI-Setup, SSH-Zugriff auf Hetzner (vorhanden)
- **Reihenfolge:** Wave 1 (Code) kann sofort starten, Wave 2 (Dokumente) parallel, Wave 3 (Brevo) nach Wave 1

---

*Spec approved 2026-03-20 — Stefan*
