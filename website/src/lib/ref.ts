// src/lib/ref.ts
// Shared ref_nr generator — used by roi-report, kapitalanleger-report, lead-magnet

export function generateRefNr(prefix: 'WKDI' | 'KA' = 'WKDI'): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${date}-${rand}`;
}

export function buildDoiRedirectUrl(baseUrl: string, endpoint: 'confirm-lead' | 'confirm-report', refNr: string): string {
  return `${baseUrl}/api/${endpoint}?ref=${encodeURIComponent(refNr)}`;
}
