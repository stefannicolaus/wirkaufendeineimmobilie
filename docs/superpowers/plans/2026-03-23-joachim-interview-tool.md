# Joachim Interview Tool — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a DAU-proof, offline-capable interview tool for Joachim that guides him through 12 structured real estate interview guides with hidden What-How-Who product validation and a persistent interview archive.

**Architecture:** Standalone HTML/CSS/JS app in `public/interview-tool/` (no build step, no framework), backed by an Astro API route that persists interviews to the server filesystem. LocalStorage is the primary offline store; server sync runs async with retry queue.

**Tech Stack:** Vanilla JS (ES Modules), CSS (custom properties, no framework), Astro API Route (TypeScript), Node.js filesystem, App-level password gate (JS, no server config needed)

> **Auth note:** Coolify HTTP-Auth applies to the entire service, which would lock the public brown2green site. Instead: the tool has a simple JS-level password gate stored in LocalStorage. Joachim enters the password once per device — then it's remembered.

---

## Spec Reference
`docs/superpowers/specs/2026-03-23-joachim-interview-tool-design.md`

---

## File Map

| File | Responsibility |
|------|---------------|
| `website/public/interview-tool/index.html` | App shell, imports all modules |
| `website/public/interview-tool/style.css` | Tablet-first styles, all states |
| `website/public/interview-tool/app.js` | Router, state management, view orchestration |
| `website/public/interview-tool/storage.js` | LocalStorage CRUD + server sync + retry queue |
| `website/public/interview-tool/topics.js` | All 12 topic guides + question content (from research) |
| `website/public/interview-tool/export.js` | JSON download + print trigger |
| `website/src/pages/api/interviews.ts` | POST /api/interviews → JSON file on filesystem |
| `website/data/interviews/` | Server-side storage directory (gitignored) |

---

## PHASE 1 — Research (run BEFORE Phase 2)

### Task 1: Dispatch 12 parallel research agents

Use **superpowers:dispatching-parallel-agents** for this task. All 12 agents run simultaneously.

Each agent receives this brief (substitute `[TOPIC]`):

> "Du bist ein Experte für den deutschen Immobilienmarkt. Recherchiere für das Thema [TOPIC] folgendes: (1) Welche Fachbegriffe, Insider-Jargon und Abkürzungen benutzen echte Practitioners unter sich? (2) Welche Probleme werden in deutschen Immobilien-Foren, Podcasts (z.B. Immocation, Cashflowimmobilien), LinkedIn ohne befriedigende Lösung diskutiert? (3) Welche DACH-spezifischen Besonderheiten (Steuer, Recht, Regulation, Markt) sind für dieses Thema kritisch? (4) Was sind die typischen kostspieligen Fehler die Einsteiger oder Fortgeschrittene machen? Liefere pro Kategorie 5-8 konkrete, präzise Punkte. Keine Lehrbuch-Antworten."

**12 Agents:**
- [ ] Agent 1: Fix & Flip Immobilienhandel
- [ ] Agent 2: Buy & Hold Bestandsaufbau
- [ ] Agent 3: Aufteilergeschäft (Privatisierung, WEG-Begründung)
- [ ] Agent 4: Immobilieninvestoren (Strategie & Profil)
- [ ] Agent 5: Immobilienmakler (Arbeitsweise & Pain Points)
- [ ] Agent 6: Vertrieb von Kapitalanlageimmobilien
- [ ] Agent 7: Klassische Immobilienfinanzierung (Bank, KfW, Annuität)
- [ ] Agent 8: Mezzanine Kapital
- [ ] Agent 9: Partiarische Darlehen
- [ ] Agent 10: Eigentümerdarlehen (Vendor Loan / Verkäuferdarlehen)
- [ ] Agent 11: Private Equity für Immobilien
- [ ] Agent 12: Ideale & Creative Finance (Junior-Senior-Tranchen, Mietkauf etc.)

- [ ] **Collect all 12 research outputs** and keep them ready for Task 6.

---

## PHASE 2 — Build

### Task 2: Set up file structure + gitignore

**Files:**
- Create: `website/public/interview-tool/index.html`
- Create: `website/public/interview-tool/style.css`
- Create: `website/public/interview-tool/app.js`
- Create: `website/public/interview-tool/storage.js`
- Create: `website/public/interview-tool/topics.js`
- Create: `website/public/interview-tool/export.js`
- Create: `website/src/pages/api/interviews.ts`
- Modify: `website/.gitignore`

- [ ] **Create the directory**
```bash
mkdir -p /Users/stefan/code/brown2green/website/public/interview-tool
```

- [ ] **Create index.html with app-level password gate**
```html
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
  <title>WKDI Interview Tool</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div id="app">Lädt...</div>
  <script>
    // Simple app-level password gate — remembered in LocalStorage per device
    const PASS_KEY = 'wkdi_tool_auth';
    const CORRECT = 'wkdi2026'; // Change before sending to Joachim
    if (localStorage.getItem(PASS_KEY) !== CORRECT) {
      document.getElementById('app').innerHTML = `
        <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100dvh;gap:16px;padding:24px;">
          <h2 style="font-family:system-ui;font-size:20px;color:#1a3a2a;">WKDI Interview Tool</h2>
          <input id="pw" type="password" placeholder="Passwort" autofocus
            style="padding:14px;font-size:16px;border:2px solid #e2e8e0;border-radius:12px;width:100%;max-width:320px;">
          <button onclick="checkPw()"
            style="padding:14px 28px;background:#2d6a4f;color:white;border:none;border-radius:12px;font-size:16px;font-weight:700;cursor:pointer;width:100%;max-width:320px;">
            Einloggen
          </button>
          <p id="pw-err" style="color:#f4a261;font-size:14px;font-family:system-ui;"></p>
        </div>`;
      window.checkPw = () => {
        const val = document.getElementById('pw').value;
        if (val === CORRECT) {
          localStorage.setItem(PASS_KEY, CORRECT);
          location.reload();
        } else {
          document.getElementById('pw-err').textContent = 'Falsches Passwort';
        }
      };
      document.getElementById('pw').addEventListener('keydown', e => {
        if (e.key === 'Enter') window.checkPw();
      });
    } else {
      // Auth OK — load app
      const s = document.createElement('script');
      s.type = 'module';
      s.src = 'app.js';
      document.body.appendChild(s);
    }
  </script>
</body>
</html>
```

