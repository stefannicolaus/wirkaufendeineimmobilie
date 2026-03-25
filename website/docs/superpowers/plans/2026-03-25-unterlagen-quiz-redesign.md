# Unterlagen Quiz Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the flat `#step-erstbewertung` form in `unterlagen.astro` with a 7-step tile-based quiz that collects property details from motivated sellers.

**Architecture:** The quiz replaces only the `#step-erstbewertung` block (lines ~38–154 in `unterlagen.astro`). The existing upload wizard (steps 0–7), JS navigation, and PATCH API route remain unchanged. A new `quizState` object tracks answers; `goToQuizStep()` handles navigation. The API route accepts two new optional fields.

**Tech Stack:** Astro (SSR), vanilla TypeScript (inline `<script>` in .astro), better-sqlite3, Brevo transactional email, FileReader API for base64 upload.

**Spec:** `docs/superpowers/specs/2026-03-25-unterlagen-quiz-redesign.md`

---

## File Map

| File | Change |
|------|--------|
| `src/lib/db.ts` | Add 2 lazy ALTER TABLE migrations |
| `src/pages/api/bewertung.ts` | Accept `situation` + `energieausweis_base64` in PATCH |
| `src/pages/unterlagen.astro` | Replace `#step-erstbewertung` HTML, add quiz CSS + JS |

---

## Task 1: DB Migrations

**Files:**
- Modify: `src/lib/db.ts` (after line 63, before the `leads_kapitalanleger` CREATE TABLE)

- [ ] **Step 1: Add the two lazy migrations**

In `src/lib/db.ts`, after the `pdf_base64` migration line (line 63), add:

```typescript
// Quiz-Felder für Erstbewertung (idempotent)
try { db.exec(`ALTER TABLE registrations ADD COLUMN energieausweis_base64 TEXT`); } catch {}
try { db.exec(`ALTER TABLE registrations ADD COLUMN situation TEXT`); } catch {}
```

- [ ] **Step 2: Verify build still passes**

```bash
cd /Users/stefan/code/wkdi-temp/website && npm run build 2>&1 | tail -20
```

Expected: `Build complete` with no errors.

- [ ] **Step 3: Commit**

```bash
cd /Users/stefan/code/wkdi-temp/website
git add src/lib/db.ts
git commit -m "feat(db): add energieausweis_base64 + situation columns for quiz redesign"
```

---

## Task 2: API PATCH — Accept new quiz fields

**Files:**
- Modify: `src/pages/api/bewertung.ts` (PATCH handler, lines 85–203)

The PATCH handler needs to:
1. Accept `situation` from request body and merge it into `lead_magnet_data` JSON
2. Accept `energieausweis_base64` and store directly into the new column
3. Stop sending `sanierungsstand` in the DB update (it receives it but sets it to null for new quiz submissions — the field is deprecated per spec)
4. Update Joachim's notification email to show new fields

- [ ] **Step 1: Update destructuring in the PATCH handler**

Find this line in `bewertung.ts` (line ~88):
```typescript
const { ref, email, baujahr, wohnflaeche, energieklasse, heizung_baujahr,
        sanierungsstand, was_saniert, zustand, besonderheit, stellplatz,
        vermietet, etage, pain_freitext } = body;
```

Replace with:
```typescript
const { ref, email, baujahr, wohnflaeche, energieklasse, heizung_baujahr,
        was_saniert, zustand, besonderheit, stellplatz,
        vermietet, etage, pain_freitext, situation, energieausweis_base64 } = body;
```

