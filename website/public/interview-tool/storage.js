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

export function deleteInterview(id) {
  const all = getAllInterviews().filter(i => i.id !== id);
  localStorage.setItem(LS_KEY, JSON.stringify(all));
  const queue = getQueue().filter(i => i.id !== id);
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
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
