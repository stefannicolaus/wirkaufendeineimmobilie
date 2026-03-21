# Spec 1: DB + Formulare + Tippgeber + Makler-Umbau — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** All forms save to SQLite, investor form restructured, makler page simplified to registration, new tippgeber page, nav updated.

**Architecture:** SQLite via `better-sqlite3` with a shared `db.ts` module. All existing API routes migrated from JSON file writes to DB inserts. New `/tippgeber` page + API route. Dockerfile updated with volume mount for persistent DB storage.

**Tech Stack:** Astro 6 SSR, better-sqlite3, Node 22 Alpine Docker

**Spec:** `docs/superpowers/specs/2026-03-19-spec1-db-formulare-tippgeber-design.md`

---

## File Map

| Action | File | Responsibility |
|--------|------|----------------|
| Create | `website/src/lib/db.ts` | SQLite connection, schema init, insert helpers |
| Modify | `website/src/pages/api/investor.ts` | JSON→SQLite, read new `investor_typ` field |
| Modify | `website/src/pages/api/makler.ts` | JSON→SQLite, simplified fields |
| Modify | `website/src/pages/api/bewertung.ts` | JSON→SQLite |
| Modify | `website/src/pages/api/lead-magnet.ts` | JSON→SQLite |
| Create | `website/src/pages/api/tippgeber.ts` | New route, SQLite insert |
| Keep | `website/src/pages/api/unterlagen.ts` | Stays as file-based (uploads, not form data) |
| Keep | `website/src/pages/api/unterlagen-frage.ts` | Stays as file-based (audio/text uploads) |
| Modify | `website/src/pages/investoren.astro:101-122` | Swap field order, new "Ich bin" dropdown |
| Modify | `website/src/pages/makler.astro` | Full rewrite: PSB copy + bewerbung form |
| Create | `website/src/pages/tippgeber.astro` | New page: PSB copy + registration form |
| Modify | `website/src/components/Nav.astro:10-14,31-34` | Add Tippgeber link |
| Modify | `website/src/pages/danke.astro:10-60` | Add tippgeber + makler-bewerbung variants |
| Modify | `website/Dockerfile` | Volume mount for `/data/wkdi` |
| Modify | `website/package.json` | Add `better-sqlite3` dependency |

---

### Task 1: SQLite Setup + DB Module

**Files:**
- Modify: `website/package.json`
- Create: `website/src/lib/db.ts`

- [ ] **Step 1: Install better-sqlite3**

```bash
cd ~/code/brown2green/website && npm install better-sqlite3 && npm install -D @types/better-sqlite3
```

- [ ] **Step 2: Create db.ts module**

Create `website/src/lib/db.ts`:

```typescript
import Database from 'better-sqlite3';
import { join } from 'node:path';
import { mkdirSync } from 'node:fs';

const DB_PATH = process.env.WKDI_DB_PATH || join(process.cwd(), 'data', 'wkdi', 'wkdi.db');

// Ensure directory exists
mkdirSync(join(DB_PATH, '..'), { recursive: true });

const db = new Database(DB_PATH);

// Enable WAL mode for better concurrent read performance
db.pragma('journal_mode = WAL');

// Create tables on first access
db.exec(`
  CREATE TABLE IF NOT EXISTS registrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    typ TEXT NOT NULL CHECK(typ IN ('investor', 'makler', 'tippgeber', 'bewertung', 'lead-magnet')),
    name TEXT,
    email TEXT NOT NULL,
    telefon TEXT,
    investor_typ TEXT,
    erfahrung TEXT,
    gewerk TEXT,
    maklerbuero TEXT,
    tippgeber_typ TEXT,
    tippgeber_plz TEXT,
    plz TEXT,
    immobilientyp TEXT,
    lead_magnet_typ TEXT,
    lead_magnet_data TEXT,
    source TEXT DEFAULT 'website',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

