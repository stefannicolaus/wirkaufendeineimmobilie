# Design Spec: Joachim Interview Tool
**Datum:** 2026-03-23
**Projekt:** WKDI / wirkaufendeineimmobilie.de
**Deadline:** Konferenz in 2 Tagen — Tool muss 100% einsatzfähig sein

---

## Ziel

Ein DAU-proof Interview-Tool für Joachim, das er auf der Konferenz auf Tablet/Phone nutzt, um Marktteilnehmer (Investoren, Makler, Handwerker etc.) zu interviewen. Dual-Purpose: Informationsgewinnung + stille Produktvalidierung nach dem What-How-Who Framework (Makaiah Rawson).

---

## Zwei Phasen — klar getrennt

**Phase 1 — Research (parallel, vor Tool-Build):**
12 Research-Agents laufen parallel, je einer pro Thema. Output = tiefer, praxisnaher Frageninhalt für jeden Leitfaden.

**Phase 2 — Tool-Build:**
HTML/JS Web-App die die Leitfäden enthält und Interview-Daten speichert.

---

## Phase 1: Research-Brief pro Agent

Jeder Agent deckt **ein Thema** ab und sucht nach:

1. **Practitioner-Sprache** — Insider-Jargon, Begriffe, Abkürzungen wie echte Profis unter sich reden
2. **Ungelöste Probleme** — was diskutieren Profis in deutschen Immobilien-Foren, Podcasts, LinkedIn ohne befriedigende Antwort?
3. **DACH-Spezifika** — regulatorische, steuerliche, marktspezifische Besonderheiten (Vorkaufsrecht, KfW, Grunderwerbsteuer-Strukturen etc.)
4. **Typische Fehler** — was läuft laut Practitioners regelmäßig schief?

**Die 12 Themen:**
1. Fix & Flip Immobilienhandel
2. Buy & Hold Bestandsaufbau
3. Aufteilergeschäft (Privatisierung)
4. Immobilieninvestoren (Profil & Strategie)
5. Immobilienmakler
6. Kapitalanlagevertrieb
7. Immobilienfinanzierungen (klassisch)
8. Mezzanine Kapital
9. Partiarische Darlehen
10. Eigentümerdarlehen (Vendor Loan)
11. Private Equity für Immobilien
12. Ideale & Creative Finance

---

## Phase 2: Guide-Template pro Thema

Alle 12 Leitfäden folgen exakt dieser Struktur:

### EINSTIEG *(Vertrauen aufbauen, Kontext setzen)*
- 2–3 Fragen die zum Erzählen einladen, keine Ja/Nein-Antworten möglich
- Formulierung: offen, neugierig, respektvoll gegenüber Expertise

### BEST PRACTICES *(Was funktioniert wirklich?)*
- 4–6 Fragen in Practitioner-Sprache, themenspezifisch
- Ziel: Insider-Wissen abschöpfen

### PAIN POINTS *(Wo brennt es?)*
- 4–6 Fragen die zu emotionalen, konkreten Antworten führen
- Formulierung: Story-Trigger ("Erzähl mir von einem Fall wo...")

### LEARNING LOOP *(Was würdest du anders machen?)*
- 2–3 Reflexionsfragen

### HIDDEN AGENDA — What / How / Who *(Produktvalidierung)*
- 3 Fragen, die im Guide als normale Fragen formuliert sind — kein "Produktvalidierung"-Label
- Joachim sieht intern welche Fragen das sind (z.B. durch dezente Markierung wie ein [W], [H], [WHO] Icon das nur er sieht)
- Der Gast erlebt sie als normales Gespräch

### EVALUIERUNGS-BLOCK *(nach dem Interview, nur für Joachim)*
- Pain Intensity Score 1–10
- "Was kostet das Problem wenn es NICHT gelöst wird?" (€)
- Zahlungsbereitschaft für Lösung
- Nächster Schritt: Follow-up / CAB-Pitch / Nichts

---

## Tool-Architektur

### Frontend
- **Single-Page Web-App** — HTML/CSS/Vanilla JS, kein Framework
- Responsive: Tablet-first, funktioniert auf iOS Safari und Android Chrome

