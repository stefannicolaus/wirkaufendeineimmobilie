# Spec 1 — DB + Formulare + Tippgeber + Makler-Umbau

**Deadline:** 25.03.2026 (Joachims Events)
**Scope:** Alle Formulare speichern Daten, Investoren-Formular umbauen, Makler auf Bewerbung umstellen, Tippgeber-Seite neu bauen, Navigation erweitern.

---

## 1. Datenspeicherung — SQLite

### Setup
- SQLite-Datei im Docker-Volume: `/data/wkdi/wkdi.db`
- Volume-Mount in Coolify/Dockerfile konfigurieren
- Backup bereits abgesichert (Hetzner Cloud Snapshot + Volume-Script täglich)

### Schema

```sql
CREATE TABLE registrations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  typ TEXT NOT NULL CHECK(typ IN ('investor', 'makler', 'tippgeber', 'bewertung')),

  -- Gemeinsame Felder
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  telefon TEXT,

  -- Investor-spezifisch
  investor_typ TEXT,       -- 'selbst' | 'teils' | 'fremdvergabe'
  erfahrung TEXT,          -- '0' | '1-2' | '3+'
  gewerk TEXT,             -- optional: 'maler' | 'elektriker' | 'shk' | 'trockenbau' | 'fliesenleger'

  -- Makler-spezifisch
  maklerbuero TEXT,

  -- Tippgeber-spezifisch
  tippgeber_typ TEXT,      -- 'postbote' | 'reinigung' | 'hausmeister' | 'schornsteinfeger' | 'pflege' | 'handwerker' | 'zusteller' | 'ableser' | 'sonstige'
  tippgeber_plz TEXT,

  -- Bewertung-spezifisch (bestehendes Formular)
  plz TEXT,
  immobilientyp TEXT,

  -- Meta
  source TEXT DEFAULT 'website',   -- für spätere QR-Attribution
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### API-Änderungen
- Neue Datei: `src/lib/db.ts` — SQLite-Verbindung + Insert-Helper
- Alle bestehenden API-Routes migrieren: JSON-File-Write → SQLite-Insert
- Betrifft: `api/investor.ts`, `api/makler.ts`, `api/bewertung.ts`, `api/lead-magnet.ts`
- Neue Route: `api/tippgeber.ts`
- Honeypot-Spam-Check bleibt in allen Routes

### Dependency
- `better-sqlite3` (npm) — synchron, schnell, zero-config, perfekt für Astro SSR

---

## 2. Navigation

### Vorher
```
So funktioniert's | Für Investoren | Für Makler | ROI-Rechner
```

### Nachher
```
So funktioniert's | Für Investoren | Für Makler | Tippgeber | ROI-Rechner
```

- Änderung in `src/components/Nav.astro`
- Link: `/tippgeber`
- Mobile Hamburger-Menü ebenfalls erweitern

---

## 3. Investoren-Formular — Umbau

### Feld-Reihenfolge tauschen (links ↔ rechts)
- **Links (Feld 1):** "Ich bin..." — neues Dropdown
- **Rechts (Feld 2):** "Erfahrungslevel" — bleibt wie gehabt

### Neues Dropdown "Ich bin..."
```html
<select name="investor_typ" required>
  <option value="">Bitte wählen...</option>
  <option value="selbst">Handwerker / saniere selbst</option>
  <option value="teils">Mache teils selbst, teils Fremdvergabe</option>
  <option value="fremdvergabe">Investor / lasse komplett sanieren</option>
