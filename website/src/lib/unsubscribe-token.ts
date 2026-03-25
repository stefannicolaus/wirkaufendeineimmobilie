import { createHmac } from 'crypto';

export function unsubscribeToken(email: string): string {
  const secret = process.env.UNSUBSCRIBE_SECRET || 'wkdi-2026-unsub-secret';
  return createHmac('sha256', secret).update(email.toLowerCase().trim()).digest('hex').substring(0, 32);
}