> **Before deploy:** change `CORRECT = 'wkdi2026'` to a real password and send to Joachim via WhatsApp.

- [ ] **Create empty module files** (storage.js, app.js, export.js, topics.js — just `// TODO` placeholders)

- [ ] **Add data directory to gitignore**
```bash
echo "website/data/interviews/" >> /Users/stefan/code/brown2green/.gitignore
mkdir -p /Users/stefan/code/brown2green/website/data/interviews
```

- [ ] **Commit skeleton**
```bash
cd /Users/stefan/code/brown2green
git checkout -b feat/interview-tool
git add website/public/interview-tool/ website/src/pages/api/ .gitignore
git commit -m "chore: scaffold interview tool file structure"
```

---

### Task 3: API Endpoint — POST /api/interviews

**Files:**
- Create: `website/src/pages/api/interviews.ts`

- [ ] **Write the API route**

```typescript
// website/src/pages/api/interviews.ts
import type { APIRoute } from 'astro';
import { writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const interview = await request.json();

    if (!interview.id || !interview.thema) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const dir = join(process.cwd(), 'data', 'interviews');
    await mkdir(dir, { recursive: true });

    const filename = `${interview.id}.json`;
    await writeFile(join(dir, filename), JSON.stringify(interview, null, 2), 'utf-8');

    return new Response(JSON.stringify({ success: true, id: interview.id }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Interview save error:', err);
    return new Response(JSON.stringify({ error: 'Save failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
```

- [ ] **Test the endpoint manually**
```bash
cd /Users/stefan/code/brown2green/website && npm run dev &
sleep 3
curl -X POST http://localhost:4321/api/interviews \
  -H "Content-Type: application/json" \
  -d '{"id":"test-uuid","thema":"fix-flip","datum":"2026-03-23T10:00:00","status":"offen"}'
```
Expected: `{"success":true,"id":"test-uuid"}`

- [ ] **Verify file was written**
```bash
cat /Users/stefan/code/brown2green/website/data/interviews/test-uuid.json
```

- [ ] **Commit**
```bash
git add website/src/pages/api/interviews.ts
git commit -m "feat: add POST /api/interviews endpoint"
```

---

### Task 4: storage.js — LocalStorage + Server Sync + Retry Queue

**Files:**
- Create: `website/public/interview-tool/storage.js`

The data model for one interview:
```js
{
  id: String,            // crypto.randomUUID()
  datum: String,         // ISO8601
  thema: String,         // topic id e.g. "fix-flip"
  interviewpartner_typ: String,  // "Investor" | "Makler" | "Handwerker" | "Finanzierer" | custom
  interviewpartner_name: String, // optional
  status: 'offen' | 'abgeschlossen',
  antworten: Object,     // { frage_id: "antwort_text" }
  evaluierung: {
    pain_score: Number,  // 1-10
    kosten_problem: String,
    zahlungsbereitschaft: String,
    naechster_schritt: String,   // "follow-up" | "cab-pitch" | "nichts"
  },
  synced: Boolean,       // true if server acknowledged
}
```

- [ ] **Write storage.js**

```js
// website/public/interview-tool/storage.js

const LS_KEY = 'wkdi_interviews';
const QUEUE_KEY = 'wkdi_sync_queue';
const API_URL = '/api/interviews';

// --- LocalStorage CRUD ---

export function getAllInterviews() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || '[]');
  } catch {
    return [];
  }
}

export function getInterview(id) {
  return getAllInterviews().find(i => i.id === id) || null;
}

export function saveInterview(interview) {
  const all = getAllInterviews();
  const idx = all.findIndex(i => i.id === interview.id);
  if (idx >= 0) {
    all[idx] = interview;
  } else {
    all.unshift(interview);
  }
  localStorage.setItem(LS_KEY, JSON.stringify(all));
  queueSync(interview);
  return interview;
}

export function createInterview(thema, interviewpartner_typ, interviewpartner_name = '') {
  const interview = {
    id: crypto.randomUUID(),
    datum: new Date().toISOString(),
    thema,
    interviewpartner_typ,
    interviewpartner_name,
    status: 'offen',
    antworten: {},
    evaluierung: {
      pain_score: null,
      kosten_problem: '',
      zahlungsbereitschaft: '',
      naechster_schritt: '',
    },
    synced: false,
  };
  return saveInterview(interview);
}

export function updateAnswer(interviewId, frageId, text) {
  const interview = getInterview(interviewId);
  if (!interview) return;
  interview.antworten[frageId] = text;
  saveInterview(interview);
}

export function completeInterview(interviewId, evaluierung) {
  const interview = getInterview(interviewId);
  if (!interview) return;
  interview.status = 'abgeschlossen';
  interview.evaluierung = evaluierung;
  interview.synced = false;
  saveInterview(interview);
}

// --- Retry Queue ---

function queueSync(interview) {
  const queue = getQueue();
  const existing = queue.findIndex(i => i.id === interview.id);
  if (existing >= 0) {
    queue[existing] = interview;
  } else {
    queue.push(interview);
  }
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  attemptSync();
}

function getQueue() {
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
  } catch {
    return [];
  }
}

async function attemptSync() {
  if (!navigator.onLine) return;
  const queue = getQueue();
  if (queue.length === 0) return;

  const remaining = [];
  for (const interview of queue) {
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(interview),
      });
      if (!res.ok) throw new Error('Server error');

      // Mark as synced in LS
      const all = getAllInterviews();
      const idx = all.findIndex(i => i.id === interview.id);
      if (idx >= 0) {
        all[idx].synced = true;
        localStorage.setItem(LS_KEY, JSON.stringify(all));
      }
    } catch {
      remaining.push(interview); // retry later
    }
  }
  localStorage.setItem(QUEUE_KEY, JSON.stringify(remaining));
}

// Listen for reconnect → retry
window.addEventListener('online', attemptSync);
// Attempt sync on load
attemptSync();
```

