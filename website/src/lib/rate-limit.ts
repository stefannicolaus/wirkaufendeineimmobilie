const store = new Map<string, { count: number; windowStart: number }>();
const LIMIT = 30;
const WINDOW_MS = 60_000;

export function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = store.get(ip);

  if (!entry || now - entry.windowStart > WINDOW_MS) {
    store.set(ip, { count: 1, windowStart: now });
    return true;
  }

  if (entry.count >= LIMIT) return false;

  entry.count++;
  return true;
}

export function _resetForTests() {
  store.clear();
}