### Startscreen
Joachim wählt:
1. **Thema** — 12 Kacheln (z.B. "Fix & Flip", "Mezzanine Kapital")
2. **Interviewpartner-Typ** — Freitext-Feld + Schnellauswahl: Investor / Makler / Handwerker / Finanzierer / Sonstiges

### Interview-Flow
- Fortschrittsbalken zeigt Position im Leitfaden
- Jede Frage mit Textfeld für Notizen
- Grüner Haken nach jeder abgehakten Frage
- Autosave-Indikator permanent sichtbar: "Gespeichert ✓"
- "Interview abschließen" erfordert expliziten Klick + Bestätigung (kein versehentliches Abschließen)

### Datenmodell

```json
{
  "id": "uuid",
  "datum": "2026-03-25T09:30:00",
  "thema": "fix-flip",
  "interviewpartner_typ": "Investor",
  "interviewpartner_name": "optional",
  "status": "offen | abgeschlossen",
  "antworten": {
    "frage_id": "antwort_text"
  },
  "evaluierung": {
    "pain_score": 8,
    "kosten_problem": "~5.000€/Projekt",
    "zahlungsbereitschaft": "500€/Monat",
    "naechster_schritt": "CAB-Pitch"
  }
}
```

### Datensicherung — 3-fach

| Ebene | Mechanismus | Details |
|-------|-------------|---------|
| 1 | **LocalStorage Auto-Save** | Jede Eingabe sofort gespeichert. Primärspeicher. Überlebt Browser-Reload und -Crash. |
| 2 | **Server-Sync** | `POST /api/interviews` → JSON → Filesystem auf Hetzner/brown2green Server. Retry-Mechanismus: bei Offline-Status wird Sync in Queue gehalten und automatisch ausgelöst sobald Verbindung verfügbar. Tool funktioniert vollständig offline — Server-Sync ist asynchron. |
| 3 | **Export** | JSON-Download nach jedem Interview (ein Klick, funktioniert auf iOS Safari). Zusätzlich: "Als PDF drucken" via Browser-Druckdialog (Desktop). Kein PDF-Export auf Mobile — JSON reicht für Archivierung. |

### Interview-Archiv

Eigener Tab "Meine Interviews" im Tool:
- Liste aller Interviews sortiert nach Datum (neueste zuerst)
- Spalten: Datum | Thema | Interviewpartner-Typ | Status | Pain-Score
- Filter: nach Thema, nach Status (offen/abgeschlossen), nach Typ
- Jedes Interview per Klick öffnbar und bearbeitbar
- Status-Badge: "Offen" (gelb) / "Abgeschlossen" (grün)

### Hosting & Zugang
- Branch `feat/interview-tool` im brown2green Repo
- Deployed auf Coolify/Hetzner
- HTTP-Auth (Coolify-Feature): ein Nutzer, Credentials werden Joachim out-of-band (WhatsApp) mitgeteilt
- Zugangspfad: `https://[domain]/interview-tool/`

---

## Was dieses Tool NICHT ist
- Kein komplexes Backend oder Datenbank
- Kein Nutzer-Login-System (HTTP-Auth reicht)
- Kein Echtzeit-Sync zwischen Geräten (LocalStorage + Export-Workflow reicht)
- Kein PDF-Export auf Mobile

---

## Erfolgskriterien
- [ ] DAU-Test: Joachim startet ohne Erklärung, führt ein Test-Interview durch
- [ ] Alle Eingaben überleben Browser-Reload (LocalStorage)
- [ ] Tool funktioniert vollständig offline (kein Spinner, kein Fehler bei WLAN-Ausfall)
- [ ] Server-Sync erfolgt automatisch sobald Verbindung wieder da
- [ ] JSON-Export funktioniert auf iOS Safari
- [ ] Archiv zeigt alle abgeschlossenen Interviews mit Datum, Thema, Typ und Pain-Score
- [ ] HTTP-Auth schützt den Zugang
- [ ] What-How-Who Fragen sind für Joachim intern markiert, für den Gast unsichtbar

---

*Approved: 2026-03-23*