- [ ] **Test in browser console** — open `http://localhost:4321/interview-tool/`, open DevTools → Console:
```js
// Use dynamic import (static import doesn't work in console)
const { createInterview, getAllInterviews, updateAnswer } = await import('./storage.js');
const iv = createInterview('fix-flip', 'Investor', 'Max Mustermann');
// Expected: object with id, datum, thema='fix-flip', status='offen'
updateAnswer(iv.id, 'e1', 'Testantwort');
getAllInterviews();
// Expected: array with 1 item, antworten.e1 = 'Testantwort'
```

- [ ] **Reload page, verify data persists**
```js
const { getAllInterviews } = await import('./storage.js');
getAllInterviews();
// Expected: same array as before reload
```

- [ ] **Commit**
```bash
git add website/public/interview-tool/storage.js
git commit -m "feat: add LocalStorage + server sync + retry queue"
```

---

### Task 5: export.js

**Files:**
- Create: `website/public/interview-tool/export.js`

- [ ] **Write export.js**

```js
// website/public/interview-tool/export.js

export function downloadJSON(interview) {
  const blob = new Blob([JSON.stringify(interview, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const date = new Date(interview.datum).toLocaleDateString('de-DE').replace(/\./g, '-');
  a.download = `interview-${interview.thema}-${date}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function printInterview() {
  window.print();
}
```

- [ ] **Test JSON download** — in console:
```js
const { downloadJSON } = await import('./export.js');
downloadJSON({ id: 'test', thema: 'fix-flip', datum: new Date().toISOString() });
// Expected: browser downloads "interview-fix-flip-23-3-2026.json"
```

- [ ] **Commit**
```bash
git add website/public/interview-tool/export.js
git commit -m "feat: add JSON download and print export"
```

---

### Task 6: topics.js — 12 Topic Guides (Content from Research)

**Files:**
- Create: `website/public/interview-tool/topics.js`

This task requires the research output from Task 1. Use each agent's output to write deep, practitioner-level questions.

Each topic follows this exact structure:
```js
{
  id: 'fix-flip',
  label: 'Fix & Flip Immobilienhandel',
  sections: [
    {
      id: 'einstieg',
      title: '🤝 Einstieg',
      questions: [
        {
          id: 'ff_e1',
          text: 'Was war Ihr komplexester Flip im letzten Jahr — was hat Sie am meisten überrascht?',
          hiddenAgenda: null  // null = normale Frage, 'WHAT'|'HOW'|'WHO' = hidden agenda
        },
      ]
    },
    { id: 'bestpractice', title: '✅ Best Practices', questions: [...] },
    { id: 'painpoints',   title: '🔥 Pain Points',    questions: [...] },
    { id: 'learning',     title: '🔄 Learning Loop',  questions: [...] },
    { id: 'evaluierung',  title: '📊 Evaluierung',    questions: [] }, // handled separately in UI
  ]
}
```

- [ ] **Write topics.js with all 12 topics** using research output from Phase 1.

Each topic must have:
- EINSTIEG: 2–3 Fragen (hiddenAgenda: null)
- BEST PRACTICES: 4–6 Fragen (hiddenAgenda: null, except 1 tagged 'WHAT')
- PAIN POINTS: 4–6 Fragen (hiddenAgenda: null, except 1 tagged 'HOW')
- LEARNING LOOP: 2–3 Fragen (hiddenAgenda: null, except 1 tagged 'WHO')

The `hiddenAgenda` marker is only used internally by the UI to show a subtle icon for Joachim — the question text itself must sound completely natural.

```js
// website/public/interview-tool/topics.js

export const TOPICS = [
  {
    id: 'fix-flip',
    label: 'Fix & Flip',
    emoji: '🔨',
    sections: [
      {
        id: 'einstieg',
        title: '🤝 Einstieg',
        questions: [
          // FILL FROM RESEARCH AGENT 1 OUTPUT
          { id: 'ff_e1', text: '...', hiddenAgenda: null },
        ]
      },
      {
        id: 'bestpractice',
        title: '✅ Best Practices',
        questions: [
          { id: 'ff_bp1', text: '...', hiddenAgenda: 'WHAT' },
        ]
      },
      {
        id: 'painpoints',
        title: '🔥 Pain Points',
        questions: [
          { id: 'ff_pp1', text: '...', hiddenAgenda: 'HOW' },
        ]
      },
      {
        id: 'learning',
        title: '🔄 Learning Loop',
        questions: [
          { id: 'ff_ll1', text: '...', hiddenAgenda: 'WHO' },
        ]
      },
    ]
  },
  // ... repeat for all 12 topics
];

export function getTopicById(id) {
  return TOPICS.find(t => t.id === id) || null;
}

export function getAllQuestions(topic) {
  return topic.sections.flatMap(s => s.questions);
}

export function countQuestions(topic) {
  return getAllQuestions(topic).length;
}
```

- [ ] **Verify in console** that all 12 topics exist and each has the expected sections:
```js
import { TOPICS } from './topics.js';
console.log(TOPICS.length); // Expected: 12
TOPICS.forEach(t => {
  const total = t.sections.flatMap(s => s.questions).length;
  console.log(t.label, total, 'Fragen');
  // Expected: each topic has at least 12 questions total
});
```

- [ ] **Commit**
```bash
git add website/public/interview-tool/topics.js
git commit -m "feat: add all 12 interview topic guides with question content"
```

---

### Task 7: app.js — Router + State

**Files:**
- Create: `website/public/interview-tool/app.js`

The app has 3 views:
- `startscreen` — topic selection + interviewpartner
- `interview` — active interview flow
- `archive` — list of all saved interviews

- [ ] **Write app.js**

```js
// website/public/interview-tool/app.js
import { TOPICS, getTopicById, countQuestions } from './topics.js';
import { getAllInterviews, createInterview, getInterview, updateAnswer, completeInterview } from './storage.js';
import { downloadJSON, printInterview } from './export.js';

// --- State ---
let state = {
  view: 'startscreen',         // 'startscreen' | 'interview' | 'archive'
  activeInterviewId: null,
  activeQuestionIndex: 0,
};

