# Spec: Unterlagen-Quiz Redesign
> Datum: 2026-03-25
> Status: Approved by Stefan
> Projekt: wirkaufendeineimmobilie.de

---

## Ziel

Den `step-erstbewertung` auf `/unterlagen` von einem flachen Formular in ein step-by-step Quiz umbauen. Verkäufer ohne Immobilien-Expertise sollen intuitiv durch die Fragen geführt werden — mit Kontext, Auswahl-Kacheln und optionalen Feldern. Ergebnis: bessere Datenqualität für die Preisindikation + bessere Vorbereitung für Joachims Anruf.

**Was sich NICHT ändert:**
- Der `step-0` (Kontaktdaten-Formular für direkte Besucher) bleibt unverändert
- Die API `/api/bewertung` PATCH-Route bleibt unverändert
- Das PDF-Generierungs-System bleibt unverändert
- Alle URL-Params (`email`, `plz`, `ref`, `name`) werden weiterhin genutzt

---

## Quiz-Struktur (7 Schritte + Abschluss)

### Schritt 1 — Situation (optional)
**Frage:** "Damit wir Ihre Situation besser einschätzen und gezielter helfen können:"
**UI:** Dieselben Szenario-Kacheln wie auf der Homepage — aber kleiner, ohne Hintergrundbild. Nur Icon-Emoji + Label + 1 kurzer Satz. Mehrfachauswahl möglich. Ausgewählte Kacheln erhalten einen blauen Rahmen.

**Optionen** (identisch mit Homepage-Szenarien):
- 🏚 Erbengemeinschaft — "Gemeinsam mit anderen Erben, noch keine Einigung"
- 🧹 Messie-Objekt — "Starke Verschmutzung oder schwieriger Zustand"
- ⚡ GEG / Energetischer Sanierungsstau — "Hohe Energiekosten, Sanierungspflicht"
- ⚖️ Insolvenzverfahren — "Zwangssituation, Zeitdruck"
- 🏗 Kapitalanleger mit Renovierungsdruck — "Vermietetes Objekt, Renovierungsstau"
- 💔 Scheidung / Trennung — "Gemeinsames Eigentum muss aufgeteilt werden"
- 📦 Beruflicher Umzug / Zeitdruck — "Schneller Verkauf nötig"
- ✏️ Meine Situation ist anders... (→ öffnet Freitext-Eingabe)

**Skip-Option:** "Überspringen →" prominent sichtbar (kein Pflichtfeld)
**Speicherung:** In `lead_magnet_data` JSON (neues Feld: `situation`, Array der gewählten Labels)

---

### Schritt 2 — Baujahr
**Frage:** "Wann wurde die Immobilie gebaut?"
**UI:** Zahleingabe (4-stellige Jahreszahl, z.B. 1987) + Checkbox "Ungefähre Angabe / bin nicht sicher" + Checkbox "Weiß nicht"

- Wenn "Ungefähre Angabe" aktiviert: Eingabefeld bleibt sichtbar, Label ändert sich auf "Ungefähres Baujahr" — Wert wird mit Hinweis `baujahr_unsicher: true` gespeichert
- Wenn "Weiß nicht" aktiviert: Eingabefeld wird disabled/geleert

**Hilfetext** (immer sichtbar, klein, grau):
> "Das Baujahr steht im Kaufvertrag, auf dem Energieausweis oder in der Bauakte. Eine Schätzung reicht — Joachim kann damit arbeiten."

**Validierung:** Nur 4-stellige Zahlen zwischen 1850 und aktuellem Jahr.

**Mapping zu DB-Feld `baujahr`:** Eingegebene Zahl direkt. "Weiß nicht" → null. `baujahr_unsicher` wird in `lead_magnet_data` JSON gespeichert.

---

### Schritt 3 — Wohnfläche
**Frage:** "Wie groß ist die Wohnfläche?"
**UI:** Zahleingabe (m²) mit +/− Buttons + Schieberegler für mobile
**Hilfetext:**
> "Die Wohnfläche steht im Kaufvertrag oder Grundriss. Keller, Garage und Abstellräume zählen normalerweise nicht dazu. Eine Schätzung reicht vollkommen."

**"Ungefähre Angabe"-Hinweis** unter dem Feld: "Eine Schätzung reicht — kein Pflichtfeld."
**Skip:** Feld leer lassen und weitergehen ist erlaubt (kein Pflichtfeld)

---

### Schritt 4 — Energieklasse
**Frage:** "Welche Energieklasse hat die Immobilie?"
**UI:** 3×3 Grid aus Kacheln (A+, A, B, C, D, E, F, G, H) + "Weiß nicht / Kein Ausweis"

**Hilfetext:**
> "Die Energieklasse steht auf dem Energieausweis (oben rechts, oft als farbige Skala). Den Ausweis brauchen Sie beim Verkauf ohnehin — wir können Ihnen dabei helfen, einen zu besorgen."

