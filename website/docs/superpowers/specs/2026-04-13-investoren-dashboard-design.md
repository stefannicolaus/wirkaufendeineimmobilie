# Investoren Dashboard — Design Spec
**Datum:** 2026-04-13  
**Projekt:** WKDI — wirkaufendeineimmobilie  
**Ziel:** Admin-Seite für Joachim um alle Investor-Registrierungen auf einen Blick zu verwalten  
**Mockup:** `.superpowers/brainstorm/59785-1776086892/content/full-mockup.html`

---

## Kontext

Die WKDI-Website hat bereits einen Admin-Bereich (`/admin/`) mit Login, geschützt durch Middleware. Es gibt eine generische Registrierungsliste (`/admin/registrierungen`) die alle Lead-Typen zeigt. Investoren brauchen eine dedizierte Ansicht mit mehr Feldern, CRM-Aktionen und Animations-Design.

Stack: Astro SSR, better-sqlite3, system-ui (Admin), Dark-Theme neu für Investoren-Dashboard.

---

## Was gebaut wird

### 1. Neue Seite: `/admin/investoren` (Astro SSR)
Für Joachim. Zeigt alle `registrations WHERE typ = 'investor'`.

**Layout:** Zwei-Spalten — Tabelle links, Detail-Panel rechts (slide-in bei Klick)

**Obere Kennzahlen-Leiste (togglebar):**
- Gesamt (alle Investoren)
- Neu (Status = 'neu')
- Qualifiziert (Status = 'qualifiziert')
- Deals (Status = 'abgeschlossen')

**Filter-Toolbar:**
- Freitext-Suche (Name + E-Mail, client-seitig)
- Filter-Buttons: Alle / Neu / Qualifiziert / Aktiv
- Toggle-Button: Statistiken ein/aus (localStorage-persistiert)

**Tabellen-Spalten:**
| # | Spalte | Quelle DB-Feld |
|---|--------|---------------|
| 1 | Name | `name` |
| 2 | Typ | `investor_typ` (selbst / teils / fremdvergabe) |
| 3 | Assetklasse | `assetklasse` (new — Tags) |
| 4 | Budget | `kaufpreis_min` + `kaufpreis_max` (new) |
| 5 | Erfahrung | `erfahrung` |
| 6 | Status | `status` (Badge) |
| 7 | Datum | `created_at` |

**Detail-Panel (slide-in, 280px):**
- Name + Status + Datum
- E-Mail, Telefon, Investor-Typ
- Assetklassen-Tags, Budget
- Erfahrung, Objektzustand, Kaufzeitrahmen
- Status-Dropdown (änderbar → POST /api/admin-investor)
- Notiz-Textarea (speicherbar → POST /api/admin-investor)
- Buttons: E-Mail, WhatsApp (tel:), Löschen (POST /api/admin-investor { action: 'delete' })

**Animationen:**
- Zeilen-Einzug: `fadeInUp` gestaffelt (0.03s delay pro Zeile)
- Panel-Öffnen: `slideInRight` (0.2s ease)
- Stats-Toggle: `max-height` transition (0.3s)
- Hover auf Tabellenzeilen: `background` transition

**Design:** Dark theme (`#020817` Body, `#0f172a` Cards, `#1e293b` Borders, `#3b82f6` Accent). Eigenständiges CSS in der .astro-Datei (kein globales Design-System).

---

### 2. Neue API-Route: `POST /api/admin-investor`
Zwei Aktionen über `action`-Parameter:

**update** — Status oder Notiz ändern:
```
POST /api/admin-investor
{ action: 'update', id: 5, status: 'qualifiziert', notiz: '...' }
```
→ nutzt bestehende `updateRegistration()` aus `lib/db.ts`

**delete** — Investor löschen:
```
POST /api/admin-investor  
{ action: 'delete', id: 5 }
```
→ neue `deleteRegistration(id)` Funktion in `lib/db.ts`

Auth-Guard: Route prüft Admin-Session Cookie (gleiche Logik wie bestehende `admin-leads.ts`).

---

### 3. DB-Erweiterungen (idempotente ALTER TABLE)

Neue Felder in `lib/db.ts` per try/catch wie bestehende Felder:

```sql
ALTER TABLE registrations ADD COLUMN assetklasse TEXT;
ALTER TABLE registrations ADD COLUMN kaufpreis_min INTEGER;
ALTER TABLE registrations ADD COLUMN kaufpreis_max INTEGER;
ALTER TABLE registrations ADD COLUMN objektzustand TEXT;
ALTER TABLE registrations ADD COLUMN kaufzeitrahmen TEXT;
```

**Hinweis:** Diese Felder werden zunächst leer sein (bestehende Registrierungen haben sie nicht ausgefüllt). Die Investoren-Form-Erweiterung (neue Pflichtfelder) ist ein separater Task.

---

### 4. Nav-Update: `/admin/index.astro` + bestehende Admin-Seiten
Link "Investoren" in die bestehende Admin-Navigation einfügen (neben Registrierungen, KA-Rechner).

---

## Datenfluss

```
Browser → GET /admin/investoren
  → Astro SSR: Middleware prüft Admin-Cookie
  → getRegistrations({ typ: 'investor', limit: 200 })
  → countRegistrations({ typ: 'investor' }) × 4 für Stats (gesamt, neu, qualifiziert, abgeschlossen)
  → HTML gerendert mit Inline-JS für Interaktivität

Browser → Zeile klicken → JS öffnet Side-Panel (kein Server-Request)
Browser → Status ändern → POST /api/admin-investor { action: 'update' }
  → updateRegistration(id, { status }) → 200 OK
Browser → Notiz speichern → POST /api/admin-investor { action: 'update' }
  → updateRegistration(id, { notiz }) → 200 OK
Browser → Löschen → POST /api/admin-investor { action: 'delete' }
  → deleteRegistration(id) → 200 OK → Row aus DOM entfernen
```

---

## Abgrenzung

**In Scope:**
- `/admin/investoren.astro` mit vollem Dark-Theme + Animationen
- `/api/admin-investor.ts` (update + delete)
- DB-Spalten für Investor-Profil-Felder
- `deleteRegistration()` in `lib/db.ts`
- Nav-Link in Admin-Bereich

**Out of Scope (separater Task):**
- Erweiterung des Investoren-Formulars (`/investoren`) um neue Felder
- Automatisches Matching-System (Objekt → passende Investoren)
- Export-Funktion (CSV) — bereits in `/admin/registrierungen`

---

## Erfolgskriterien

- [ ] Joachim sieht alle Investor-Registrierungen in der dunklen Tabelle
- [ ] Klick auf Zeile öffnet Detail-Panel mit Slide-Animation
- [ ] Status kann per Dropdown geändert und gespeichert werden
- [ ] Notiz kann erfasst und gespeichert werden
- [ ] Kennzahlen-Leiste togglebar
- [ ] Suche + Filter funktioniert client-seitig
- [ ] Seite erfordert Admin-Login (Middleware greift)
- [ ] Build auf `feat/website-build` Branch erfolgreich