// --- Router ---
function navigate(view, params = {}) {
  state = { ...state, view, ...params };
  render();
}

// --- Main render ---
function render() {
  const app = document.getElementById('app');
  switch (state.view) {
    case 'startscreen': app.innerHTML = renderStartscreen(); break;
    case 'interview':   app.innerHTML = renderInterview();   break;
    case 'archive':     app.innerHTML = renderArchive();     break;
  }
  bindEvents();
}

// --- Views (implemented in Tasks 8–10) ---
function renderStartscreen() { return '<div>Startscreen</div>'; }
function renderInterview()   { return '<div>Interview</div>'; }
function renderArchive()     { return '<div>Archive</div>'; }
function bindEvents()        {}

// --- Boot ---
// Support ?view=archive for Playwright screenshots and deep linking
document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(location.search);
  const viewParam = params.get('view');
  if (viewParam && ['startscreen', 'archive'].includes(viewParam)) {
    state.view = viewParam;
  }
  render();
});
window.navigate = navigate; // expose for inline onclick handlers
window.appState = () => state; // debug helper
```

- [ ] **Verify routing in console**
Open `http://localhost:4321/interview-tool/` → DevTools Console:
```js
navigate('archive'); // Expected: page shows "Archive" text
navigate('startscreen'); // Expected: page shows "Startscreen" text
appState(); // Expected: {view: 'startscreen', ...}
```

- [ ] **Commit**
```bash
git add website/public/interview-tool/app.js
git commit -m "feat: add app router and state management"
```

---

### Task 8: UI — Startscreen

**Files:**
- Modify: `website/public/interview-tool/app.js` (renderStartscreen + bindEvents)

- [ ] **Implement renderStartscreen()**

```js
function renderStartscreen() {
  const interviews = getAllInterviews();
  const openCount = interviews.filter(i => i.status === 'offen').length;

  return `
    <header class="header">
      <h1 class="header__title">WKDI Interview Tool</h1>
      <button class="btn btn--ghost" onclick="navigate('archive')">
        Meine Interviews ${interviews.length > 0 ? `<span class="badge">${interviews.length}</span>` : ''}
      </button>
    </header>

    <main class="startscreen">
      <h2 class="startscreen__title">Neues Interview starten</h2>

      <section class="partner-form">
        <label class="field-label">Interviewpartner</label>
        <div class="quickselect">
          ${['Investor', 'Makler', 'Handwerker', 'Finanzierer'].map(typ =>
            `<button class="quickselect__btn" data-typ="${typ}">${typ}</button>`
          ).join('')}
        </div>
        <input class="field-input" id="partner-typ" type="text"
               placeholder="Oder eingeben: z.B. Notar, Gutachter..." maxlength="50">
        <input class="field-input" id="partner-name" type="text"
               placeholder="Name (optional)" maxlength="100">
      </section>

      <section class="topic-grid">
        <label class="field-label">Thema wählen</label>
        <div class="grid">
          ${TOPICS.map(t => `
            <button class="topic-card" data-topic-id="${t.id}">
              <span class="topic-card__emoji">${t.emoji}</span>
              <span class="topic-card__label">${t.label}</span>
            </button>
          `).join('')}
        </div>
      </section>
    </main>
  `;
}
```

- [ ] **Add startscreen bindEvents**

```js
function bindStartscreenEvents() {
  // Quickselect fills input
  document.querySelectorAll('.quickselect__btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = document.getElementById('partner-typ');
      input.value = btn.dataset.typ;
      document.querySelectorAll('.quickselect__btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // Topic card starts interview
  document.querySelectorAll('.topic-card').forEach(card => {
    card.addEventListener('click', () => {
      const typ = document.getElementById('partner-typ').value.trim();
      if (!typ) {
        document.getElementById('partner-typ').focus();
        document.getElementById('partner-typ').classList.add('field-input--error');
        return;
      }
      const name = document.getElementById('partner-name').value.trim();
      const interview = createInterview(card.dataset.topicId, typ, name);
      navigate('interview', { activeInterviewId: interview.id, activeQuestionIndex: 0 });
    });
  });
}
```

- [ ] **Update bindEvents() to call bindStartscreenEvents when view === 'startscreen'**

- [ ] **Visual check** — open tool in browser, verify: 12 kacheln sichtbar, Quickselect-Buttons füllen Eingabefeld, ohne Typ-Angabe kann kein Interview gestartet werden.

- [ ] **Commit**
```bash
git add website/public/interview-tool/app.js
git commit -m "feat: implement startscreen with topic selection and partner form"
```

---

### Task 9: UI — Interview Flow

**Files:**
- Modify: `website/public/interview-tool/app.js` (renderInterview + bindEvents)

- [ ] **Implement renderInterview()**

```js
function renderInterview() {
  const interview = getInterview(state.activeInterviewId);
  const topic = getTopicById(interview.thema);
  const allQuestions = topic.sections.flatMap(s =>
    s.questions.map(q => ({ ...q, sectionTitle: s.title }))
  );
  const total = allQuestions.length;
  const current = state.activeQuestionIndex;
  const question = allQuestions[current];
  const isLast = current === total - 1;
  const progressPct = Math.round(((current + 1) / total) * 100);

  // Hidden agenda badge (only shown as subtle indicator, no label text)
  const haBadge = question.hiddenAgenda
    ? `<span class="ha-badge ha-badge--${question.hiddenAgenda.toLowerCase()}" title="Produktvalidierung">${question.hiddenAgenda}</span>`
    : '';

  return `
    <header class="header">
      <button class="btn btn--ghost btn--back" onclick="navigate('startscreen')">← Zurück</button>
      <span class="header__topic">${topic.label}</span>
      <span class="autosave-indicator" id="autosave-indicator">Gespeichert ✓</span>
    </header>

    <div class="progress-bar">
      <div class="progress-bar__fill" style="width: ${progressPct}%"></div>
    </div>
    <p class="progress-label">${current + 1} / ${total} Fragen</p>

    <main class="interview-view">
      <p class="question-section-label">${question.sectionTitle}</p>
      <h2 class="question-text">
        ${question.text}
        ${haBadge}
      </h2>

      <textarea
        class="answer-field"
        id="answer-field"
        placeholder="Notizen..."
        rows="6"
      >${interview.antworten[question.id] || ''}</textarea>

      <div class="question-nav">
        ${current > 0
          ? `<button class="btn btn--ghost" onclick="prevQuestion()">← Zurück</button>`
          : '<div></div>'
        }
        ${isLast
          ? `<button class="btn btn--primary" onclick="navigate('evaluierung')">Zum Abschluss →</button>`
          : `<button class="btn btn--primary" onclick="nextQuestion()">Weiter →</button>`
        }
      </div>
    </main>
  `;
}
```

