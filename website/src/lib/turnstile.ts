// src/lib/turnstile.ts
// Cloudflare Turnstile server-side verification

const TURNSTILE_SECRET = process.env.TURNSTILE_SECRET_KEY || '';
const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

export async function verifyTurnstile(token: string, ip?: string): Promise<boolean> {
  if (!TURNSTILE_SECRET) {
    // Turnstile not configured — allow request (graceful degradation)
    return true;
  }

  if (!token) return false;

  const body: Record<string, string> = {
    secret: TURNSTILE_SECRET,
    response: token,
  };
  if (ip) body.remoteip = ip;

  const res = await fetch(VERIFY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) return false;

  const data = await res.json() as { success: boolean };
  return data.success === true;
}
