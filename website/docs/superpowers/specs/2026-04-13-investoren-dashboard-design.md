# Investoren Dashboard — Design Spec
**Datum:** 2026-04-13  
**Projekt:** WKDI — wirkaufendeineimmobilie  
**Ziel:** Admin-Seite für Joachim um alle Investor-Registrierungen auf einen Blick zu verwalten  
**Mockup:** `.superpowers/brainstorm/59785-1776086892/content/full-mockup.html`  
**Review:** Codex gpt-5.4 — 10 Blocker gefunden, alle adressiert (siehe Abschnitt Codex-Review)

---

## Kontext

Die WKDI-Website hat bereits einen Admin-Bereich (`/admin/`) mit Login, geschützt durch Middleware. Es gibt eine generische Registrierungsliste (`/admin/registrierungen`) die alle Lead-Typen zeigt. Investoren brauchen eine dedizierte Ansicht mit mehr Feldern, CRM-Aktionen und Animations-Design.

Stack: Astro SSR, better-sqlite3, system-ui (Admin), Dark-Theme neu für Investoren-Dashboard.

`status` und `notiz` existieren bereits in der DB (`lib/db.ts` — `ALTER TABLE ... ADD COLUMN status TEXT DEFAULT 'neu'` und `notiz TEXT`).

---

## Was gebaut wird

### 1. Neue Seite: `/admin/investoren` (Astro SSR)
Für Joachim. Zeigt alle `registrations WHERE typ = 'investor'`.

**Layout:** Zwei-Spalten — Tabelle links, Detail-Panel rechts (slide-in bei Klick)

**Obere Kennzahlen-Leiste (togglebar via localStorage):**
- Gesamt (COUNT alle Investoren)
- Neu (COUNT WHERE status = 'neu')
- Qualifiziert (COUNT WHERE status = 'qualifiziert')
- Deals (COUNT WHERE status = 'abgeschlossen')
- Implementierung: 1 GROUP-BY-Query statt 4× countRegistrations

**Kanonisches Status-Enum (vollständig):**
`neu` → `kontaktiert` → `qualifiziert` → `aktiv` → `abgeschlossen` | `nicht qualifiziert`

Filter-Buttons zeigen: **Alle / Neu / Qualifiziert / Aktiv**  
Badges: neu=blau, qualifiziert=grün, aktiv=gelb, abgeschlossen=grau, kontaktiert=lila, nicht qualifiziert=rot

**Pagination:** Erste Version lädt max. 200 Einträge (hardcoded cap), Hinweis in UI wenn `total > 200`. Pagination als explizit Out-of-Scope für diese Version vermerkt.

**Filter-Toolbar:**
- Freitext-Suche (Name + E-Mail, client-seitig über geladene Daten)
- Filter-Buttons: Alle / Neu / Qualifiziert / Aktiv
- Toggle-Button: Statistiken ein/aus

**Tabellen-Spalten:**
| # | Spalte | Quelle DB-Feld | Leer-Zustand |
|---|--------|----------------|-------------|
| 1 | Name | `name` | "—" |
| 2 | Typ | `investor_typ` | "—" |
| 3 | Assetklasse | `assetklasse` (JSON-Array als TEXT) | keine Tags |
| 4 | Budget | `kaufpreis_min` + `kaufpreis_max` (INTEGER, Euro) | "—" |
| 5 | Erfahrung | `erfahrung` | "—" |
| 6 | Status | `status` (Badge) | Badge "neu" |
| 7 | Datum | `created_at` | "—" |

**Detail-Panel (slide-in, 280px):**
- Name + Status-Badge + Datum
- E-Mail (als `<a href="mailto:">` — sicher, kein innerHTML)
- Telefon (als `<a href="tel:">`)
- WhatsApp-Button → `https://wa.me/<normalisierteTelefonnummer>` (nicht `tel:`)
- Investor-Typ, Assetklassen-Tags, Budget, Erfahrung, Objektzustand, Kaufzeitrahmen
- Leer-Zustände aller Felder: "—" anzeigen, nie undefined/null ausgeben
- Status-Dropdown (erlaubte Werte: kanonisches Enum oben)
- Notiz-Textarea (max. 2000 Zeichen, Länge client-seitig begrenzen)
- Buttons: E-Mail, WhatsApp, Löschen

