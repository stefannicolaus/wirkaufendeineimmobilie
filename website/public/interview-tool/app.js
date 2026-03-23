// website/public/interview-tool/app.js
import { TOPICS, getTopicById } from './topics.js';
import { getAllInterviews, createInterview, getInterview, updateAnswer, completeInterview } from './storage.js';
import { downloadJSON } from './export.js';

// --- Helpers ---
function debounce(fn, ms) {
  let timer;
  return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), ms); };
}

// --- State ---
let state = {
  view: 'startscreen',         // 'startscreen' | 'interview' | 'evaluierung' | 'archive'
  activeInterviewId: null,
  activeQuestionIndex: 0,
  filterThema: 'alle',
  filterStatus: 'alle',
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
    case 'startscreen':  app.innerHTML = renderStartscreen();  break;
    case 'interview':    app.innerHTML = renderInterview();    break;
    case 'evaluierung':  app.innerHTML = renderEvaluierung();  break;
    case 'archive':      app.innerHTML = renderArchive();      break;
  }
  bindEvents();
}

// --- Score hint ---
function scoreHint(n) {
  if (n <= 3) return 'Niedriger Schmerz — kein dringendes Problem';
  if (n <= 6) return 'Mittlerer Schmerz — lösungsoffen';
  if (n <= 8) return 'Hoher Schmerz — aktiv auf der Suche';
  return '🔥 Kritischer Schmerz — sofort kaufbereit';
}

// === STARTSCREEN ===
function renderStartscreen() {
  const interviews = getAllInterviews();

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
        const input = document.getElementById('partner-typ');
        input.focus();
        input.classList.add('field-input--error');
        return;
      }
      const name = document.getElementById('partner-name').value.trim();
      const interview = createInterview(card.dataset.topicId, typ, name);
      navigate('interview', { activeInterviewId: interview.id, activeQuestionIndex: 0 });
    });
  });
}

// === INTERVIEW FLOW ===
function renderInterview() {
  const interview = getInterview(state.activeInterviewId);
  if (!interview) { navigate('startscreen'); return ''; }
  const topic = getTopicById(interview.thema);
  const allQuestions = topic.sections.flatMap(s =>
    s.questions.map(q => ({ ...q, sectionTitle: s.title }))
  );
  const total = allQuestions.length;
  const current = state.activeQuestionIndex;
  const question = allQuestions[current];
  const isLast = current === total - 1;
  const progressPct = Math.round(((current + 1) / total) * 100);

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

function saveCurrentAnswer() {
  const field = document.getElementById('answer-field');
  if (!field || !state.activeInterviewId) return;
  const interview = getInterview(state.activeInterviewId);
  if (!interview) return;
  const topic = getTopicById(interview.thema);
  const allQuestions = topic.sections.flatMap(s => s.questions);
  const question = allQuestions[state.activeQuestionIndex];
  if (!question) return;
  updateAnswer(state.activeInterviewId, question.id, field.value);
  const indicator = document.getElementById('autosave-indicator');
  if (indicator) indicator.textContent = 'Gespeichert ✓';
}

window.nextQuestion = function() {
  const interview = getInterview(state.activeInterviewId);
  if (!interview) return;
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

function bindInterviewEvents() {
  document.getElementById('answer-field')?.addEventListener('input', debounce(saveCurrentAnswer, 800));
}

// === EVALUIERUNG ===
function renderEvaluierung() {
  const interview = getInterview(state.activeInterviewId);
  if (!interview) { navigate('startscreen'); return ''; }
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
    if (!confirm('Interview wirklich abschließen? Danach als "abgeschlossen" gespeichert.')) return;

    const scoreBtn = document.querySelector('.score-btn.active');
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

// === ARCHIVE ===
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
      if (e.target.closest('[data-export-id]')) return;
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

// === BIND EVENTS DISPATCHER ===
function bindEvents() {
  switch (state.view) {
    case 'startscreen':  bindStartscreenEvents();  break;
    case 'interview':    bindInterviewEvents();     break;
    case 'evaluierung':  bindEvaluierungEvents();  break;
    case 'archive':      bindArchiveEvents();       break;
  }
}

// === BOOT ===
document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(location.search);
  const viewParam = params.get('view');
  if (viewParam && ['startscreen', 'archive'].includes(viewParam)) {
    state.view = viewParam;
  }
  render();
});

window.navigate = navigate;
window.appState = () => state;