**Upload-Option** (sekundär, unter dem Grid):
> "📎 Energieausweis hochladen (optional)" → Datei-Upload (PDF, JPG, PNG, max. 8 MB)

**"Kein Ausweis vorhanden"** → Eigene Kachel (unter dem Grid), als aktive Auswahl. Wenn angeklickt → erscheint darunter ein Infotext:
> "Kein Problem — nach Ihrer Ersteinschätzung können wir den Energieausweis für Sie organisieren. Für den Verkauf ist er ohnehin Pflicht, wir kennen schnelle und günstige Anbieter."

Diese Kachel schließt die Energieklassen-Kacheln nicht aus (jemand kann trotzdem eine Klasse schätzen). `energieklasse = null` nur wenn auch keine Klasse gewählt.

**Mapping:** Kachel-Wert direkt in DB-Feld `energieklasse`. "Weiß nicht" → null.

---

### Schritt 5 — Zustand
**Frage:** "Wie würden Sie den allgemeinen Zustand der Immobilie beschreiben?"
**UI:** 5 vertikale Kacheln, jede mit Icon + Label + 1-Satz-Beschreibung

| Kachel | Icon | Beschreibung |
|--------|------|-------------|
| Sanierungsbedürftig | 🔧 | Größere Mängel, letzte Renovierung vor über 20 Jahren oder gar nicht |
| Renovierungsbedürftig | 🪣 | Funktionsfähig, aber Bad, Küche oder Böden sind veraltet |
| Gepflegt | 🏠 | Regelmäßig instand gehalten, bewohnbar ohne große Maßnahmen |
| Modernisiert | ✨ | Küche, Bad oder Heizung wurden in den letzten Jahren erneuert |
| Neuwertig | 🌟 | Neubau oder vollständig saniert, keine Mängel erkennbar |

**Mapping:** Zu DB-Feld `zustand` (Werte: sanierungsbeduerftig / renovierungsbeduerftig / gepflegt / modernisiert / neuwertig)

---

### Schritt 6 — Sanierungsstand
**Frage:** "Was wurde in den letzten 15 Jahren erneuert oder saniert?"
**UI:** Multi-Select Kacheln (mehrere wählbar), + "Nichts davon" und "Weiß nicht"

**Optionen:**
- Fenster
- Heizungsanlage
- Dach
- Bad / Sanitär
- Fassade / Dämmung
- Elektrik
- Böden / Innenausbau
- Küche
- Nichts davon (Exklusiv-Auswahl)
- Weiß nicht (Exklusiv-Auswahl)

**Hilfetext:**
> "Was in den letzten 15 Jahren gemacht wurde, hilft unserem Team bei der Einschätzung — grobe Angaben reichen vollkommen."

**Mapping:** JSON-Array in DB-Feld `was_saniert`

---

### Schritt 7 — Extras (optional, alles freiwillig)
**Titel:** "Noch etwas Wichtiges?" (Ton: entspannt, kein Druck)
**UI:** Checkboxen + Eingabefelder + Freitext

**Checkboxen:**
- Stellplatz / Garage vorhanden
- Aktuell vermietet
- Denkmalschutz
- Aufzug im Gebäude (bei ETW)

**Freitext-Felder:**
- Etage (bei ETW): kurze Texteingabe, Placeholder "z.B. 3. OG / Erdgeschoss"
- Heizung Baujahr: Zahleingabe, Placeholder "z.B. 2008"
- Besonderheiten: Textarea, Placeholder "z.B. Dachterrasse, Erbbaurecht, Erstbezug nach Sanierung..."
- "Was ist aktuell das größte Problem für Sie?": Textarea, prominent (Joachim liest das persönlich)

---

### Abschluss — Zusammenfassung + Absenden
**UI:** Alle eingegebenen Antworten kompakt aufgelistet, jede editierbar ("Ändern")
**CTA:** "Preisindikation erstellen →"
**Nach Submit:** Bestätigungsscreen ("Danke! Ihr PDF wird erstellt...") — wie bisher

---

## UX-Prinzipien

1. **One question per screen** — jeder Schritt ist eine eigene Ansicht, kein Scrollen
2. **Fortschrittsanzeige** — Dot-Stepper (●●●○○○) + "Schritt X von 7" + "⏱ Noch ca. 2 Minuten"
3. **Kein Pflichtfeld außer keinem** — jeder Schritt hat "Überspringen →" (außer Schritt 2–5 empfehlen wir Angabe)
4. **Hilfetext immer sichtbar** — kein "i"-Icon, kein Modal. Kleiner grauer Text direkt unter der Frage
5. **Zurück-Navigation** — jeder Schritt hat "← Zurück" (außer Schritt 1)
6. **Mobile-first** — Kacheln als 2-spaltig auf Mobile, 3-spaltig auf Desktop

---

## Technische Architektur