- [ ] **Add interview navigation to app.js**

```js
window.nextQuestion = function() {
  const interview = getInterview(state.activeInterviewId);
  const topic = getTopicById(interview.thema);
  const total = topic.sections.flatMap(s => s.questions).length;
  saveCurrentAnswer();
  if (state.activeQuestionIndex < total - 1) {
    state.activeQuestionIndex++;
    render();
  }
};

window.prevQuestion = function() {
  saveCurrentAnswer();
  if (state.activeQuestionIndex > 0) {
    state.activeQuestionIndex--;
    render();
  }
};

function saveCurrentAnswer() {
  const field = document.getElementById('answer-field');
  if (!field) return;
  const interview = getInterview(state.activeInterviewId);
  const topic = getTopicById(interview.thema);
  const allQuestions = topic.sections.flatMap(s => s.questions);
  const question = allQuestions[state.activeQuestionIndex];
  updateAnswer(state.activeInterviewId, question.id, field.value);
  const indicator = document.getElementById('autosave-indicator');
  if (indicator) indicator.textContent = 'Gespeichert ✓';
}
```

- [ ] **Auto-save on textarea input** (add to bindInterviewEvents):
```js
document.getElementById('answer-field')?.addEventListener('input', debounce(saveCurrentAnswer, 800));
```

- [ ] **Add debounce helper** at top of app.js:
```js
function debounce(fn, ms) {
  let timer;
  return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), ms); };
}
```

- [ ] **Visual check**: Fragen durchklicken, Textarea befüllen, reload → Antworten noch da.

- [ ] **Commit**
```bash
git add website/public/interview-tool/app.js
git commit -m "feat: implement interview flow with autosave and navigation"
```

---

### Task 10: UI — Evaluierungsblock

**Files:**
- Modify: `website/public/interview-tool/app.js`

This view appears after the last question. It's Joachim-only — not shown to the interviewee.

- [ ] **Add 'evaluierung' view to router switch**

```js
case 'evaluierung': app.innerHTML = renderEvaluierung(); break;
```

- [ ] **Implement renderEvaluierung()**

```js
function renderEvaluierung() {
  const interview = getInterview(state.activeInterviewId);
  const eval_ = interview.evaluierung;

  return `
    <header class="header">
      <span class="header__topic">📊 Abschluss-Evaluierung</span>
      <small class="header__subtitle">Nur für dich — nicht für den Gast sichtbar</small>
    </header>

    <main class="eval-view">
      <div class="eval-section">
        <label class="eval-label">Pain Intensity — wie schmerzhaft ist das Problem?</label>
        <div class="score-slider">
          ${Array.from({length: 10}, (_, i) => i + 1).map(n => `
            <button class="score-btn ${eval_.pain_score === n ? 'active' : ''}"
                    data-score="${n}">${n}</button>
          `).join('')}
        </div>
        <p class="score-hint" id="score-hint">
          ${eval_.pain_score ? scoreHint(eval_.pain_score) : 'Score wählen'}
        </p>
      </div>

      <div class="eval-section">
        <label class="eval-label">Was kostet das Problem wenn es NICHT gelöst wird? (€)</label>
        <input class="field-input" id="eval-kosten" type="text"
               placeholder="z.B. ~5.000€/Projekt" value="${eval_.kosten_problem || ''}">
      </div>

      <div class="eval-section">
        <label class="eval-label">Zahlungsbereitschaft für eine Lösung?</label>
        <input class="field-input" id="eval-zahlung" type="text"
               placeholder="z.B. 500€/Monat oder 2% Provision" value="${eval_.zahlungsbereitschaft || ''}">
      </div>

      <div class="eval-section">
        <label class="eval-label">Nächster Schritt</label>
        <div class="quickselect">
          ${['Follow-up Call', 'CAB-Pitch', 'Nichts'].map(step => `
            <button class="quickselect__btn ${eval_.naechster_schritt === step ? 'active' : ''}"
                    data-step="${step}">${step}</button>
          `).join('')}
        </div>
        <input class="field-input" id="eval-schritt" type="text"
               placeholder="Oder freitext..." value="${eval_.naechster_schritt || ''}">
      </div>

      <div class="eval-actions">
        <button class="btn btn--ghost" onclick="navigate('interview', { activeInterviewId: appState().activeInterviewId, activeQuestionIndex: appState().activeQuestionIndex || 0 })">← Nochmal nachschauen</button>
        <button class="btn btn--primary btn--confirm" id="btn-abschliessen">
          Interview abschließen ✓
        </button>
      </div>
    </main>
  `;
}

function scoreHint(n) {
  if (n <= 3) return 'Niedriger Schmerz — kein dringendes Problem';
  if (n <= 6) return 'Mittlerer Schmerz — lösungsoffen';
  if (n <= 8) return 'Hoher Schmerz — aktiv auf der Suche';
  return '🔥 Kritischer Schmerz — sofort kaufbereit';
}
```

- [ ] **Bind evaluierung events** (score buttons, Quickselect, Abschluss-Button mit Bestätigung):