export function insertRegistration(data: Record<string, unknown>) {
  const columns = Object.keys(data);
  const placeholders = columns.map(() => '?').join(', ');
  const values = columns.map(k => data[k] ?? null);

  const stmt = db.prepare(
    `INSERT INTO registrations (${columns.join(', ')}) VALUES (${placeholders})`
  );
  return stmt.run(...values);
}

export default db;
```

- [ ] **Step 3: Verify build passes**

```bash
cd ~/code/brown2green/website && npm run build
```

Expected: Build succeeds. `better-sqlite3` is a native module — if Alpine build fails, may need to add `RUN apk add --no-cache python3 make g++` to Dockerfile.

- [ ] **Step 4: Commit**

```bash
cd ~/code/brown2green && git add website/package.json website/package-lock.json website/src/lib/db.ts
git commit -m "feat: add SQLite database module with better-sqlite3"
```

---

### Task 2: Migrate API Routes to SQLite

**Files:**
- Modify: `website/src/pages/api/investor.ts`
- Modify: `website/src/pages/api/makler.ts`
- Modify: `website/src/pages/api/bewertung.ts`
- Modify: `website/src/pages/api/lead-magnet.ts`

- [ ] **Step 1: Migrate api/bewertung.ts**

Replace the entire file content:

```typescript
import type { APIRoute } from 'astro';
import { insertRegistration } from '../../lib/db';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const data = await request.formData();

  // Honeypot spam check
  if (data.get('website')) {
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  insertRegistration({
    typ: 'bewertung',
    name: data.get('name') || '',
    email: data.get('email'),
    telefon: data.get('telefon'),
    plz: data.get('plz'),
    immobilientyp: data.get('typ'),
  });

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
```

- [ ] **Step 2: Migrate api/investor.ts**

Replace the entire file content:

```typescript
import type { APIRoute } from 'astro';
import { insertRegistration } from '../../lib/db';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const data = await request.formData();

  insertRegistration({
    typ: 'investor',
    name: data.get('name'),
    email: data.get('email'),
    telefon: data.get('telefon'),
    investor_typ: data.get('investor_typ'),
    erfahrung: data.get('erfahrung'),
    gewerk: data.get('gewerk'),
  });

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
```

- [ ] **Step 3: Migrate api/makler.ts**

Replace the entire file content (simplified fields — bewerbung only):

```typescript
import type { APIRoute } from 'astro';
import { insertRegistration } from '../../lib/db';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const data = await request.formData();

  // Honeypot spam check
  if (data.get('website')) {
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  insertRegistration({
    typ: 'makler',
    name: data.get('name'),
    email: data.get('email'),
    telefon: data.get('telefon'),
    maklerbuero: data.get('maklerbuero'),
  });

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
```

- [ ] **Step 4: Migrate api/lead-magnet.ts**

Replace the entire file content:

```typescript
import type { APIRoute } from 'astro';
import { insertRegistration } from '../../lib/db';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const data = await request.formData();

  // Honeypot spam check
  if (data.get('website')) {
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const typ = data.get('typ') as string;
  const extraData: Record<string, unknown> = {};

  if (typ === 'aktionsplan-erben') {
    extraData.lead_magnet_data = JSON.stringify({
      anzahl_erben: data.get('anzahl_erben'),
      blockiert_seit: data.get('blockiert_seit'),
    });
    extraData.plz = data.get('plz');
  } else if (typ === 'blueprint') {
    extraData.lead_magnet_data = JSON.stringify({
      erfahrung: data.get('erfahrung'),
      budget: data.get('budget'),
      handwerker: data.get('handwerker'),
    });
  } else if (typ === 'kompass') {
    extraData.lead_magnet_data = JSON.stringify({
      rolle: data.get('rolle'),
      vermoegenssorge: data.get('vermoegenssorge'),
    });
    extraData.plz = data.get('plz');
  }

  insertRegistration({
    typ: 'lead-magnet',
    email: data.get('email'),
    lead_magnet_typ: typ,
    ...extraData,
  });

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
```

- [ ] **Step 5: Build + verify**

```bash
cd ~/code/brown2green/website && npm run build
```

- [ ] **Step 6: Commit**

```bash
cd ~/code/brown2green && git add website/src/pages/api/
git commit -m "feat: migrate all API routes from JSON files to SQLite"
```

---

### Task 3: Tippgeber API Route

**Files:**
- Create: `website/src/pages/api/tippgeber.ts`

- [ ] **Step 1: Create api/tippgeber.ts**

```typescript
import type { APIRoute } from 'astro';
import { insertRegistration } from '../../lib/db';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const data = await request.formData();

  // Honeypot spam check
  if (data.get('website')) {
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  insertRegistration({
    typ: 'tippgeber',
    name: data.get('name'),
    email: data.get('email'),
    telefon: data.get('telefon'),
    tippgeber_typ: data.get('tippgeber_typ'),
    tippgeber_plz: data.get('plz'),
  });

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
```

- [ ] **Step 2: Commit**

```bash
cd ~/code/brown2green && git add website/src/pages/api/tippgeber.ts
git commit -m "feat: add tippgeber API route with SQLite storage"
```

---

### Task 4: Investoren-Formular Umbau

**Files:**
- Modify: `website/src/pages/investoren.astro:101-122`

- [ ] **Step 1: Replace the form-row section (lines 101-122)**

Replace the `<div class="form-row">` block with:

```html
<div class="form-row">
  <div class="form-group">
    <label for="inv-typ">Ich bin... *</label>
    <select id="inv-typ" name="investor_typ" required>
      <option value="">Bitte wählen...</option>
      <option value="selbst">Handwerker / saniere selbst</option>
      <option value="teils">Mache teils selbst, teils Fremdvergabe</option>
      <option value="fremdvergabe">Investor / lasse komplett sanieren</option>
    </select>
  </div>
  <div class="form-group">
    <label for="inv-erfahrung">Erfahrungslevel *</label>
    <select id="inv-erfahrung" name="erfahrung" required>
      <option value="">Bitte wählen...</option>
      <option value="0">Noch kein Deal abgeschlossen</option>
      <option value="1-2">1-2 Deals</option>
      <option value="3+">3+ Deals</option>
    </select>
  </div>
</div>
<div class="form-group">
  <label for="inv-gewerk">Gewerk (optional)</label>
  <select id="inv-gewerk" name="gewerk">
    <option value="">Keins / nicht relevant</option>
    <option value="maler">Maler</option>
    <option value="elektriker">Elektriker</option>
    <option value="shk">SHK (Sanitär/Heizung)</option>
    <option value="trockenbau">Trockenbau</option>
    <option value="fliesenleger">Fliesenleger</option>
  </select>
</div>
```

- [ ] **Step 2: Update form submit handler**

Find the `<script>` section in investoren.astro that handles the form submit. Ensure the form data sent to `/api/investor` includes the new `investor_typ` field. Since the form uses `formData`, the new `name="investor_typ"` select is automatically included.

- [ ] **Step 3: Build + verify**

```bash
cd ~/code/brown2green/website && npm run build
```

- [ ] **Step 4: Commit**

```bash
cd ~/code/brown2green && git add website/src/pages/investoren.astro
git commit -m "feat: investor form — add 'Ich bin' dropdown, swap field order"
```

---

### Task 5: Makler-Seite Umbau (Bewerbung)

**Files:**
- Modify: `website/src/pages/makler.astro` (full rewrite of hero + form sections)

- [ ] **Step 1: Rewrite hero section**

Replace the hero section (lines 9-22) — keep existing CSS class names:

```html
<!-- HERO -->
<section class="section makler-hero">
  <div class="container makler-hero__inner">
    <div class="label">Für Immobilienmakler — Kooperation</div>
    <h1>Ihre Problemobjekte.<br /><span class="text-accent">Unser Spezialgebiet.</span></h1>
    <p class="makler-hero__sub">
      Problemobjekte fressen Zeit und Nerven. Messie, Erbschaft, Sanierungsstau — Stundenlohn geht gegen Null. Wir haben die Käufer die genau das suchen. Machen Sie Ihre Problemobjekte zu Geld.
    </p>
    <div class="makler-hero__buttons">
      <a href="#makler-form" class="btn btn-primary">Jetzt bewerben &rarr;</a>
      <a href="#painpoints" class="btn btn-outline">Warum das funktioniert &darr;</a>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Update stats bar**

Replace "100% Ihre Provision bleibt" stat with:

```html
<div class="makler-stat">
  <div class="makler-stat__value">Vertraglich</div>
  <div class="makler-stat__label">Provision abgesichert</div>
</div>
```

- [ ] **Step 3: Rewrite the form section**

Find the form section (`#makler-form`) and replace with simplified bewerbung form. Remove all object-specific fields (PLZ, Objekt-Typ, Beschreibung). Replace with:

```html
<section class="makler-form-section bg-alt" id="makler-form">
  <div class="container" style="max-width: 640px;">
    <div class="makler-section-header" style="text-align: center; margin-bottom: var(--space-10);">
      <h2>Kooperationspartner werden</h2>
      <p class="text-mid">Wir sichern Ihren Provisionsanspruch vertraglich ab. Nach Ihrer Anmeldung erhalten Sie unsere Kooperationsvereinbarung — transparent, fair, rechtsverbindlich.</p>
    </div>
    <div class="inv-form-card">
      <form class="inv-form" id="makler-reg-form">
        <div class="form-group">
          <label for="makler-name">Ihr Name *</label>
          <input type="text" id="makler-name" name="name" required placeholder="Vorname Nachname" />
        </div>
        <div class="form-group">
          <label for="makler-firma">Maklerbüro</label>
          <input type="text" id="makler-firma" name="maklerbuero" placeholder="Ihr Unternehmen" />
        </div>
        <div class="form-group">
          <label for="makler-email">E-Mail *</label>
          <input type="email" id="makler-email" name="email" required placeholder="name@maklerbuero.de" />
        </div>
        <div class="form-group">
          <label for="makler-tel">Telefon *</label>
          <input type="tel" id="makler-tel" name="telefon" required placeholder="030 123 456" />
        </div>
        <!-- Honeypot -->
        <div style="position: absolute; left: -9999px;" aria-hidden="true">
          <input type="text" name="website" tabindex="-1" autocomplete="off" />
        </div>
        <button type="submit" class="btn btn-primary" style="width: 100%;">Bewerbung einreichen &rarr;</button>
      </form>
    </div>
  </div>
</section>
```

- [ ] **Step 4: Update the form submit script**

Find the `<script>` tag at the bottom that handles form submission. Update:
- Form ID: `makler-reg-form` (was `makler-form` or similar)
- API endpoint stays `/api/makler`
- Redirect to `/danke?typ=makler`

- [ ] **Step 5: Update danke.astro — makler variant**

In `website/src/pages/danke.astro`, update the `makler` content entry:

```typescript
makler: {
  title: 'Bewerbung eingegangen',
  heading: 'Ihre Bewerbung ist bei uns!',
  message: 'Nächster Schritt: Wir prüfen Ihre Angaben und melden uns innerhalb von 48 Stunden — mit allen Details zur Kooperation und unserer Vereinbarung.',
  next: 'So funktioniert das Verfahren',
  nextLink: '/so-funktionierts',
},
```

- [ ] **Step 6: Build + verify**

```bash
cd ~/code/brown2green/website && npm run build
```

- [ ] **Step 7: Commit**

```bash
cd ~/code/brown2green && git add website/src/pages/makler.astro website/src/pages/danke.astro
git commit -m "feat: makler page — switch from object submission to partner application"
```

---

### Task 6: Tippgeber-Seite (Neubau)

**Files:**
- Create: `website/src/pages/tippgeber.astro`

- [ ] **Step 1: Create tippgeber.astro**

Use the same layout patterns as investoren.astro (hero → benefits/cards → form). Copy the CSS patterns from investoren.astro and makler.astro — reuse existing class names where possible (`.inv-hero`, `.inv-form-card`, `.benefit-card`, etc.) or create `.tipp-*` variants.

Page structure:

```
Hero:
  Label: "Tippgeber werden"
  H1: "Verdiene echtes Zusatzeinkommen — für einen guten Tipp."
  Sub: "Du bist sowieso jeden Tag in Wohnhäusern unterwegs. Wenn du hörst
       dass jemand verkaufen will — melde uns den Kontakt. Wir machen den Rest."
  CTA: "Jetzt anmelden →" → #tippgeber-form

Pain Section:
  "Du arbeitest hart und am Ende des Monats könnte immer mehr übrig sein."

Wer kann Tippgeber werden? (grid of cards with icons):
  - Postboten & Zeitungszusteller
  - Gebäudereiniger & Fensterputzer
  - Hausmeister
  - Schornsteinfeger
  - Pflegedienste
  - Handwerker
  - Paket-Zusteller (DHL, Amazon, etc.)
  - Heizungs-/Wasserableser & Rauchmelder-Wartung
  - "Jeder der regelmäßig in Wohnhäusern unterwegs ist"

So funktioniert's (2 steps):
  1. "Du hörst von jemandem der verkaufen will? Melde uns den Kontakt."
  2. "Du willst aktiv werden? Nach der Anmeldung zeigen wir dir wie."

Vertragshinweis:
  "Dein Provisionsanspruch ist vertraglich abgesichert.
   Nach deiner Anmeldung bekommst du alle Details."

Registration Form (#tippgeber-form):
  Name *
  E-Mail *
  Telefon *
  "Ich bin..." * (dropdown — see spec for options)
  PLZ (Einsatzgebiet)
  Honeypot field (hidden)
  Submit: "Jetzt anmelden →"
```

Form submit: POST to `/api/tippgeber`, redirect to `/danke?typ=tippgeber`.

Use the same JS form submit pattern as investoren.astro (fetch POST → redirect on success).

- [ ] **Step 2: Add tippgeber variant to danke.astro**

Add to the `content` object in `website/src/pages/danke.astro`:

```typescript
tippgeber: {
  title: 'Anmeldung eingegangen',
  heading: 'Danke für deine Anmeldung!',
  message: 'Wir melden uns innerhalb von 48 Stunden mit allen Details — zu deiner Provision und wie du starten kannst.',
  next: 'So funktioniert das Verfahren',
  nextLink: '/so-funktionierts',
},
```

- [ ] **Step 3: Build + verify**

```bash
cd ~/code/brown2green/website && npm run build
```

- [ ] **Step 4: Commit**

```bash
cd ~/code/brown2green && git add website/src/pages/tippgeber.astro website/src/pages/danke.astro
git commit -m "feat: add Tippgeber page with registration form"
```

---

### Task 7: Navigation Update

**Files:**
- Modify: `website/src/components/Nav.astro:10-14,31-34`

- [ ] **Step 1: Add Tippgeber to desktop nav (line 13)**

After `<a href="/makler">Für Makler</a>` add:
```html
<a href="/tippgeber">Tippgeber</a>
```

- [ ] **Step 2: Add Tippgeber to mobile nav (line 33)**

After `<a href="/makler">Für Makler</a>` add:
```html
<a href="/tippgeber">Tippgeber</a>
```

- [ ] **Step 3: Build + verify**

```bash
cd ~/code/brown2green/website && npm run build
```

- [ ] **Step 4: Commit**

```bash
cd ~/code/brown2green && git add website/src/components/Nav.astro
git commit -m "feat: add Tippgeber to navigation"
```

---

### Task 8: Dockerfile + Volume Mount

**Files:**
- Modify: `website/Dockerfile`

- [ ] **Step 1: Update Dockerfile**

The current Dockerfile is a multi-stage build. `better-sqlite3` needs native compilation. Update:

```dockerfile
FROM node:22-alpine AS build
RUN apk add --no-cache python3 make g++
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine AS runtime
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./
ENV HOST=0.0.0.0
ENV PORT=4321
ENV WKDI_DB_PATH=/data/wkdi/wkdi.db
EXPOSE 4321
CMD ["node", "dist/server/entry.mjs"]
```

Key changes:
- Added `RUN apk add --no-cache python3 make g++` for native module compilation
- Added `ENV WKDI_DB_PATH=/data/wkdi/wkdi.db`

- [ ] **Step 2: Note for Coolify deployment**

In Coolify, add a persistent volume mount:
- Source: `/data/wkdi` (on host)
- Destination: `/data/wkdi` (in container)

This must be configured in Coolify dashboard → App → Storages → Add Volume.

- [ ] **Step 3: Build locally to verify Dockerfile**

```bash
cd ~/code/brown2green/website && docker build -t wkdi-test .
```

Expected: Build succeeds with `better-sqlite3` compiled.

- [ ] **Step 4: Commit**

```bash
cd ~/code/brown2green && git add website/Dockerfile
git commit -m "feat: Dockerfile — add native build deps for better-sqlite3 + DB volume"
```

---

### Task 9: Deploy + Smoke Test

- [ ] **Step 1: Push to GitHub**

```bash
cd ~/code/brown2green && git push
```

- [ ] **Step 2: Add volume mount in Coolify**

SSH into server or use Coolify dashboard:
- Add persistent storage: `/data/wkdi` → `/data/wkdi`

- [ ] **Step 3: Trigger deploy via Coolify API**

```bash
curl -s -X POST "http://178.104.15.187:8000/api/v1/deploy" \
  -H "Authorization: Bearer 34|4140dc1a1b2a699456ab4184ce45c091aaafa9fb03cd6b30bee1105735697e3ec8173c750bf828c8" \
  -H "Content-Type: application/json" \
  -d '{"uuid": "wisjftvt2q9b53z13nciq9dh", "force": true}'
```

- [ ] **Step 4: Smoke test all forms**

After deploy succeeds, test each form:

1. **Homepage Bewertung:** Submit test data → check `/danke?typ=verkaeufer`
2. **Investoren:** Submit with new "Ich bin" field → check `/danke?typ=investor`
3. **Makler:** Submit bewerbung (4 fields only) → check `/danke?typ=makler`
4. **Tippgeber:** Submit registration → check `/danke?typ=tippgeber`

Verify data landed in SQLite:
```bash
ssh root@178.104.15.187 "docker exec \$(docker ps --filter 'name=wkdi' -q | head -1) cat /data/wkdi/wkdi.db" > /tmp/wkdi.db && sqlite3 /tmp/wkdi.db "SELECT * FROM registrations;"
```

- [ ] **Step 5: Update backup script to include SQLite**

The existing backup script at `/opt/backup-volumes.sh` already looks for `*.db` files in brown2green paths. Verify it picks up `/data/wkdi/wkdi.db` by running:

```bash
ssh root@178.104.15.187 "/opt/backup-volumes.sh"
```

- [ ] **Step 6: Take Playwright screenshots (desktop + mobile)**

```bash
cd ~/code/brown2green/website
npx playwright screenshot --viewport-size="1440,900" https://wirkaufendeineimmobilie.build-upstream.com/investoren /tmp/wkdi-investoren-desktop.png
npx playwright screenshot --viewport-size="375,812" https://wirkaufendeineimmobilie.build-upstream.com/investoren /tmp/wkdi-investoren-mobile.png
npx playwright screenshot --viewport-size="1440,900" https://wirkaufendeineimmobilie.build-upstream.com/makler /tmp/wkdi-makler-desktop.png
npx playwright screenshot --viewport-size="1440,900" https://wirkaufendeineimmobilie.build-upstream.com/tippgeber /tmp/wkdi-tippgeber-desktop.png
npx playwright screenshot --viewport-size="375,812" https://wirkaufendeineimmobilie.build-upstream.com/tippgeber /tmp/wkdi-tippgeber-mobile.png
```

Review screenshots for visual correctness.
