# Löschkonzept nach Datenschutz-Grundverordnung (DSGVO) — wirkaufendeineimmobilie.de

**Verantwortlicher:** Kleinke Real Estate, Inh. Joachim Kleinke
**Technischer Betrieb:** SDLF Worldwide Solutions LLC (Stefan Nicolaus)
**Stand:** März 2026

---

## 1. Grundsatz

Personenbezogene Daten werden gelöscht, sobald der Zweck der Erhebung entfällt und keine gesetzlichen Aufbewahrungspflichten entgegenstehen (Art. 17 DSGVO). Dieses Konzept definiert Löschfristen, Verantwortlichkeiten und den Prüfrhythmus.

---

## 2. Löschfristen nach Datenkategorie

| Datenkategorie | Löschfrist | Auslöser | Gesetzliche Grundlage |
|---|---|---|---|
| Bewertungsanfragen ohne Folgegeschäft | 12 Monate nach letztem Kontakt | Kein Vertrag und kein weiterer Kontakt | Art. 17 DSGVO — Zweckentfall |
| Investor-Registrierungen ohne Aktivität | 12 Monate nach Registrierung | Kein Login, keine Reaktion auf Kontaktversuche | Art. 17 DSGVO — Zweckentfall |
| Tippgeber ohne aktiven Vertrag | 3 Jahre nach Vertragsende | Ablauf der gesetzlichen Verjährungsfrist | §§ 195, 199 BGB (Bürgerliches Gesetzbuch) — Verjährung |
| Bieterverfahren — nicht-erfolgreiche Bieter | 6 Monate nach Abschluss des Verfahrens | Zuschlag erteilt, Verfahren beendet | Art. 17 DSGVO — Zweckentfall |
| Vertragsunterlagen (Maklervertrag, Provisionsabrechnung) | 5 Jahre nach Vertragsende | Ablauf der Aufbewahrungsfrist | § 14 MaBV (Makler- und Bauträgerverordnung) |
| Rechnungen und Buchungsbelege | 8 Jahre | Ablauf der steuerlichen Aufbewahrungsfrist | § 147 AO (Abgabenordnung), verkürzt seit BEG IV (Bürokratieentlastungsgesetz IV, in Kraft seit 01/2025) |
| Identifizierungsunterlagen nach dem Geldwäschegesetz | 5 Jahre nach Ende der Geschäftsbeziehung | Beendigung der Geschäftsbeziehung | § 8 GwG (Geldwäschegesetz) |
| Lead-Magnet-Downloads (Aktionsplan, Blueprint, Kompass) | 12 Monate nach Download | Kein weiterer Kontakt, kein Folgegeschäft | Art. 17 DSGVO — Zweckentfall |
| Server-Log-Dateien | 30 Tage | Automatische Rotation | Art. 17 DSGVO — Zweckentfall |

---

## 3. Löschverfahren

### 3.1 Datenbank (SQLite)

Datensätze in der Tabelle `registrations` werden per SQL-DELETE entfernt. Nach dem Löschen wird ein `VACUUM`-Befehl ausgeführt, damit die Daten auch physisch von der Festplatte entfernt werden (SQLite markiert gelöschte Zeilen sonst nur als frei).

### 3.2 E-Mail-Dienstleister (Brevo)

Kontakte werden über die Brevo-API oder die Brevo-Oberfläche gelöscht. Brevo löscht die Daten innerhalb von 30 Tagen vollständig aus allen Systemen.

### 3.3 Backups

Datenbank-Backups werden nach dem gleichen Rhythmus wie die Quelldaten rotiert. Backups, die löschpflichtige Daten enthalten, werden spätestens 30 Tage nach der Löschung in der Produktivdatenbank überschrieben.

### 3.4 Papierunterlagen

Falls Joachim Kleinke Unterlagen in Papierform erhält (z.B. bei Notarterminen), werden diese nach Ablauf der Aufbewahrungsfrist datenschutzkonform vernichtet (Schredder, Stufe P-4 oder höher nach DIN 66399).

---

## 4. Prüfrhythmus

**Häufigkeit:** Einmal jährlich, jeweils im Januar.

**Verantwortlich:**
- **Stefan Nicolaus (SDLF Worldwide Solutions LLC):** Technische Prüfung der Datenbank — welche Datensätze die Löschfrist überschritten haben. Erstellung einer Liste zur Freigabe.
- **Joachim Kleinke (Kleinke Real Estate):** Fachliche Prüfung — ob bei einzelnen Datensätzen ein laufendes Geschäft oder eine gesetzliche Aufbewahrungspflicht der Löschung entgegensteht.

**Ablauf:**
1. Stefan erstellt eine Liste aller löschfähigen Datensätze (gruppiert nach Kategorie)
2. Joachim prüft die Liste und gibt die Löschung frei oder markiert Ausnahmen
3. Stefan führt die Löschung technisch durch (Datenbank + Brevo)
4. Beide dokumentieren den Löschlauf (Datum, Anzahl gelöschter Datensätze, Ausnahmen)

---

## 5. Löschung auf Antrag (Art. 17 DSGVO)

Wenn eine betroffene Person die Löschung ihrer Daten verlangt:

1. Anfrage geht ein an datenschutz@wirkaufendeineimmobilie.de
2. Joachim prüft, ob gesetzliche Aufbewahrungspflichten entgegenstehen
3. Wenn keine Pflichten entgegenstehen: Löschung innerhalb von 30 Tagen
4. Bestätigung per E-Mail an die betroffene Person

---

## 6. Dokumentation

Jeder Löschlauf wird dokumentiert mit:
- Datum der Durchführung
- Anzahl und Kategorie der gelöschten Datensätze
- Name des Durchführenden
- Eventuelle Ausnahmen mit Begründung

Die Dokumentation wird 3 Jahre aufbewahrt (Nachweis der Löschung gegenüber Aufsichtsbehörden).

---

*Erstellt: März 2026 | Nächste Prüfung: Januar 2027*