```js
function bindEvaluierungEvents() {
  document.querySelectorAll('.score-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.score-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('score-hint').textContent = scoreHint(Number(btn.dataset.score));
    });
  });

  document.querySelectorAll('[data-step]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-step]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('eval-schritt').value = btn.dataset.step;
    });
  });

  document.getElementById('btn-abschliessen')?.addEventListener('click', () => {
    const scoreBtn = document.querySelector('.score-btn.active');
    if (!confirm('Interview wirklich abschließen? Danach als "abgeschlossen" gespeichert.')) return;

    const evaluierung = {
      pain_score: scoreBtn ? Number(scoreBtn.dataset.score) : null,
      kosten_problem: document.getElementById('eval-kosten')?.value || '',
      zahlungsbereitschaft: document.getElementById('eval-zahlung')?.value || '',
      naechster_schritt: document.getElementById('eval-schritt')?.value || '',
    };

    completeInterview(state.activeInterviewId, evaluierung);
    const interview = getInterview(state.activeInterviewId);
    downloadJSON(interview);
    navigate('archive');
  });
}
```

- [ ] **Update `bindEvents()` to call `bindEvaluierungEvents()` when view === 'evaluierung'** (same pattern as Task 8 for startscreen)

- [ ] **Visual check**: Evaluierung ausfüllen, "Interview abschließen" klicken → Bestätigung erscheint → nach Bestätigung wird JSON heruntergeladen + Archiv öffnet sich.

- [ ] **Commit**
```bash
git add website/public/interview-tool/app.js
git commit -m "feat: implement evaluation block with confirm-gate and auto-download"
```

---

### Task 11: UI — Archiv (Meine Interviews)

**Files:**
- Modify: `website/public/interview-tool/app.js`

- [ ] **Implement renderArchive()**

```js
function renderArchive() {
  let interviews = getAllInterviews();
  const filterThema = state.filterThema || 'alle';
  const filterStatus = state.filterStatus || 'alle';

  if (filterThema !== 'alle') interviews = interviews.filter(i => i.thema === filterThema);
  if (filterStatus !== 'alle') interviews = interviews.filter(i => i.status === filterStatus);

  const rows = interviews.length === 0
    ? '<p class="archive__empty">Noch keine Interviews gespeichert.</p>'
    : interviews.map(iv => {
        const topic = getTopicById(iv.thema);
        const date = new Date(iv.datum).toLocaleDateString('de-DE');
        const statusClass = iv.status === 'abgeschlossen' ? 'badge--green' : 'badge--yellow';
        const statusLabel = iv.status === 'abgeschlossen' ? 'Abgeschlossen' : 'Offen';
        const score = iv.evaluierung?.pain_score ? `🔥 ${iv.evaluierung.pain_score}/10` : '—';

        return `
          <div class="archive-item" data-interview-id="${iv.id}">
            <div class="archive-item__main">
              <span class="archive-item__date">${date}</span>
              <span class="archive-item__topic">${topic?.label || iv.thema}</span>
              <span class="archive-item__typ">${iv.interviewpartner_typ}</span>
            </div>
            <div class="archive-item__meta">
              <span class="badge ${statusClass}">${statusLabel}</span>
              <span class="archive-item__score">${score}</span>
              <button class="btn btn--ghost btn--sm" data-export-id="${iv.id}">↓ JSON</button>
            </div>
          </div>
        `;
      }).join('');

  return `
    <header class="header">
      <button class="btn btn--ghost" onclick="navigate('startscreen')">← Neues Interview</button>
      <h1 class="header__title">Meine Interviews</h1>
    </header>

    <div class="archive-filters">
      <select id="filter-thema" class="filter-select">
        <option value="alle">Alle Themen</option>
        ${TOPICS.map(t => `<option value="${t.id}" ${filterThema === t.id ? 'selected' : ''}>${t.label}</option>`).join('')}
      </select>
      <select id="filter-status" class="filter-select">
        <option value="alle">Alle Status</option>
        <option value="offen" ${filterStatus === 'offen' ? 'selected' : ''}>Offen</option>
        <option value="abgeschlossen" ${filterStatus === 'abgeschlossen' ? 'selected' : ''}>Abgeschlossen</option>
      </select>
    </div>

    <main class="archive">${rows}</main>
  `;
}
```

- [ ] **Bind archive events**:

```js
function bindArchiveEvents() {
  document.getElementById('filter-thema')?.addEventListener('change', e => {
    state.filterThema = e.target.value;
    render();
  });
  document.getElementById('filter-status')?.addEventListener('change', e => {
    state.filterStatus = e.target.value;
    render();
  });
  document.querySelectorAll('.archive-item').forEach(item => {
    item.addEventListener('click', e => {
      if (e.target.closest('[data-export-id]')) return; // don't navigate if export clicked
      const id = item.dataset.interviewId;
      const interview = getInterview(id);
      if (!interview) return;
      const topic = getTopicById(interview.thema);
      const total = topic.sections.flatMap(s => s.questions).length;
      const answered = Object.keys(interview.antworten).length;
      navigate('interview', {
        activeInterviewId: id,
        activeQuestionIndex: Math.min(answered, total - 1),
      });
    });
  });
  document.querySelectorAll('[data-export-id]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const iv = getInterview(btn.dataset.exportId);
      if (iv) downloadJSON(iv);
    });
  });
}
```

- [ ] **Visual check**: Mehrere Interviews anlegen, Archiv öffnen → Filter funktionieren, Klick öffnet Interview wieder.

- [ ] **Commit**
```bash
git add website/public/interview-tool/app.js
git commit -m "feat: implement interview archive with filters and re-open"
```

---

### Task 12: CSS — Tablet-first Styling

**Files:**
- Create: `website/public/interview-tool/style.css`

- [ ] **Write style.css** — full stylesheet, tablet-first, all states:

Key requirements:
- Font: System font stack (no Google Fonts dependency for offline use): `font-family: -apple-system, 'Segoe UI', system-ui, sans-serif`
- Primary color: `--color-primary: #1a3a2a` (dark green, WKDI-passend)
- Accent: `--color-accent: #2d6a4f`
- Success: `--color-success: #40916c`
- Warning: `--color-warning: #f4a261`
- Touch targets: min 44px height for all buttons
- Base font size: 16px minimum
- Progress bar: animated fill
- Autosave indicator: subtle, always visible
- HA badge: small, discrete (only Joachim sees the context)