**Rendering-Sicherheit:** Alle DB-Werte werden ausschließlich als `textContent` gesetzt (kein `innerHTML` für User-Daten). Astro-Templating escaped automatisch — nur für den JS-Teil explizit `.textContent =` verwenden.

**Animationen:**
- Zeilen-Einzug: `fadeInUp` gestaffelt (0.03s delay pro Zeile), `prefers-reduced-motion: reduce` → keine Animation
- Panel-Öffnen: `slideInRight` (0.2s ease)
- Stats-Toggle: `max-height` transition (0.3s)
- Hover auf Tabellenzeilen: `background` transition

**Design:** Dark theme (`#020817` Body, `#0f172a` Cards, `#1e293b` Borders, `#3b82f6` Accent). Eigenständiges CSS in der .astro-Datei.

---

### 2. Neue API-Route: `POST /api/admin-investor`

**Auth-Guard:** Gleiche Session-Cookie-Prüfung wie `admin-leads.ts`. Zusätzlich: jede Operation prüft `WHERE id = ? AND typ = 'investor'` — verhindert Zugriff auf andere Lead-Typen per ID.

**CSRF:** Route prüft `Origin`-Header gegen erwartete Domain. SameSite=Strict Cookie reicht als zweite Schutzebene (Astro-Default).

**Input-Validierung (server-seitig, beide Actions):**
- `id`: muss Integer > 0 sein
- `action`: Whitelist `['update', 'delete']`
- `status` (bei update): Whitelist gegen kanonisches Enum
- `notiz` (bei update): String, max. 2000 Zeichen, wird getrimmt
- Unbekannte Felder werden ignoriert (kein pass-through)

**update** — Status oder Notiz ändern:
```
POST /api/admin-investor
{ action: 'update', id: 5, status: 'qualifiziert' }
{ action: 'update', id: 5, notiz: 'Rückruf vereinbart' }
```
→ `updateRegistration(id, { status })` oder `updateRegistration(id, { notiz })` aus `lib/db.ts`  
→ Antwort: `{ success: true }` | `{ error: '...' }` mit passendem HTTP-Status

**delete** — Soft Delete (status = 'geloescht', nicht physisch):
```
POST /api/admin-investor
{ action: 'delete', id: 5 }
```
→ `updateRegistration(id, { status: 'geloescht' })` — kein echtes DELETE  
→ Row verschwindet aus Tabelle (client-seitig gefiltert), Daten bleiben in DB  
→ Antwort: `{ success: true }` | `{ error: '...' }`

**Fehlerfälle:**
- 401: Session abgelaufen / kein Cookie
- 400: Invalide `action`, `id`, `status`, oder `notiz` zu lang
- 404: ID nicht gefunden oder nicht `typ = 'investor'`
- 500: DB-Fehler (generisch, kein Stack-Trace nach außen)

---

### 3. DB-Erweiterungen

Neue Felder in `lib/db.ts` per try/catch (bestehender Migrations-Pattern):

```sql
ALTER TABLE registrations ADD COLUMN assetklasse TEXT;      -- JSON-Array: '["MFH","EFH"]'
ALTER TABLE registrations ADD COLUMN kaufpreis_min INTEGER; -- Euro (ganzzahlig), NULL = nicht angegeben
ALTER TABLE registrations ADD COLUMN kaufpreis_max INTEGER; -- Euro (ganzzahlig), NULL = nicht angegeben
ALTER TABLE registrations ADD COLUMN objektzustand TEXT;    -- JSON-Array: '["vollsanierung","teilsanierung"]'
ALTER TABLE registrations ADD COLUMN kaufzeitrahmen TEXT;   -- z.B. 'sofort', '1-3m', '3-6m', '6-12m'
```

**`assetklasse` + `objektzustand`:** Im Formular per Checkbox gesammelt, als JSON-Array gespeichert (`JSON.stringify([...])`) und in der Anzeige per `JSON.parse()` zu Tags gerendert. NULL und `'[]'` beide als "keine Tags" behandeln.

**Budget:** Einheit = Euro (ganzzahlig). Formatierung in UI: `€ 150.000 – 400.000`. NULL in min oder max = jeweiligen Wert mit "—" anzeigen.