### Was sich ändert: `unterlagen.astro`
- Der `#step-erstbewertung` Block wird komplett ersetzt durch 7 separate `wiz-step`-Divs
- Das bestehende Wizard-JS (`wiz-next`, `wiz-prev`) wird erweitert für den neuen Flow
- URL-Params `email`, `plz`, `ref`, `name` werden weiterhin in Hidden-Inputs gespeichert
- Die Situation-Antwort wird zu `lead_magnet_data` JSON hinzugefügt
- Upload (Energieausweis): File-Input → Base64 → neues DB-Feld `energieausweis_base64` (optional, lazy migration)

### Neue DB-Spalten (lazy migration in `db.ts`, try/catch Pattern)
```sql
ALTER TABLE registrations ADD COLUMN energieausweis_base64 TEXT;
ALTER TABLE registrations ADD COLUMN situation TEXT;
-- was_saniert existiert bereits in der DB (aus vorherigem Release)
```
`was_saniert` ist bereits vorhanden — kein neues ALTER TABLE nötig.

### `zustand`-Werte: Mapping alter → neuer Strings
Die neue Quiz-UI verwendet erweiterte Werte. Die API und DB akzeptieren freie Strings — kein Schema-Constraint.

| Neuer Quiz-Wert (DB-gespeichert) | Entspricht altem Wert |
|-----------------------------------|-----------------------|
| `sanierungsbeduerftig` | neu (bisher nicht genutzt) |
| `renovierungsbeduerftig` | `renovierungsbeduerftig` (gleich) |
| `gepflegt` | `gut` (Altdaten bleiben als `gut`) |
| `modernisiert` | neu (bisher nicht genutzt) |
| `neuwertig` | `neuwertig` (gleich) |

Altdaten mit `gut` oder `mittel` bleiben unverändert — die Admin-Anzeige zeigt den gespeicherten Rohwert.

### `sanierungsstand`-Feld: Abkündigung
Das bisherige Feld `sanierungsstand` (vollsaniert / teilsaniert / kaum-saniert / unsaniert) wird im Quiz nicht mehr befüllt. Es bleibt leer (null) für neue Einträge. Bestehende Altdaten sind nicht betroffen. Das Feld wird nicht gelöscht — nur nicht mehr beschrieben.

### Zusammenfassungs-Screen: "Ändern"-Mechanismus
Klick auf "Ändern" neben einem Schritt → JS springt direkt zu diesem Schritt zurück (setStep(n)). Nach Änderung → "Weiter →" bringt den Nutzer zur Zusammenfassung zurück (nicht zum nächsten Schritt). Implementierung: `data-return-to-summary="true"` Flag auf den Schritten wenn man vom Summary kommt.

### Upload-Größenlimit
Clientseitig: File-Input prüft Dateigröße vor Base64-Konvertierung. Über 8 MB → Fehlermeldung: "Datei zu groß (max. 8 MB). Bitte komprimieren oder als JPG-Foto hochladen." Das Limit steht im JS, nicht in der HTML `accept`-Attribut.

### API `/api/bewertung` PATCH
- Neues optionales Feld `situation` im Request-Body → wird in `lead_magnet_data` JSON gemerged
- Neues optionales Feld `energieausweis_base64` → direkt in gleichnamige DB-Spalte
- `sanierungsstand` wird nicht mehr gesendet (bleibt null)
- Alle anderen Felder bleiben unverändert

### Fortschrittsanzeige: Modus-Unterscheidung
- **Erstbewertungs-Quiz-Modus** (URL hat `ref` oder `email` Param): 7 Schritte, Dot-Stepper mit 7 Punkten
- **Upload-Wizard-Modus** (direkter Aufruf): bestehende 6-Schritte-Anzeige bleibt unverändert
- Das JS erkennt den Modus beim Laden über `urlParams.has('ref') || urlParams.has('email')`

### Skip-Verhalten (alle Schritte)
Jeder Schritt kann übersprungen werden — "Überspringen →" ist immer vorhanden. Auf Schritten 2–5 ist der "Weiter →" Button die primäre CTA (größer/prominenter), "Überspringen" ist sekundär (kleiner, grau). Technisch identisch — nur visuelles Gewicht unterscheidet sich.

### Kein neuer API-Endpunkt nötig
Die bestehende PATCH-Route reicht für alles.

---

## Was NICHT gebaut wird (bewusste Grenzen)

- Kein echter Cloud-Upload für Energieausweis (Base64 in DB reicht für MVP)
- Keine Situation-basierte Anpassung der Folgefragen (bleibt immer dieselbe Reihenfolge)
- Kein A/B-Test-Setup
- Kein "Ergebnis sofort am Bildschirm" (PDF kommt weiterhin per E-Mail)
- Keine Verknüpfung mit Kooperationspartnern für Energieausweise (kommt später)

---

## Erfolg

- Verkäufer füllen mehr Felder aus (Ziel: Ø 5 von 7 Schritten ausgefüllt)
- Joachim weiß vor jedem Anruf die Situation des Verkäufers
- Kein Nutzer bricht wegen "zu kompliziert" ab