(Note: `sanierungsstand` removed from destructuring — new quiz doesn't send it)

- [ ] **Step 2: Update the DB UPDATE statements**

The PATCH handler has two `db.prepare()` statements (one for `ref`, one for `email`). Both currently include `sanierungsstand`. Replace both with statements that:
- Remove `sanierungsstand=?`
- Add `energieausweis_base64=?` at the end

For the `ref`-based update (line ~99):
```typescript
const stmt = ref
  ? db.prepare(`UPDATE registrations SET
      baujahr=?, wohnflaeche=?, energieklasse=?, heizung_baujahr=?,
      was_saniert=?, zustand=?, besonderheit=?,
      stellplatz=?, vermietet=?, etage=?, pain_freitext=?,
      energieausweis_base64=?, objekt_step_done=1
      WHERE id=?`)
  : db.prepare(`UPDATE registrations SET
      baujahr=?, wohnflaeche=?, energieklasse=?, heizung_baujahr=?,
      was_saniert=?, zustand=?, besonderheit=?,
      stellplatz=?, vermietet=?, etage=?, pain_freitext=?,
      energieausweis_base64=?, objekt_step_done=1
      WHERE email=? AND typ='bewertung' ORDER BY id DESC LIMIT 1`);
```

Update the `.run()` call accordingly (remove `sanierungsstand ?? null`, add `energieausweis_base64 ?? null`):
```typescript
stmt.run(
  baujahr ?? null,
  wohnflaeche ?? null,
  energieklasse ?? null,
  heizung_baujahr ?? null,
  was_saniert ? JSON.stringify(was_saniert) : null,
  zustand ?? null,
  besonderheit ?? null,
  stellplatz ? 1 : 0,
  vermietet ? 1 : 0,
  etage ?? null,
  pain_freitext ?? null,
  energieausweis_base64 ?? null,
  ref || email,
);
```

- [ ] **Step 3: Merge `situation` into `lead_magnet_data`**

After the `stmt.run()` call, add a block that merges `situation` into the `lead_magnet_data` JSON field:

```typescript
// Merge situation into lead_magnet_data JSON
if (situation && Array.isArray(situation) && situation.length > 0) {
  const existing = ref
    ? (db.prepare(`SELECT lead_magnet_data FROM registrations WHERE id=?`).get(ref) as any)
    : (db.prepare(`SELECT lead_magnet_data FROM registrations WHERE email=? AND typ='bewertung' ORDER BY id DESC LIMIT 1`).get(email) as any);
  const current = existing?.lead_magnet_data ? JSON.parse(existing.lead_magnet_data) : {};
  current.situation = situation;
  const updated = JSON.stringify(current);
  if (ref) {
    db.prepare(`UPDATE registrations SET lead_magnet_data=? WHERE id=?`).run(updated, ref);
  } else {
    db.prepare(`UPDATE registrations SET lead_magnet_data=? WHERE email=? AND typ='bewertung' ORDER BY id DESC LIMIT 1`).run(updated, email);
  }
}
```

- [ ] **Step 4: Update Joachim's notification email to show new fields**

Find the Joachim email template in `bewertung.ts` (lines ~134–157). Add two rows to the table:

After the `${r.pain_freitext ? ... : ''}` line, add:
```typescript
${r.situation ? `<tr><td style="padding:6px;font-weight:600">Situation</td><td style="padding:6px">${JSON.parse(r.situation as string || '[]').join(', ')}</td></tr>` : ''}
${r.energieausweis_base64 ? `<tr><td style="padding:6px;font-weight:600">Energieausweis</td><td style="padding:6px">✓ Hochgeladen</td></tr>` : ''}
```

Wait — `situation` is stored in `lead_magnet_data` not a separate column. Read the row after the update to get the merged data. The notification already reads `row` after update. So we need to read `lead_magnet_data` from the row and parse the `situation` field out of it:

Replace the `situation` row in the email template with:
```typescript
${(() => {
  try {
    const lmd = r.lead_magnet_data ? JSON.parse(r.lead_magnet_data as string) : {};
    return lmd.situation?.length > 0 ? `<tr><td style="padding:6px;font-weight:600">Situation</td><td style="padding:6px">${lmd.situation.join(', ')}</td></tr>` : '';
  } catch { return ''; }
})()}
${r.energieausweis_base64 ? `<tr><td style="padding:6px;font-weight:600">Energieausweis</td><td style="padding:6px">✓ Hochgeladen (Base64)</td></tr>` : ''}
```

- [ ] **Step 5: Verify build**

```bash
cd /Users/stefan/code/wkdi-temp/website && npm run build 2>&1 | tail -20
```

- [ ] **Step 6: Commit**

```bash
git add src/pages/api/bewertung.ts
git commit -m "feat(api): accept situation + energieausweis_base64 in PATCH /api/bewertung"
```

---

## Task 3: Quiz HTML — Replace `#step-erstbewertung`

**Files:**
- Modify: `src/pages/unterlagen.astro`

The current `#step-erstbewertung` div runs from line ~38 to line ~154. Replace the entire block with 8 new divs (7 quiz steps + 1 summary). Each uses the existing `.wiz-step.hidden` class pattern.

Also add a new `#quiz-progress-bar` element (separate from the upload wizard's `#wiz-progress-block`).

- [ ] **Step 1: Add quiz progress header block**

After line 26 (after `</div><!-- /wiz-progress-block -->`), add:

```html
<!-- QUIZ PROGRESS (only shown in quiz mode) -->
<div id="quiz-progress" class="quiz-progress hidden">
  <div class="quiz-progress__dots" id="quiz-dots">
    <span class="quiz-dot quiz-dot--active" data-qstep="1"></span>
    <span class="quiz-dot" data-qstep="2"></span>
    <span class="quiz-dot" data-qstep="3"></span>
    <span class="quiz-dot" data-qstep="4"></span>
    <span class="quiz-dot" data-qstep="5"></span>
    <span class="quiz-dot" data-qstep="6"></span>
    <span class="quiz-dot" data-qstep="7"></span>
  </div>
  <div class="quiz-progress__label">
    <span id="quiz-step-label">Schritt 1 von 7</span>
    <span class="quiz-time">⏱ Noch ca. 2 Minuten</span>
  </div>
</div>
```

- [ ] **Step 2: Replace `#step-erstbewertung` with quiz step 1 — Situation**

Delete the entire `<div class="wiz-step hidden" id="step-erstbewertung">` block (lines ~38–154).

Replace with:

```html
<!-- ═══════════════════════════════════════
     QUIZ SCHRITT 1 — SITUATION (optional)
════════════════════════════════════════ -->
<div class="wiz-step hidden" id="quiz-step-1">
  <div class="wiz-intro">
    <h1>Damit wir gezielter helfen können —<br /><span class="text-accent">Was beschreibt Ihre Situation?</span></h1>
    <p class="wiz-intro__sub">Mehrere Antworten möglich. Kein Pflichtfeld.</p>
  </div>
  <div class="wiz-card">
    <div class="quiz-tile-grid quiz-tile-grid--2col" id="situation-tiles">
      <button type="button" class="quiz-tile" data-value="Erbengemeinschaft">
        <span class="quiz-tile__icon">🏚</span>
        <span class="quiz-tile__label">Erbengemeinschaft</span>
        <span class="quiz-tile__desc">Gemeinsam mit anderen Erben, noch keine Einigung</span>
      </button>
      <button type="button" class="quiz-tile" data-value="Messie-Objekt">
        <span class="quiz-tile__icon">🧹</span>
        <span class="quiz-tile__label">Messie-Objekt</span>
        <span class="quiz-tile__desc">Starke Verschmutzung oder schwieriger Zustand</span>
      </button>
      <button type="button" class="quiz-tile" data-value="GEG / Energetischer Sanierungsstau">
        <span class="quiz-tile__icon">⚡</span>
        <span class="quiz-tile__label">GEG / Energetischer Sanierungsstau</span>
        <span class="quiz-tile__desc">Hohe Energiekosten, Sanierungspflicht</span>
      </button>
      <button type="button" class="quiz-tile" data-value="Insolvenzverfahren">
        <span class="quiz-tile__icon">⚖️</span>
        <span class="quiz-tile__label">Insolvenzverfahren</span>
        <span class="quiz-tile__desc">Zwangssituation, Zeitdruck</span>
      </button>
      <button type="button" class="quiz-tile" data-value="Kapitalanleger mit Renovierungsdruck">
        <span class="quiz-tile__icon">🏗</span>
        <span class="quiz-tile__label">Kapitalanleger mit Renovierungsdruck</span>
        <span class="quiz-tile__desc">Vermietetes Objekt, Renovierungsstau</span>
      </button>
      <button type="button" class="quiz-tile" data-value="Scheidung / Trennung">
        <span class="quiz-tile__icon">💔</span>
        <span class="quiz-tile__label">Scheidung / Trennung</span>
        <span class="quiz-tile__desc">Gemeinsames Eigentum muss aufgeteilt werden</span>
      </button>
      <button type="button" class="quiz-tile" data-value="Beruflicher Umzug / Zeitdruck">
        <span class="quiz-tile__icon">📦</span>
        <span class="quiz-tile__label">Beruflicher Umzug / Zeitdruck</span>
        <span class="quiz-tile__desc">Schneller Verkauf nötig</span>
      </button>
      <button type="button" class="quiz-tile quiz-tile--other" data-value="__andere__">
        <span class="quiz-tile__icon">✏️</span>
        <span class="quiz-tile__label">Meine Situation ist anders...</span>
      </button>
    </div>
    <textarea id="situation-freitext" class="quiz-freitext hidden" rows="2"
      placeholder="Beschreiben Sie kurz Ihre Situation..."></textarea>
    <div class="quiz-actions">
      <button type="button" class="btn-quiz-skip" id="quiz-1-skip">Überspringen →</button>
      <button type="button" class="btn btn-primary" id="quiz-1-next">Weiter →</button>
    </div>
  </div>
</div>

<!-- ═══════════════════════════════════════
     QUIZ SCHRITT 2 — BAUJAHR
════════════════════════════════════════ -->
<div class="wiz-step hidden" id="quiz-step-2">
  <div class="wiz-intro">
    <h1>Wann wurde die<br /><span class="text-accent">Immobilie gebaut?</span></h1>
  </div>
  <div class="wiz-card">
    <div class="quiz-year-input">
      <label for="q-baujahr" id="q-baujahr-label" class="quiz-year-label">Baujahr</label>
      <input type="number" id="q-baujahr" class="quiz-year-field" placeholder="z.B. 1987" min="1850" max="2026" />
    </div>
    <div class="quiz-checkbox-group">
      <label class="quiz-checkbox-label">
        <input type="checkbox" id="q-baujahr-unsicher" />
        <span>Ungefähre Angabe — bin nicht ganz sicher</span>
      </label>
      <label class="quiz-checkbox-label">
        <input type="checkbox" id="q-baujahr-weissnicht" />
        <span>Weiß nicht</span>
      </label>
    </div>
    <p class="quiz-hint">Das Baujahr steht im Kaufvertrag, auf dem Energieausweis oder in der Bauakte. Joachim kann auch mit einer Schätzung gut arbeiten.</p>
    <div class="quiz-actions">
      <button type="button" class="btn-quiz-back" data-qtarget="1">← Zurück</button>
      <div class="quiz-actions__right">
        <button type="button" class="btn-quiz-skip" id="quiz-2-skip">Überspringen →</button>
        <button type="button" class="btn btn-primary" id="quiz-2-next">Weiter →</button>
      </div>
    </div>
  </div>
</div>

<!-- ═══════════════════════════════════════
     QUIZ SCHRITT 3 — WOHNFLÄCHE
════════════════════════════════════════ -->
<div class="wiz-step hidden" id="quiz-step-3">
  <div class="wiz-intro">
    <h1>Wie groß ist die<br /><span class="text-accent">Wohnfläche?</span></h1>
  </div>
  <div class="wiz-card">
    <div class="quiz-year-input">
      <label for="q-wohnflaeche" class="quiz-year-label">Wohnfläche in m²</label>
      <div class="quiz-number-row">
        <button type="button" class="quiz-stepper-btn" id="wf-minus">−</button>
        <input type="number" id="q-wohnflaeche" class="quiz-year-field quiz-year-field--center" placeholder="z.B. 82" min="10" max="2000" />
        <button type="button" class="quiz-stepper-btn" id="wf-plus">+</button>
      </div>
    </div>
    <p class="quiz-hint">Keller, Garage und Abstellräume zählen normalerweise nicht dazu. Die Zahl steht im Kaufvertrag oder Grundriss. Eine Schätzung reicht.</p>
    <div class="quiz-actions">
      <button type="button" class="btn-quiz-back" data-qtarget="2">← Zurück</button>
      <div class="quiz-actions__right">
        <button type="button" class="btn-quiz-skip" id="quiz-3-skip">Überspringen →</button>
        <button type="button" class="btn btn-primary" id="quiz-3-next">Weiter →</button>
      </div>
    </div>
  </div>
</div>

<!-- ═══════════════════════════════════════
     QUIZ SCHRITT 4 — ENERGIEKLASSE
════════════════════════════════════════ -->
<div class="wiz-step hidden" id="quiz-step-4">
  <div class="wiz-intro">
    <h1>Welche Energieklasse hat<br /><span class="text-accent">die Immobilie?</span></h1>
  </div>
  <div class="wiz-card">
    <div class="quiz-tile-grid quiz-tile-grid--3col quiz-tile-grid--energy" id="energy-tiles">
      <button type="button" class="quiz-tile quiz-tile--energy" data-value="A+">A+</button>
      <button type="button" class="quiz-tile quiz-tile--energy" data-value="A">A</button>
      <button type="button" class="quiz-tile quiz-tile--energy" data-value="B">B</button>
      <button type="button" class="quiz-tile quiz-tile--energy" data-value="C">C</button>
      <button type="button" class="quiz-tile quiz-tile--energy" data-value="D">D</button>
      <button type="button" class="quiz-tile quiz-tile--energy" data-value="E">E</button>
      <button type="button" class="quiz-tile quiz-tile--energy" data-value="F">F</button>
      <button type="button" class="quiz-tile quiz-tile--energy" data-value="G">G</button>
      <button type="button" class="quiz-tile quiz-tile--energy" data-value="H">H</button>
    </div>
    <div class="quiz-tile-grid quiz-tile-grid--1col" style="margin-top:8px">
      <button type="button" class="quiz-tile quiz-tile--weissnicht" data-value="__weissnicht__" id="energy-weissnicht">
        Weiß nicht / Kein Ausweis vorhanden
      </button>
    </div>
    <p class="quiz-hint">Die Energieklasse steht auf dem Energieausweis (oben rechts, oft als farbige Skala).</p>
    <div class="quiz-upload-optional">
      <label for="q-energieausweis" class="quiz-upload-label-btn">
        📎 Energieausweis hochladen (optional)
        <input type="file" id="q-energieausweis" accept=".pdf,image/*" class="quiz-file-hidden" />
      </label>
      <span id="q-energieausweis-name" class="quiz-upload-filename"></span>
    </div>
    <div class="quiz-actions">
      <button type="button" class="btn-quiz-back" data-qtarget="3">← Zurück</button>
      <div class="quiz-actions__right">
        <button type="button" class="btn-quiz-skip" id="quiz-4-skip">Überspringen →</button>
        <button type="button" class="btn btn-primary" id="quiz-4-next">Weiter →</button>
      </div>
    </div>
  </div>
</div>

<!-- ═══════════════════════════════════════
     QUIZ SCHRITT 5 — ZUSTAND
════════════════════════════════════════ -->
<div class="wiz-step hidden" id="quiz-step-5">
  <div class="wiz-intro">
    <h1>Wie würden Sie den<br /><span class="text-accent">Zustand beschreiben?</span></h1>
  </div>
  <div class="wiz-card">
    <div class="quiz-tile-grid quiz-tile-grid--1col quiz-tile-grid--zustand" id="zustand-tiles">
      <button type="button" class="quiz-tile quiz-tile--zustand" data-value="sanierungsbeduerftig">
        <span class="quiz-tile__icon">🔧</span>
        <div>
          <span class="quiz-tile__label">Sanierungsbedürftig</span>
          <span class="quiz-tile__desc">Größere Mängel, letzte Renovierung vor über 20 Jahren oder gar nicht</span>
        </div>
      </button>
      <button type="button" class="quiz-tile quiz-tile--zustand" data-value="renovierungsbeduerftig">
        <span class="quiz-tile__icon">🪣</span>
        <div>
          <span class="quiz-tile__label">Renovierungsbedürftig</span>
          <span class="quiz-tile__desc">Funktionsfähig, aber Bad, Küche oder Böden sind veraltet</span>
        </div>
      </button>
      <button type="button" class="quiz-tile quiz-tile--zustand" data-value="gepflegt">
        <span class="quiz-tile__icon">🏠</span>
        <div>
          <span class="quiz-tile__label">Gepflegt</span>
          <span class="quiz-tile__desc">Regelmäßig instand gehalten, bewohnbar ohne große Maßnahmen</span>
        </div>
      </button>
      <button type="button" class="quiz-tile quiz-tile--zustand" data-value="modernisiert">
        <span class="quiz-tile__icon">✨</span>
        <div>
          <span class="quiz-tile__label">Modernisiert</span>
          <span class="quiz-tile__desc">Küche, Bad oder Heizung wurden in den letzten Jahren erneuert</span>
        </div>
      </button>
      <button type="button" class="quiz-tile quiz-tile--zustand" data-value="neuwertig">
        <span class="quiz-tile__icon">🌟</span>
        <div>
          <span class="quiz-tile__label">Neuwertig</span>
          <span class="quiz-tile__desc">Neubau oder vollständig saniert, keine Mängel erkennbar</span>
        </div>
      </button>
    </div>
    <div class="quiz-actions">
      <button type="button" class="btn-quiz-back" data-qtarget="4">← Zurück</button>
      <div class="quiz-actions__right">
        <button type="button" class="btn-quiz-skip" id="quiz-5-skip">Überspringen →</button>
        <button type="button" class="btn btn-primary" id="quiz-5-next">Weiter →</button>
      </div>
    </div>
  </div>
</div>

<!-- ═══════════════════════════════════════
     QUIZ SCHRITT 6 — SANIERUNGSSTAND
════════════════════════════════════════ -->
<div class="wiz-step hidden" id="quiz-step-6">
  <div class="wiz-intro">
    <h1>Was wurde in den letzten<br /><span class="text-accent">15 Jahren erneuert?</span></h1>
    <p class="wiz-intro__sub">Mehrere Antworten möglich.</p>
  </div>
  <div class="wiz-card">
    <div class="quiz-tile-grid quiz-tile-grid--2col" id="sanierung-tiles">
      <button type="button" class="quiz-tile" data-value="Fenster">🪟 Fenster</button>
      <button type="button" class="quiz-tile" data-value="Heizungsanlage">🔥 Heizungsanlage</button>
      <button type="button" class="quiz-tile" data-value="Dach">🏠 Dach</button>
      <button type="button" class="quiz-tile" data-value="Bad / Sanitär">🚿 Bad / Sanitär</button>
      <button type="button" class="quiz-tile" data-value="Fassade / Dämmung">🧱 Fassade / Dämmung</button>
      <button type="button" class="quiz-tile" data-value="Elektrik">⚡ Elektrik</button>
      <button type="button" class="quiz-tile" data-value="Böden / Innenausbau">🪵 Böden / Innenausbau</button>
      <button type="button" class="quiz-tile" data-value="Küche">🍳 Küche</button>
      <button type="button" class="quiz-tile quiz-tile--exclusive" data-value="__nichts__">Nichts davon</button>
      <button type="button" class="quiz-tile quiz-tile--exclusive" data-value="__weissnicht__">Weiß nicht</button>
    </div>
    <p class="quiz-hint">Jede Maßnahme kann den Wert Ihrer Immobilie erhöhen. Grobe Angaben reichen.</p>
    <div class="quiz-actions">
      <button type="button" class="btn-quiz-back" data-qtarget="5">← Zurück</button>
      <div class="quiz-actions__right">
        <button type="button" class="btn-quiz-skip" id="quiz-6-skip">Überspringen →</button>
        <button type="button" class="btn btn-primary" id="quiz-6-next">Weiter →</button>
      </div>
    </div>
  </div>
</div>

<!-- ═══════════════════════════════════════
     QUIZ SCHRITT 7 — EXTRAS
════════════════════════════════════════ -->
<div class="wiz-step hidden" id="quiz-step-7">
  <div class="wiz-intro">
    <h1>Noch etwas<br /><span class="text-accent">Wichtiges?</span></h1>
    <p class="wiz-intro__sub">Alles freiwillig — was Sie wissen, hilft Joachim.</p>
  </div>
  <div class="wiz-card">
    <div class="quiz-extras-checkboxes">
      <label class="quiz-checkbox-label"><input type="checkbox" id="q-stellplatz" /> Stellplatz / Garage vorhanden</label>
      <label class="quiz-checkbox-label"><input type="checkbox" id="q-vermietet" /> Aktuell vermietet</label>
      <label class="quiz-checkbox-label"><input type="checkbox" id="q-denkmalschutz" /> Denkmalschutz</label>
      <label class="quiz-checkbox-label"><input type="checkbox" id="q-aufzug" /> Aufzug im Gebäude (bei ETW)</label>
    </div>
    <div class="form-group" style="margin-top:16px">
      <label for="q-etage">Etage (bei ETW)</label>
      <input type="text" id="q-etage" placeholder="z.B. 3. OG / Erdgeschoss" />
    </div>
    <div class="form-group">
      <label for="q-heizung-baujahr">Heizung Baujahr</label>
      <input type="number" id="q-heizung-baujahr" placeholder="z.B. 2008" min="1950" max="2026" />
    </div>
    <div class="form-group">
      <label for="q-besonderheit">Besonderheiten</label>
      <textarea id="q-besonderheit" rows="2" placeholder="z.B. Dachterrasse, Erbbaurecht, Erstbezug nach Sanierung..."></textarea>
    </div>
    <div class="form-group quiz-pain-group">
      <label for="q-pain">Was ist aktuell das größte Problem für Sie?</label>
      <textarea id="q-pain" rows="3" placeholder="Joachim liest das persönlich vor dem Anruf..."></textarea>
      <p class="quiz-hint">Joachim liest Ihre Nachricht persönlich vor dem Rückruf.</p>
    </div>
    <div class="quiz-actions">
      <button type="button" class="btn-quiz-back" data-qtarget="6">← Zurück</button>
      <div class="quiz-actions__right">
        <button type="button" class="btn-quiz-skip" id="quiz-7-skip">Überspringen →</button>
        <button type="button" class="btn btn-primary" id="quiz-7-next">Weiter zur Zusammenfassung →</button>
      </div>
    </div>
  </div>
</div>

<!-- ═══════════════════════════════════════
     QUIZ ZUSAMMENFASSUNG
════════════════════════════════════════ -->
<div class="wiz-step hidden" id="quiz-summary">
  <div class="wiz-intro">
    <h1>Alles<br /><span class="text-accent">auf einen Blick.</span></h1>
    <p class="wiz-intro__sub">Stimmt alles? Dann erstellen wir Ihre Preisindikation.</p>
  </div>
  <div class="wiz-card">
    <ul class="quiz-summary-list" id="quiz-summary-list"></ul>
    <button type="button" class="btn btn-primary" id="quiz-submit-btn" style="width:100%;margin-top:24px">
      Preisindikation erstellen →
    </button>
    <div id="quiz-success" class="hidden" style="text-align:center;padding:48px 24px;">
      <p style="font-size:32px;margin-bottom:16px">✓</p>
      <h3>Danke! Ihre Preisindikation wird erstellt.</h3>
      <p style="color:#64748b;margin-top:8px">Sie bekommen Ihr persönliches PDF in Kürze per E-Mail. Joachim ruft Sie in den nächsten 48 Stunden zurück.</p>
    </div>
  </div>
</div>
```

- [ ] **Step 3: Verify build compiles**

```bash
cd /Users/stefan/code/wkdi-temp/website && npm run build 2>&1 | tail -20
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/pages/unterlagen.astro
git commit -m "feat(quiz): add 7-step quiz HTML to unterlagen.astro"
```

---

## Task 4: Quiz CSS

**Files:**
- Modify: `src/pages/unterlagen.astro` (in the `<style>` block, append after the existing styles)

- [ ] **Step 1: Add quiz styles at the end of the `<style>` block**

Find the closing `</style>` tag and insert before it:

```css
/* ═══════════════════════════════════════
   QUIZ STYLES
════════════════════════════════════════ */

/* Progress bar */
.quiz-progress {
  max-width: var(--container-narrow);
  margin: 0 auto var(--space-6);
  padding: 0 var(--space-4);
}
.quiz-progress__dots {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-2);
}
.quiz-dot {
  width: 10px;
  height: 10px;
  border-radius: var(--radius-full);
  background: var(--color-border);
  transition: background var(--duration-fast);
  flex-shrink: 0;
}
.quiz-dot--active { background: var(--color-accent); }
.quiz-dot--done { background: var(--color-success); }
.quiz-progress__label {
  display: flex;
  justify-content: space-between;
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}
.quiz-time { font-size: var(--text-xs); color: var(--color-text-muted); }

/* Tile grid */
.quiz-tile-grid {
  display: grid;
  gap: var(--space-3);
  margin-bottom: var(--space-5);
}
.quiz-tile-grid--2col { grid-template-columns: 1fr 1fr; }
.quiz-tile-grid--3col { grid-template-columns: 1fr 1fr 1fr; }
.quiz-tile-grid--1col { grid-template-columns: 1fr; }
@media (max-width: 480px) {
  .quiz-tile-grid--3col { grid-template-columns: 1fr 1fr; }
}

/* Tiles */
.quiz-tile {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-1);
  padding: var(--space-3) var(--space-4);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg-card);
  cursor: pointer;
  text-align: left;
  font-family: var(--font-family);
  font-size: var(--text-sm);
  transition: all var(--duration-fast);
  line-height: var(--leading-tight);
}
.quiz-tile:hover { border-color: var(--color-accent); background: var(--color-accent-light); }
.quiz-tile--selected { border-color: var(--color-accent); background: var(--color-accent-light); }
.quiz-tile__icon { font-size: 20px; line-height: 1; }
.quiz-tile__label { font-weight: var(--weight-semibold); color: var(--color-text); }
.quiz-tile__desc { font-size: var(--text-xs); color: var(--color-text-muted); margin-top: 2px; }

/* Energy tiles (compact, centered) */
.quiz-tile--energy {
  align-items: center;
  justify-content: center;
  font-size: var(--text-xl);
  font-weight: var(--weight-bold);
  padding: var(--space-4);
  min-height: 64px;
}

/* Zustand tiles (horizontal: icon + text) */
.quiz-tile--zustand {
  flex-direction: row;
  align-items: flex-start;
  gap: var(--space-3);
}
.quiz-tile--zustand .quiz-tile__icon { font-size: 24px; flex-shrink: 0; }

/* Exclusive tiles (Nichts davon, Weiß nicht) */
.quiz-tile--exclusive { color: var(--color-text-muted); font-style: italic; }
.quiz-tile--weissnicht {
  grid-column: 1 / -1;
  text-align: center;
  align-items: center;
  color: var(--color-text-muted);
  font-size: var(--text-sm);
}

/* Year input */
.quiz-year-input { margin-bottom: var(--space-4); }
.quiz-year-label { display: block; font-weight: var(--weight-semibold); margin-bottom: var(--space-2); font-size: var(--text-sm); color: var(--color-text); }
.quiz-year-field {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  border: 2px solid var(--color-border-strong);
  border-radius: var(--radius-md);
  font-family: var(--font-family);
  font-size: var(--text-2xl);
  font-weight: var(--weight-bold);
  text-align: left;
  background: var(--color-bg-card);
  color: var(--color-text);
  transition: border-color var(--duration-fast);
  -moz-appearance: textfield;
}
.quiz-year-field::-webkit-inner-spin-button,
.quiz-year-field::-webkit-outer-spin-button { -webkit-appearance: none; }
.quiz-year-field:focus { outline: none; border-color: var(--color-accent); }
.quiz-year-field--center { text-align: center; }

/* Number row with stepper buttons */
.quiz-number-row {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}
.quiz-number-row .quiz-year-field { flex: 1; }
.quiz-stepper-btn {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  border: 2px solid var(--color-border-strong);
  background: var(--color-bg-card);
  font-size: var(--text-2xl);
  font-weight: var(--weight-bold);
  cursor: pointer;
  color: var(--color-text);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all var(--duration-fast);
}
.quiz-stepper-btn:hover { background: var(--color-accent); color: white; border-color: var(--color-accent); }

/* Checkbox group */
.quiz-checkbox-group { display: flex; flex-direction: column; gap: var(--space-2); margin-bottom: var(--space-4); }
.quiz-checkbox-label { display: flex; align-items: center; gap: var(--space-2); font-size: var(--text-sm); cursor: pointer; }
.quiz-checkbox-label input { width: 16px; height: 16px; cursor: pointer; flex-shrink: 0; }

/* Extras checkboxes */
.quiz-extras-checkboxes { display: flex; flex-direction: column; gap: var(--space-3); margin-bottom: var(--space-5); }

/* Hint text */
.quiz-hint {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  line-height: var(--leading-relaxed);
  margin: calc(-1 * var(--space-3)) 0 var(--space-5);
}

/* Freitext for Situation "other" */
.quiz-freitext {
  width: 100%;
  padding: var(--space-3);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-sm);
  font-family: var(--font-family);
  font-size: var(--text-sm);
  resize: vertical;
  background: var(--color-bg-card);
  margin-bottom: var(--space-4);
}

/* Upload */
.quiz-upload-optional { margin-bottom: var(--space-5); }
.quiz-upload-label-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-sm);
  color: var(--color-accent);
  cursor: pointer;
  border: 1px dashed var(--color-accent);
  border-radius: var(--radius-sm);
  padding: var(--space-2) var(--space-3);
  transition: background var(--duration-fast);
}
.quiz-upload-label-btn:hover { background: var(--color-accent-light); }
.quiz-file-hidden { display: none; }
.quiz-upload-filename { font-size: var(--text-xs); color: var(--color-success); margin-left: var(--space-2); }

/* Quiz actions */
.quiz-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  margin-top: var(--space-6);
  flex-wrap: wrap;
}
.quiz-actions__right { display: flex; align-items: center; gap: var(--space-3); }
.btn-quiz-back {
  background: none;
  border: none;
  color: var(--color-text-muted);
  font-size: var(--text-sm);
  cursor: pointer;
  padding: var(--space-2) var(--space-3);
  font-family: var(--font-family);
}
.btn-quiz-back:hover { color: var(--color-text); }
.btn-quiz-skip {
  background: none;
  border: none;
  color: var(--color-text-muted);
  font-size: var(--text-sm);
  cursor: pointer;
  padding: var(--space-2) var(--space-3);
  font-family: var(--font-family);
  text-decoration: underline;
  text-decoration-style: dotted;
}
.btn-quiz-skip:hover { color: var(--color-text); }

/* Summary */
.quiz-summary-list { list-style: none; display: flex; flex-direction: column; gap: var(--space-2); margin-bottom: var(--space-4); }
.quiz-summary-item {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-sm);
  background: var(--color-bg-alt);
  font-size: var(--text-sm);
}
.quiz-summary-item__label { font-weight: var(--weight-semibold); color: var(--color-text-muted); font-size: var(--text-xs); }
.quiz-summary-item__value { color: var(--color-text); font-weight: var(--weight-medium); }
.quiz-summary-item--skipped .quiz-summary-item__value { color: var(--color-text-muted); font-style: italic; }
.btn-quiz-edit {
  background: none;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 2px var(--space-2);
  font-size: var(--text-xs);
  cursor: pointer;
  color: var(--color-text-muted);
  font-family: var(--font-family);
  flex-shrink: 0;
}
.btn-quiz-edit:hover { color: var(--color-accent); border-color: var(--color-accent); }

/* Pain group prominent */
.quiz-pain-group { border-top: 1px solid var(--color-border); padding-top: var(--space-4); margin-top: var(--space-2); }
.quiz-pain-group label { font-weight: var(--weight-semibold); font-size: var(--text-base); }
```

- [ ] **Step 2: Verify build**

```bash
cd /Users/stefan/code/wkdi-temp/website && npm run build 2>&1 | tail -20
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/unterlagen.astro
git commit -m "feat(quiz): add quiz CSS styles to unterlagen.astro"
```

---

## Task 5: Quiz JavaScript

**Files:**
- Modify: `src/pages/unterlagen.astro` (in the `<script>` block)

This is the most complex task. Find the existing `<script>` block and locate the `initSession()` function.

- [ ] **Step 1: Add `quizState` object and quiz navigation function**

After the `state` object declaration (around the top of the `<script>` block, after `const state = {...}`), add:

```typescript
// ── QUIZ STATE ──
const quizState = {
  situation: [] as string[],
  situationFreitext: '',
  baujahr: null as number | null,
  baujahr_unsicher: false,
  wohnflaeche: null as number | null,
  energieklasse: null as string | null,
  energieausweis_b64: null as string | null,
  zustand: null as string | null,
  was_saniert: [] as string[],
  extras: {
    stellplatz: false,
    vermietet: false,
    denkmalschutz: false,
    aufzug: false,
    etage: '',
    heizung_baujahr: null as number | null,
    besonderheit: '',
    pain_freitext: '',
  },
  returnToSummary: false,
};

let currentQuizStep = 1;

function goToQuizStep(n: number | 'summary') {
  // Hide all quiz steps
  document.querySelectorAll('[id^="quiz-step-"], #quiz-summary').forEach(el => el.classList.add('hidden'));

  if (n === 'summary') {
    renderQuizSummary();
    document.getElementById('quiz-summary')?.classList.remove('hidden');
    // Hide progress dots on summary
    document.getElementById('quiz-progress')?.classList.add('hidden');
  } else {
    document.getElementById('quiz-step-' + n)?.classList.remove('hidden');
    currentQuizStep = n;
    updateQuizProgress(n);
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateQuizProgress(step: number) {
  const dots = document.querySelectorAll('.quiz-dot');
  dots.forEach((dot, i) => {
    dot.classList.remove('quiz-dot--active', 'quiz-dot--done');
    if (i + 1 < step) dot.classList.add('quiz-dot--done');
    else if (i + 1 === step) dot.classList.add('quiz-dot--active');
  });
  const label = document.getElementById('quiz-step-label');
  if (label) label.textContent = `Schritt ${step} von 7`;
}
```

- [ ] **Step 2: Update `initSession()` to show quiz instead of `#step-erstbewertung`**

Find this block in `initSession()`:
```typescript
// Erstbewertung-Schritt anzeigen, alles andere ausblenden
document.querySelectorAll('.wiz-step').forEach(el => el.classList.add('hidden'));
document.getElementById('step-erstbewertung')?.classList.remove('hidden');
return; // nicht weiter initialisieren
```

Replace with:
```typescript
// Quiz-Modus: 7-Schritt Quiz anzeigen
document.querySelectorAll('.wiz-step').forEach(el => el.classList.add('hidden'));
document.getElementById('quiz-progress')?.classList.remove('hidden');
goToQuizStep(1);
return; // nicht weiter initialisieren
```

- [ ] **Step 3: Add Schritt 1 (Situation) tile interaction**

After the `initSession()` function, add:

```typescript
// ── QUIZ SCHRITT 1 — SITUATION ──
document.querySelectorAll('#situation-tiles .quiz-tile').forEach(tile => {
  tile.addEventListener('click', () => {
    const val = (tile as HTMLElement).dataset.value!;
    if (val === '__andere__') {
      tile.classList.toggle('quiz-tile--selected');
      const freitext = document.getElementById('situation-freitext');
      if (freitext) freitext.classList.toggle('hidden', !tile.classList.contains('quiz-tile--selected'));
    } else {
      tile.classList.toggle('quiz-tile--selected');
    }
    // Update state
    quizState.situation = Array.from(document.querySelectorAll('#situation-tiles .quiz-tile--selected'))
      .map(t => (t as HTMLElement).dataset.value!)
      .filter(v => v !== '__andere__');
    if (document.querySelector('#situation-tiles [data-value="__andere__"]')?.classList.contains('quiz-tile--selected')) {
      quizState.situationFreitext = (document.getElementById('situation-freitext') as HTMLTextAreaElement)?.value || '';
    }
  });
});

document.getElementById('situation-freitext')?.addEventListener('input', (e) => {
  quizState.situationFreitext = (e.target as HTMLTextAreaElement).value;
});

document.getElementById('quiz-1-next')?.addEventListener('click', () => {
  goToQuizStep(quizState.returnToSummary ? 'summary' : 2);
  quizState.returnToSummary = false;
});
document.getElementById('quiz-1-skip')?.addEventListener('click', () => {
  quizState.situation = [];
  goToQuizStep(quizState.returnToSummary ? 'summary' : 2);
  quizState.returnToSummary = false;
});
```

- [ ] **Step 4: Add Schritt 2 (Baujahr) interaction**

```typescript
// ── QUIZ SCHRITT 2 — BAUJAHR ──
const baujahrInput = document.getElementById('q-baujahr') as HTMLInputElement;
const baujahrUnsicher = document.getElementById('q-baujahr-unsicher') as HTMLInputElement;
const baujahrWeissnicht = document.getElementById('q-baujahr-weissnicht') as HTMLInputElement;
const baujahrLabel = document.getElementById('q-baujahr-label') as HTMLLabelElement;

baujahrUnsicher?.addEventListener('change', () => {
  if (baujahrUnsicher.checked) {
    baujahrWeissnicht.checked = false;
    baujahrInput.disabled = false;
    baujahrLabel.textContent = 'Ungefähres Baujahr';
    quizState.baujahr_unsicher = true;
  } else {
    baujahrLabel.textContent = 'Baujahr';
    quizState.baujahr_unsicher = false;
  }
});

baujahrWeissnicht?.addEventListener('change', () => {
  if (baujahrWeissnicht.checked) {
    baujahrUnsicher.checked = false;
    baujahrInput.value = '';
    baujahrInput.disabled = true;
    quizState.baujahr = null;
    quizState.baujahr_unsicher = false;
    baujahrLabel.textContent = 'Baujahr';
  } else {
    baujahrInput.disabled = false;
  }
});

baujahrInput?.addEventListener('input', () => {
  quizState.baujahr = Number(baujahrInput.value) || null;
});

document.getElementById('quiz-2-next')?.addEventListener('click', () => {
  quizState.baujahr = Number(baujahrInput?.value) || null;
  goToQuizStep(quizState.returnToSummary ? 'summary' : 3);
  quizState.returnToSummary = false;
});
document.getElementById('quiz-2-skip')?.addEventListener('click', () => {
  quizState.baujahr = null;
  goToQuizStep(quizState.returnToSummary ? 'summary' : 3);
  quizState.returnToSummary = false;
});
```

- [ ] **Step 5: Add Schritt 3 (Wohnfläche) interaction**

```typescript
// ── QUIZ SCHRITT 3 — WOHNFLÄCHE ──
const wfInput = document.getElementById('q-wohnflaeche') as HTMLInputElement;

document.getElementById('wf-minus')?.addEventListener('click', () => {
  const cur = Number(wfInput.value) || 0;
  wfInput.value = String(Math.max(10, cur - 5));
});
document.getElementById('wf-plus')?.addEventListener('click', () => {
  const cur = Number(wfInput.value) || 0;
  wfInput.value = String(Math.min(2000, cur + 5));
});

document.getElementById('quiz-3-next')?.addEventListener('click', () => {
  quizState.wohnflaeche = Number(wfInput?.value) || null;
  goToQuizStep(quizState.returnToSummary ? 'summary' : 4);
  quizState.returnToSummary = false;
});
document.getElementById('quiz-3-skip')?.addEventListener('click', () => {
  quizState.wohnflaeche = null;
  goToQuizStep(quizState.returnToSummary ? 'summary' : 4);
  quizState.returnToSummary = false;
});
```

- [ ] **Step 6: Add Schritt 4 (Energieklasse) interaction**

```typescript
// ── QUIZ SCHRITT 4 — ENERGIEKLASSE ──
document.querySelectorAll('#energy-tiles .quiz-tile, #quiz-step-4 .quiz-tile--weissnicht').forEach(tile => {
  tile.addEventListener('click', () => {
    // Deselect all energy tiles
    document.querySelectorAll('#quiz-step-4 .quiz-tile').forEach(t => t.classList.remove('quiz-tile--selected'));
    tile.classList.add('quiz-tile--selected');
    const val = (tile as HTMLElement).dataset.value!;
    quizState.energieklasse = val === '__weissnicht__' ? null : val;
  });
});

// Energieausweis file upload → base64
const energieInput = document.getElementById('q-energieausweis') as HTMLInputElement;
energieInput?.addEventListener('change', async () => {
  const file = energieInput.files?.[0];
  if (!file) return;
  if (file.size > 8 * 1024 * 1024) {
    alert('Datei zu groß (max. 8 MB). Bitte komprimieren oder als JPG-Foto hochladen.');
    energieInput.value = '';
    return;
  }
  const nameEl = document.getElementById('q-energieausweis-name');
  if (nameEl) nameEl.textContent = `✓ ${file.name}`;
  quizState.energieausweis_b64 = await fileToBase64(file);
});

document.getElementById('quiz-4-next')?.addEventListener('click', () => {
  goToQuizStep(quizState.returnToSummary ? 'summary' : 5);
  quizState.returnToSummary = false;
});
document.getElementById('quiz-4-skip')?.addEventListener('click', () => {
  quizState.energieklasse = null;
  goToQuizStep(quizState.returnToSummary ? 'summary' : 5);
  quizState.returnToSummary = false;
});
```

- [ ] **Step 7: Add `fileToBase64` helper function**

Add this helper function near the top of the `<script>` block (after the `quizState` object):

```typescript
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = reject;
  });
}
```

- [ ] **Step 8: Add Schritt 5 (Zustand) interaction**

```typescript
// ── QUIZ SCHRITT 5 — ZUSTAND ──
document.querySelectorAll('#zustand-tiles .quiz-tile').forEach(tile => {
  tile.addEventListener('click', () => {
    document.querySelectorAll('#zustand-tiles .quiz-tile').forEach(t => t.classList.remove('quiz-tile--selected'));
    tile.classList.add('quiz-tile--selected');
    quizState.zustand = (tile as HTMLElement).dataset.value!;
  });
});

document.getElementById('quiz-5-next')?.addEventListener('click', () => {
  goToQuizStep(quizState.returnToSummary ? 'summary' : 6);
  quizState.returnToSummary = false;
});
document.getElementById('quiz-5-skip')?.addEventListener('click', () => {
  quizState.zustand = null;
  goToQuizStep(quizState.returnToSummary ? 'summary' : 6);
  quizState.returnToSummary = false;
});
```

- [ ] **Step 9: Add Schritt 6 (Sanierungsstand) interaction**

```typescript
// ── QUIZ SCHRITT 6 — SANIERUNGSSTAND ──
document.querySelectorAll('#sanierung-tiles .quiz-tile').forEach(tile => {
  tile.addEventListener('click', () => {
    const val = (tile as HTMLElement).dataset.value!;
    const isExclusive = tile.classList.contains('quiz-tile--exclusive');

    if (isExclusive) {
      // Deselect all, select only this
      document.querySelectorAll('#sanierung-tiles .quiz-tile').forEach(t => t.classList.remove('quiz-tile--selected'));
      tile.classList.add('quiz-tile--selected');
    } else {
      // Deselect exclusive tiles
      document.querySelectorAll('#sanierung-tiles .quiz-tile--exclusive').forEach(t => t.classList.remove('quiz-tile--selected'));
      tile.classList.toggle('quiz-tile--selected');
    }

    // Update state
    quizState.was_saniert = Array.from(document.querySelectorAll('#sanierung-tiles .quiz-tile--selected'))
      .map(t => (t as HTMLElement).dataset.value!)
      .filter(v => v !== '__nichts__' && v !== '__weissnicht__');

    // If exclusive selected → mark as empty/null
    const exclusiveSelected = document.querySelector('#sanierung-tiles .quiz-tile--exclusive.quiz-tile--selected');
    if (exclusiveSelected?.getAttribute('data-value') === '__nichts__') quizState.was_saniert = [];
  });
});

document.getElementById('quiz-6-next')?.addEventListener('click', () => {
  goToQuizStep(quizState.returnToSummary ? 'summary' : 7);
  quizState.returnToSummary = false;
});
document.getElementById('quiz-6-skip')?.addEventListener('click', () => {
  quizState.was_saniert = [];
  goToQuizStep(quizState.returnToSummary ? 'summary' : 7);
  quizState.returnToSummary = false;
});
```

- [ ] **Step 10: Add Schritt 7 (Extras) interaction**

```typescript
// ── QUIZ SCHRITT 7 — EXTRAS ──
document.getElementById('quiz-7-next')?.addEventListener('click', () => {
  quizState.extras.stellplatz = (document.getElementById('q-stellplatz') as HTMLInputElement)?.checked || false;
  quizState.extras.vermietet = (document.getElementById('q-vermietet') as HTMLInputElement)?.checked || false;
  quizState.extras.denkmalschutz = (document.getElementById('q-denkmalschutz') as HTMLInputElement)?.checked || false;
  quizState.extras.aufzug = (document.getElementById('q-aufzug') as HTMLInputElement)?.checked || false;
  quizState.extras.etage = (document.getElementById('q-etage') as HTMLInputElement)?.value || '';
  quizState.extras.heizung_baujahr = Number((document.getElementById('q-heizung-baujahr') as HTMLInputElement)?.value) || null;
  quizState.extras.besonderheit = (document.getElementById('q-besonderheit') as HTMLTextAreaElement)?.value || '';
  quizState.extras.pain_freitext = (document.getElementById('q-pain') as HTMLTextAreaElement)?.value || '';
  goToQuizStep('summary');
});
document.getElementById('quiz-7-skip')?.addEventListener('click', () => {
  goToQuizStep('summary');
});
```

- [ ] **Step 11: Add summary rendering + "Ändern" mechanism**

```typescript
// ── QUIZ ZUSAMMENFASSUNG ──
function renderQuizSummary() {
  const list = document.getElementById('quiz-summary-list');
  if (!list) return;

  const situationLabel = quizState.situation.length > 0
    ? quizState.situation.join(', ') + (quizState.situationFreitext ? ` · ${quizState.situationFreitext}` : '')
    : null;

  const baujahrLabel = quizState.baujahr
    ? `${quizState.baujahr}${quizState.baujahr_unsicher ? ' (ca.)' : ''}`
    : null;

  const items = [
    { step: 1, label: 'Situation', value: situationLabel },
    { step: 2, label: 'Baujahr', value: baujahrLabel },
    { step: 3, label: 'Wohnfläche', value: quizState.wohnflaeche ? `${quizState.wohnflaeche} m²` : null },
    { step: 4, label: 'Energieklasse', value: quizState.energieklasse ? `Klasse ${quizState.energieklasse}${quizState.energieausweis_b64 ? ' + Ausweis ✓' : ''}` : quizState.energieausweis_b64 ? 'Ausweis hochgeladen ✓' : null },
    { step: 5, label: 'Zustand', value: quizState.zustand },
    { step: 6, label: 'Sanierungsstand', value: quizState.was_saniert.length > 0 ? quizState.was_saniert.join(', ') : null },
    { step: 7, label: 'Extras', value: [
      quizState.extras.stellplatz ? 'Stellplatz' : '',
      quizState.extras.vermietet ? 'Vermietet' : '',
      quizState.extras.denkmalschutz ? 'Denkmalschutz' : '',
      quizState.extras.aufzug ? 'Aufzug' : '',
      quizState.extras.etage ? `Etage: ${quizState.extras.etage}` : '',
      quizState.extras.heizung_baujahr ? `Heizung: ${quizState.extras.heizung_baujahr}` : '',
      quizState.extras.besonderheit || '',
    ].filter(Boolean).join(', ') || null },
  ];

  list.innerHTML = items.map(item => `
    <li class="quiz-summary-item ${item.value ? '' : 'quiz-summary-item--skipped'}">
      <div>
        <div class="quiz-summary-item__label">${item.label}</div>
        <div class="quiz-summary-item__value">${item.value || 'Nicht angegeben'}</div>
      </div>
      <button type="button" class="btn-quiz-edit" data-edit-step="${item.step}">Ändern</button>
    </li>
  `).join('');

  // Bind "Ändern" buttons
  list.querySelectorAll('.btn-quiz-edit').forEach(btn => {
    btn.addEventListener('click', () => {
      const step = parseInt((btn as HTMLElement).dataset.editStep || '1');
      quizState.returnToSummary = true;
      document.getElementById('quiz-progress')?.classList.remove('hidden');
      goToQuizStep(step);
    });
  });
}

// ── QUIZ SUBMIT ──
document.getElementById('quiz-submit-btn')?.addEventListener('click', async () => {
  const btn = document.getElementById('quiz-submit-btn') as HTMLButtonElement;
  btn.textContent = 'Wird erstellt…';
  btn.disabled = true;

  const email = (document.getElementById('hidden-email') as HTMLInputElement)?.value;
  const ref = (document.getElementById('hidden-ref') as HTMLInputElement)?.value;

  // Build situation array: include freitext as special entry if present
  const situationToSend = [...quizState.situation];
  if (quizState.situationFreitext) situationToSend.push(`Andere: ${quizState.situationFreitext}`);

  const body: Record<string, unknown> = {
    ref: ref ? Number(ref) : undefined,
    email: ref ? undefined : email,
    baujahr: quizState.baujahr,
    wohnflaeche: quizState.wohnflaeche,
    energieklasse: quizState.energieklasse,
    energieausweis_base64: quizState.energieausweis_b64,
    zustand: quizState.zustand,
    was_saniert: quizState.was_saniert.length > 0 ? quizState.was_saniert : null,
    stellplatz: quizState.extras.stellplatz,
    vermietet: quizState.extras.vermietet,
    etage: quizState.extras.etage || null,
    heizung_baujahr: quizState.extras.heizung_baujahr,
    besonderheit: [
      quizState.extras.besonderheit,
      quizState.extras.denkmalschutz ? 'Denkmalschutz' : '',
      quizState.extras.aufzug ? 'Aufzug' : '',
    ].filter(Boolean).join(', ') || null,
    pain_freitext: quizState.extras.pain_freitext || null,
    situation: situationToSend.length > 0 ? situationToSend : null,
  };

  try {
    await fetch('/api/bewertung', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    btn.classList.add('hidden');
    document.getElementById('quiz-success')?.classList.remove('hidden');
  } catch {
    btn.textContent = 'Preisindikation erstellen →';
    btn.disabled = false;
  }
});
```

- [ ] **Step 12: Verify build**

```bash
cd /Users/stefan/code/wkdi-temp/website && npm run build 2>&1 | tail -20
```

Expected: `Build complete` with no errors.

- [ ] **Step 13: Commit**

```bash
git add src/pages/unterlagen.astro
git commit -m "feat(quiz): add quiz JS — navigation, state, tiles, submit"
```

---

## Task 6: End-to-End Test

- [ ] **Step 1: Start local dev server**

```bash
cd /Users/stefan/code/wkdi-temp/website && npm run dev
```

- [ ] **Step 2: Open quiz URL in browser**

Navigate to: `http://localhost:4321/unterlagen?email=info@hempura.de&plz=04315&ref=1&name=Test+User`

Expected: Quiz starts at Schritt 1 (Situation tiles), progress dots visible.

- [ ] **Step 3: Walk through all 7 steps**

- Select 2-3 situation tiles → click Weiter
- Enter a baujahr (e.g. 1985) + check "Ungefähre Angabe" → Weiter
- Enter Wohnfläche (e.g. 85) → Weiter
- Select energy class C → Weiter
- Select "Gepflegt" → Weiter
- Select 3 sanierung items → Weiter
- Fill in extras (Stellplatz checked, pain text) → Weiter zur Zusammenfassung
- Verify summary shows all inputs correctly
- Click "Ändern" on Baujahr → verify it goes back to step 2, then back to summary after Weiter
- Click "Preisindikation erstellen"
- Verify success screen appears

- [ ] **Step 4: Check DB entry**

```bash
cd /Users/stefan/code/wkdi-temp/website
node -e "
const db = require('better-sqlite3')('data/wkdi/wkdi.db');
const row = db.prepare('SELECT * FROM registrations ORDER BY id DESC LIMIT 1').get();
console.log(JSON.stringify(row, null, 2));
"
```

Expected: `baujahr`, `wohnflaeche`, `energieklasse`, `zustand`, `was_saniert` (JSON array), `lead_magnet_data` (contains `situation`), `objekt_step_done: 1`.

- [ ] **Step 5: Check admin email was sent to Joachim**

In the dev log, verify the Brevo call succeeded (no error logs). The email to `office@wirkaufendeineimmobilie.de` should include Situation and all fields.

- [ ] **Step 6: Test skip flow**

Open a fresh quiz URL. Skip all 7 steps. Verify summary shows "Nicht angegeben" for all fields. Submit. Verify DB row has `objekt_step_done: 1` with all quiz fields null.

- [ ] **Step 7: Commit final test confirmation**

```bash
git add -A
git commit -m "test: unterlagen quiz e2e verified — all 7 steps + skip + summary + DB"
```

---

## Task 7: Deploy

- [ ] **Step 1: Push to remote**

```bash
cd /Users/stefan/code/wkdi-temp/website && git push
```

- [ ] **Step 2: Deploy via Coolify API**

Read the Coolify token from memory, then trigger deploy:

```bash
# Token from memory: infra_coolify_deploy.md
# Replace RESOURCE_UUID and TOKEN with values from memory
curl -X POST "https://coolify.hetzner.wkdi.de/api/v1/deploy?uuid=RESOURCE_UUID&force=false" \
  -H "Authorization: Bearer TOKEN"
```

- [ ] **Step 3: Verify production**

Open `https://wirkaufendeineimmobilie.de/unterlagen?email=info@hempura.de&plz=04315&ref=1&name=Test` and walk through the quiz.

---

## Notes for Implementer

- The existing upload wizard (steps 0–7 with `goToStep()`) is **unchanged** — only `#step-erstbewertung` is replaced
- The quiz uses `.wiz-step.hidden` pattern (same as existing steps) for show/hide
- `quizState.returnToSummary` flag enables "Ändern → step → back to summary" without going through all remaining steps
- The `situation` field is merged into `lead_magnet_data` JSON on the server (not a separate display column in admin)
- `sanierungsstand` is **not** sent by the new quiz JS — old data with this field is unaffected
- `baujahr_unsicher` is stored in `lead_magnet_data` JSON alongside `situation`
- Energy tile grid: 3 columns on desktop, 2 on mobile (CSS handles this)
- Exclusive Sanierungsstand tiles (Nichts davon / Weiß nicht) deselect all regular tiles