**Hinweis:** Bestehende Registrierungen haben diese Felder leer (NULL). Die Investoren-Form-Erweiterung ist ein separater Task.

---

### 4. Nav-Update
Link "Investoren" in alle bestehenden Admin-Seiten-Navigationen einfügen (`/admin/index.astro`, `registrierungen.astro`, `kapitalanleger.astro`).

---

## Datenfluss

```
Browser → GET /admin/investoren
  → Middleware prüft Admin-Session Cookie → 302 /admin/login wenn nicht auth
  → 1× GROUP-BY-Query für Stats (gesamt/neu/qualifiziert/abgeschlossen)
  → getRegistrations({ typ: 'investor', limit: 200 })
  → HTML gerendert, alle Werte Astro-escaped
  → Inline-JS initialisiert Tabelle + Panel-Interaktion (textContent only)

Browser → Zeile klicken → JS öffnet Side-Panel (kein Server-Request, Daten bereits geladen)
Browser → Status ändern → POST /api/admin-investor { action: 'update', id, status }
  → Auth + Origin-Check + Whitelist-Validation → updateRegistration → { success: true }
  → Client aktualisiert Badge in Tabelle + Panel
Browser → Notiz speichern → POST /api/admin-investor { action: 'update', id, notiz }
  → wie oben → Button zeigt "✓ Gespeichert" für 1.5s
Browser → Löschen → Confirm-Dialog → POST /api/admin-investor { action: 'delete', id }
  → Soft Delete (status = 'geloescht') → Row aus DOM entfernen
```

---

## Abgrenzung

**In Scope:**
- `/admin/investoren.astro` — Dark Theme, Tabelle, Side-Panel, Animationen
- `/api/admin-investor.ts` — update (status/notiz) + soft delete
- DB-Migrations für 5 neue Investor-Felder
- Nav-Links in allen Admin-Seiten

**Out of Scope:**
- Pagination (Cap bei 200 reicht für den Start)
- Erweiterung des Investoren-Formulars (`/investoren`) um neue Felder
- Automatisches Matching-System
- CSV-Export (bereits in `/admin/registrierungen`)

---

## Erfolgskriterien

- [ ] Joachim sieht alle Investor-Registrierungen in der dunklen Tabelle
- [ ] Klick auf Zeile öffnet Detail-Panel mit Slide-Animation
- [ ] Leer-Felder zeigen "—", kein undefined/null sichtbar
- [ ] Status kann per Dropdown geändert werden (Whitelist erzwungen)
- [ ] Notiz kann erfasst und gespeichert werden (max 2000 Zeichen)
- [ ] Soft Delete entfernt Row aus Tabelle, Daten bleiben in DB
- [ ] Kennzahlen-Leiste togglebar (localStorage)
- [ ] Suche + Filter funktioniert client-seitig
- [ ] Seite erfordert Admin-Login, API erfordert Auth + Origin-Check
- [ ] `prefers-reduced-motion` deaktiviert Animationen
- [ ] Build auf `feat/website-build` Branch erfolgreich

---

## Codex-Review Ergebnisse (gpt-5.4)

Alle 10 Blocker adressiert:
- ✅ Status-Enum jetzt kanonisch definiert (6 Werte, alle Übergänge klar)
- ✅ "Neu" Kennzahl = Status='neu' (nicht "diese Woche")
- ✅ limit: 200 explizit als Cap mit UI-Hinweis
- ✅ API prüft `typ = 'investor'` bei jeder Operation
- ✅ CSRF: Origin-Check + SameSite-Cookie
- ✅ Input-Validierung: Whitelist für action/status, Längenlimit notiz
- ✅ `status` + `notiz` bereits in DB (bestätigt aus db.ts)
- ✅ `assetklasse` als JSON-Array TEXT definiert
- ✅ Budget als Euro-Integer, NULL-Handling definiert
- ✅ XSS: textContent only, kein innerHTML für User-Daten

Suggestions aufgenommen: Soft Delete, Fehlerfälle, Leer-Zustände, WhatsApp wa.me/, prefers-reduced-motion, GROUP-BY statt 4× COUNT.