</select>
```

### Gewerk bleibt optional darunter
- Label: "Gewerk (optional)"
- Unverändert: Keins, Maler, Elektriker, SHK, Trockenbau, Fliesenleger

### API-Änderung
- `api/investor.ts`: Neues Feld `investor_typ` aus FormData lesen
- In SQLite speichern statt JSON

---

## 4. Makler-Seite — Umbau auf Bewerbung

### Copy-Struktur (Pain → Solution → Benefit)

**Pain:**
Problemobjekte fressen Zeit und Nerven. Messie, Erbschaft, Sanierungsstau — Stundenlohn geht gegen Null.

**Solution:**
Objekte an uns abgeben. Wir haben die Käufer die genau das suchen.

**Benefit:**
Machen Sie Ihre Problemobjekte zu Geld. Vertraglich abgesicherter Provisionsanspruch, null Mehraufwand.

### Formular — Nur Bewerbung (Kontaktdaten)
```
Ihr Name *
Maklerbüro
E-Mail *
Telefon *
```

- Kein PLZ-Feld mehr
- Kein Objekt-Typ Dropdown mehr
- Kein Beschreibungs-Textarea mehr
- Alle Objekt-Felder entfernt — Objekt-Einreichung kommt erst nach Vertragsabschluss

### Vertragshinweis auf der Seite
- Textblock nach dem Formular oder davor:
- "Wir sichern Ihren Provisionsanspruch vertraglich ab. Nach Ihrer Anmeldung erhalten Sie unsere Kooperationsvereinbarung — transparent, fair, rechtsverbindlich."
- Kein PDF-Download auf der Seite (Vertrag kommt per Mail nach persönlichem Kontakt)

### API-Änderung
- `api/makler.ts`: Vereinfachte Felder, SQLite statt JSON

---

## 5. Tippgeber-Seite — Neu

### URL
`/tippgeber`

### Seitenstruktur

**Hero:**
- Label: "Tippgeber werden"
- H1: "Verdiene echtes Zusatzeinkommen — für einen guten Tipp."
- Sub: "Du bist sowieso jeden Tag in Wohnhäusern unterwegs. Wenn du hörst dass jemand verkaufen will — melde uns den Kontakt. Wir machen den Rest."
- CTA: "Jetzt anmelden →" (scrollt zu Formular)

**Pain-Section:**
- "Du arbeitest hart und am Ende des Monats könnte immer mehr übrig sein."
- Keine Zahlen, kein Provisions-Betrag auf der öffentlichen Seite

**Wer kann Tippgeber werden? (Kacheln/Icons)**
- Postboten & Zeitungszusteller
- Gebäudereiniger & Fensterputzer
- Hausmeister
- Schornsteinfeger
- Pflegedienste
- Handwerker
- Paket-Zusteller (DHL, Amazon, etc.)
- Heizungs-/Wasserableser & Rauchmelder-Wartung
- "Jeder der regelmäßig in Häusern unterwegs ist"

**So funktioniert's (2 Flows, simpel):**
1. "Du hörst von jemandem der verkaufen will? Melde uns den Kontakt."
2. "Du willst aktiv werden? Nach der Anmeldung zeigen wir dir wie."
- Kein Detail zu Flyern/QR auf der öffentlichen Seite — das kommt nach Registrierung

**Vertragshinweis:**
- "Dein Provisionsanspruch ist vertraglich abgesichert. Nach deiner Anmeldung bekommst du alle Details."

**Registrierungsformular:**
```
Name *
E-Mail *
Telefon *
Ich bin... * (Dropdown):
  - Postbote / Zeitungszusteller
  - Gebäudereiniger / Fensterputzer
  - Hausmeister
  - Schornsteinfeger
  - Pflegedienst
  - Handwerker
  - Paket-Zusteller
  - Ableser / Wartungsdienst
  - Sonstiges
PLZ (Einsatzgebiet)
```

### API
- Neue Route: `api/tippgeber.ts`
- Honeypot-Feld
- Insert in SQLite `registrations` Tabelle mit `typ='tippgeber'`
- Redirect → `/danke?typ=tippgeber`

### Danke-Seite
- `/danke?typ=tippgeber` → eigener Text:
- "Danke für deine Anmeldung! Wir melden uns innerhalb von 48 Stunden mit allen Details zu deiner Provision und wie du starten kannst."

---

## 6. Bestehende Formulare → SQLite Migration

### Betroffen
| Route | Aktuell | Neu |
|-------|---------|-----|
| `api/investor.ts` | JSON-File | SQLite |
| `api/makler.ts` | JSON-File | SQLite |
| `api/bewertung.ts` | JSON-File | SQLite |
| `api/lead-magnet.ts` | JSON-File | SQLite |
| `api/unterlagen.ts` | JSON-File | SQLite |
| `api/unterlagen-frage.ts` | JSON-File | SQLite |
| `api/tippgeber.ts` | NEU | SQLite |

### Migration
- `src/lib/db.ts` erstellen mit `better-sqlite3`
- DB-Pfad: `process.env.WKDI_DB_PATH || '/data/wkdi/wkdi.db'`
- Auto-Create Tables beim ersten Zugriff
- Jede API-Route: `writeFile(...)` ersetzen durch `db.insert(...)`

---

## 7. Domain (wenn Joachim DNS-Zugang liefert)

- A-Record: `wirkaufendeineimmobilie.de → 178.104.15.187`
- A-Record: `www.wirkaufendeineimmobilie.de → 178.104.15.187`
- Coolify: Domain in App-Settings hinzufügen + SSL-Zertifikat (Let's Encrypt auto)
- `astro.config.mjs`: `site` URL updaten

---

## 8. NICHT in Spec 1

| Thema | Wann |
|-------|------|
| Bieterverfahren | Spec 4 (nach Call 23.03.) |
| DSGVO Löschkonzept | Spec 3 |
| Tippgeber-Training (PDF + Email) | Spec 2 |
| QR-Code-System mit Attribution | Spec 2 |
| Impressum/Datenschutz | Wartet auf Joachim |
| Tippgeber Flyer-Design | Spec 2 |
| Admin-Dashboard | Später |
| Firmenkonstruktion LLC ↔ KRE | Spec 3 |

---

## Implementierungs-Reihenfolge

1. **SQLite Setup** — `better-sqlite3`, `db.ts`, Schema, Volume-Mount
2. **API-Routes migrieren** — alle 6 bestehenden Routes: JSON → SQLite
3. **Investoren-Formular umbauen** — Felder tauschen, neues Dropdown
4. **Makler-Seite umbauen** — Bewerbung statt Objekt-Einreichung, PSB-Copy
5. **Tippgeber-Seite bauen** — kompletter Neubau
6. **Navigation erweitern** — Tippgeber-Link
7. **Danke-Seite** — typ=tippgeber Variante
8. **Deploy + Test**
9. **Domain** (wenn DNS-Zugang da)