```css
/* website/public/interview-tool/style.css */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --color-primary: #1a3a2a;
  --color-accent: #2d6a4f;
  --color-success: #40916c;
  --color-warning: #f4a261;
  --color-bg: #f8f9f6;
  --color-surface: #ffffff;
  --color-border: #e2e8e0;
  --color-text: #1a1a1a;
  --color-text-muted: #6b7280;
  --radius: 12px;
  --shadow: 0 1px 3px rgba(0,0,0,.08), 0 4px 16px rgba(0,0,0,.06);
  --touch-min: 44px;
}

body {
  font-family: -apple-system, 'Segoe UI', system-ui, sans-serif;
  font-size: 16px;
  background: var(--color-bg);
  color: var(--color-text);
  line-height: 1.6;
  min-height: 100dvh;
}

/* Header */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  z-index: 10;
}
.header__title { font-size: 18px; font-weight: 700; color: var(--color-primary); }
.header__topic { font-size: 15px; font-weight: 600; color: var(--color-primary); }
.header__subtitle { font-size: 11px; color: var(--color-text-muted); }

/* Autosave indicator */
.autosave-indicator {
  font-size: 12px;
  color: var(--color-success);
  font-weight: 500;
}

/* Progress bar */
.progress-bar {
  height: 4px;
  background: var(--color-border);
}
.progress-bar__fill {
  height: 100%;
  background: var(--color-accent);
  transition: width 0.3s ease;
}
.progress-label {
  text-align: center;
  font-size: 12px;
  color: var(--color-text-muted);
  padding: 8px;
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: var(--touch-min);
  padding: 10px 20px;
  border-radius: var(--radius);
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.15s ease;
}
.btn--primary {
  background: var(--color-accent);
  color: white;
}
.btn--primary:active { background: var(--color-primary); transform: scale(0.98); }
.btn--ghost {
  background: transparent;
  color: var(--color-accent);
  border: 1.5px solid var(--color-border);
}
.btn--ghost:active { background: var(--color-bg); }
.btn--sm { min-height: 36px; padding: 6px 14px; font-size: 13px; }
.btn--confirm { width: 100%; font-size: 16px; }

.badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}
.badge--green { background: #d1fae5; color: #065f46; }
.badge--yellow { background: #fef3c7; color: #92400e; }

/* Startscreen */
.startscreen { padding: 20px; max-width: 720px; margin: 0 auto; }
.startscreen__title { font-size: 20px; font-weight: 700; margin-bottom: 20px; color: var(--color-primary); }

.partner-form { margin-bottom: 28px; }
.field-label { display: block; font-size: 13px; font-weight: 600; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: .5px; margin-bottom: 8px; }
.field-input {
  width: 100%;
  min-height: var(--touch-min);
  padding: 10px 14px;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius);
  font-size: 16px;
  background: var(--color-surface);
  margin-bottom: 10px;
}
.field-input:focus { outline: none; border-color: var(--color-accent); }
.field-input--error { border-color: var(--color-warning); }

.quickselect { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 10px; }
.quickselect__btn {
  min-height: var(--touch-min);
  padding: 8px 16px;
  border: 1.5px solid var(--color-border);
  border-radius: 20px;
  background: var(--color-surface);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}
.quickselect__btn.active {
  background: var(--color-accent);
  color: white;
  border-color: var(--color-accent);
}

/* Topic grid */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 12px;
  margin-top: 8px;
}
.topic-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 20px 12px;
  background: var(--color-surface);
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius);
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  text-align: center;
  transition: all 0.15s ease;
  min-height: 90px;
}
.topic-card:active { background: var(--color-bg); transform: scale(0.97); }
.topic-card__emoji { font-size: 28px; }

/* Interview view */
.interview-view { padding: 24px 20px; max-width: 720px; margin: 0 auto; }
.question-section-label { font-size: 12px; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: .5px; margin-bottom: 8px; }
.question-text { font-size: 20px; font-weight: 700; line-height: 1.4; color: var(--color-primary); margin-bottom: 20px; display: flex; align-items: flex-start; gap: 10px; }
.ha-badge { font-size: 9px; font-weight: 700; padding: 2px 5px; border-radius: 4px; flex-shrink: 0; margin-top: 6px; }
.ha-badge--what { background: #dbeafe; color: #1e40af; }
.ha-badge--how  { background: #fce7f3; color: #9d174d; }
.ha-badge--who  { background: #ede9fe; color: #5b21b6; }

.answer-field {
  width: 100%;
  padding: 14px;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius);
  font-size: 16px;
  resize: vertical;
  min-height: 160px;
  font-family: inherit;
  background: var(--color-surface);
}
.answer-field:focus { outline: none; border-color: var(--color-accent); }

.question-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  gap: 12px;
}

/* Evaluierung */
.eval-view { padding: 24px 20px; max-width: 600px; margin: 0 auto; }
.eval-section { margin-bottom: 28px; }
.eval-label { display: block; font-size: 15px; font-weight: 600; color: var(--color-primary); margin-bottom: 10px; }
.score-slider { display: flex; gap: 6px; flex-wrap: wrap; }
.score-btn {
  width: 44px;
  height: 44px;
  border-radius: 8px;
  border: 1.5px solid var(--color-border);
  background: var(--color-surface);
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
}
.score-btn.active { background: var(--color-accent); color: white; border-color: var(--color-accent); }
.score-hint { margin-top: 8px; font-size: 13px; color: var(--color-text-muted); }
.eval-actions { display: flex; flex-direction: column; gap: 12px; margin-top: 32px; }

/* Archive */
.archive-filters { display: flex; gap: 10px; padding: 12px 20px; background: var(--color-surface); border-bottom: 1px solid var(--color-border); }
.filter-select { flex: 1; min-height: var(--touch-min); padding: 8px 12px; border: 1.5px solid var(--color-border); border-radius: var(--radius); font-size: 14px; background: var(--color-surface); }
.archive { padding: 16px 20px; max-width: 720px; margin: 0 auto; display: flex; flex-direction: column; gap: 10px; }
.archive__empty { color: var(--color-text-muted); text-align: center; padding: 40px; }
.archive-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: var(--color-surface);
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius);
  cursor: pointer;
  gap: 12px;
}
.archive-item:active { background: var(--color-bg); }
.archive-item__main { display: flex; flex-direction: column; gap: 4px; }
.archive-item__date { font-size: 12px; color: var(--color-text-muted); }
.archive-item__topic { font-size: 15px; font-weight: 600; color: var(--color-primary); }
.archive-item__typ { font-size: 13px; color: var(--color-text-muted); }
.archive-item__meta { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
.archive-item__score { font-size: 13px; font-weight: 600; color: var(--color-accent); }

/* Responsive — larger tablets */
@media (min-width: 768px) {
  .eval-actions { flex-direction: row; justify-content: flex-end; }
  .eval-actions .btn--confirm { width: auto; }
}

/* Print styles */
@media print {
  .header, .question-nav, .btn, .progress-bar, .ha-badge { display: none; }
  .answer-field { border: 1px solid #ccc; }
}
```

