import { describe, it, expect } from 'vitest';
import { generateRefNr, buildDoiRedirectUrl } from '../lib/ref';

describe('generateRefNr', () => {
  it('generates WKDI- prefix by default', () => {
    const ref = generateRefNr();
    expect(ref).toMatch(/^WKDI-\d{8}-\d{4}$/);
  });

  it('generates KA- prefix when specified', () => {
    const ref = generateRefNr('KA');
    expect(ref).toMatch(/^KA-\d{8}-\d{4}$/);
  });

  it('generates unique refs', () => {
    const refs = new Set(Array.from({ length: 100 }, () => generateRefNr()));
    expect(refs.size).toBeGreaterThan(90);
  });
});

describe('buildDoiRedirectUrl', () => {
  it('builds confirm-lead URL with ref', () => {
    const url = buildDoiRedirectUrl('https://wirkaufendeineimmobilie.de', 'confirm-lead', 'WKDI-20260323-1234');
    expect(url).toBe('https://wirkaufendeineimmobilie.de/api/confirm-lead?ref=WKDI-20260323-1234');
  });

  it('builds confirm-report URL with ref', () => {
    const url = buildDoiRedirectUrl('https://wirkaufendeineimmobilie.de', 'confirm-report', 'KA-20260323-5678');
    expect(url).toBe('https://wirkaufendeineimmobilie.de/api/confirm-report?ref=KA-20260323-5678');
  });

  it('URL-encodes the ref_nr', () => {
    const url = buildDoiRedirectUrl('https://example.com', 'confirm-lead', 'WKDI-2026-AB CD');
    expect(url).toContain('ref=WKDI-2026-AB%20CD');
  });
});