- [ ] **Visual check mit Playwright Screenshot**
```bash
npx playwright screenshot --viewport-size="768,1024" http://localhost:4321/interview-tool/ /tmp/interview-tool-tablet.png
npx playwright screenshot --viewport-size="390,844" http://localhost:4321/interview-tool/ /tmp/interview-tool-mobile.png
open /tmp/interview-tool-tablet.png /tmp/interview-tool-mobile.png
```

- [ ] **Commit**
```bash
git add website/public/interview-tool/style.css
git commit -m "feat: add tablet-first stylesheet with all states"
```

---

### Task 13: DAU-Test + Integration Check

- [ ] **Vollständiger manueller Durchlauf:**
  1. URL öffnen (localhost — kein Passwort nötig da LocalStorage leer) → Startscreen erscheint sofort
  2. Ohne Typ-Eingabe auf Thema klicken → Fehler-Hinweis, kein Interview gestartet
  3. Typ wählen (Quickselect) → Thema wählen → Interview startet
  4. 5 Fragen ausfüllen → Browser-Tab schließen → Tab wieder öffnen → Antworten noch da
  5. Durchklicken bis Evaluierung → Score + Felder ausfüllen
  6. "Interview abschließen" klicken → Bestätigung → JSON wird heruntergeladen → Archiv öffnet
  7. Im Archiv: Interview wieder öffnen, Filter testen
  8. Zweites Interview mit anderem Thema anlegen, beide im Archiv sichtbar

- [ ] **iOS Safari Test** (falls Gerät verfügbar):
  - JSON-Export funktioniert
  - Textarea scrollt korrekt
  - Buttons haben ausreichend Größe

- [ ] **Offline Test**:
  - DevTools → Network → Offline schalten
  - Neues Interview anlegen + Antworten eintragen
  - Autosave-Indicator zeigt "Gespeichert ✓"
  - Network → Online schalten
  - Warten 3 Sekunden → Server-Datei erscheint in `data/interviews/`

- [ ] **Playwright Screenshots für alle 3 Views**
```bash
# Startscreen
npx playwright screenshot --viewport-size="768,1024" "http://localhost:4321/interview-tool/" /tmp/view-start.png
# Archive (uses ?view= query param added to router in Task 7)
npx playwright screenshot --viewport-size="768,1024" "http://localhost:4321/interview-tool/?view=archive" /tmp/view-archive.png
open /tmp/view-start.png /tmp/view-archive.png
```
Note: Interview view screenshot requires an active interview in LocalStorage — test manually.

- [ ] **Fix any issues found**

- [ ] **Final commit before deploy**
```bash
git add -A
git commit -m "feat: interview tool complete — DAU-tested and ready for deploy"
```

---

### Task 14: Deploy auf Coolify

**Voraussetzung:** Coolify-Zugang + brown2green Service ist deployed.

- [ ] **Branch pushen**
```bash
cd /Users/stefan/code/brown2green
git push origin feat/interview-tool
```

- [ ] **Passwort setzen vor Deploy**
  - In `index.html` `CORRECT = 'wkdi2026'` durch echtes Passwort ersetzen (z.B. `wkdi-j-2026`)
  - Passwort notieren für WhatsApp an Joachim

- [ ] **Deploy aus feat/interview-tool Branch** (oder PR merge zu main — Stefan entscheidet)

> **⚠️ Daten-Limitation:** LocalStorage ist gerätegebunden. Wenn Joachim das Browser-Cache löscht oder ein anderes Gerät nutzt, sind lokale Daten weg. Server hat Backup-JSONs. Empfehlung: Joachim nutzt ein festes Gerät (sein eigenes Tablet) für alle Konferenz-Interviews und exportiert JSON nach jedem Interview.

- [ ] **Produktions-Test auf echter URL**:
```bash
curl https://[domain]/interview-tool/
# Expected: HTML zurückgeliefert (200) mit Passwort-Gate im body
```

- [ ] **Playwright Screenshot der Live-URL**
```bash
npx playwright screenshot --viewport-size="768,1024" "https://[domain]/interview-tool/" /tmp/live-test.png
open /tmp/live-test.png
# Expected: Passwort-Gate sichtbar (Eingabefeld + Einloggen Button)
```

- [ ] **Zugangsdaten per WhatsApp an Joachim senden:** URL + Passwort

- [ ] **Abschluss-Commit**
```bash
git commit --allow-empty -m "chore: interview tool deployed to production for conference"
```

---

## Erfolgskriterien-Checkliste (vor Übergabe an Joachim)

- [ ] DAU-Test bestanden: Joachim kann ohne Erklärung sofort starten
- [ ] Alle Eingaben überleben Browser-Reload
- [ ] Tool funktioniert vollständig offline (kein Spinner, kein Fehler)
- [ ] Server-Sync erfolgt automatisch bei Reconnect
- [ ] JSON-Export funktioniert auf iOS Safari
- [ ] Archiv zeigt alle abgeschlossenen Interviews mit Datum/Thema/Typ/Pain-Score
- [ ] JS-Passwort-Gate schützt Zugang (einmalige Eingabe, per Device in LocalStorage gespeichert)
- [ ] What-How-Who Markierung (HA-Badge) nur für Joachim sichtbar
- [ ] Playwright Screenshot zeigt korrektes Layout auf 768px (Tablet)
