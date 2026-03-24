# WKDI Personalized Marketing System — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Double Opt-In email gates to all 7 lead magnet segments, segment leads into Brevo lists, and expose contextual CTAs on the homepage so every visitor gets funneled to the right lead magnet.

**Architecture:** All form submissions store a `ref_nr` + `doi_confirmed=false` in SQLite first. The Brevo DOI email contains a dynamic link back to a confirm endpoint that carries the `ref_nr`. On confirmation: mark confirmed, notify Joachim, let Brevo Automation start the welcome sequence. For calculators (ROI/KA), the PDF is generated at POST time and stored as `pdf_base64` so the confirm endpoint can retrieve and send it without running Puppeteer again.

**Tech Stack:** Astro SSR, better-sqlite3, Brevo API (`/v3/contacts/doubleOptinConfirmation`), Puppeteer (PDF generation), Vitest (tests)

**Spec:** `docs/superpowers/specs/2026-03-23-personalized-marketing-system-design.md`

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `src/lib/db.ts` | Modify | Add doi_confirmed, ref_nr, pdf_base64 columns; add lookup helpers; fix DOI redirect to be dynamic |
| `src/lib/ref.ts` | Create | generateRefNr() — extracted pure function, testable |
| `src/components/FormPrivacyHint.astro` | Modify | Add required checkbox + label |
| `src/pages/danke.astro` | Modify | Add doi-fehler + report-versendet variants |
| `src/pages/api/confirm-lead.ts` | Create | GET — confirms DOI for manual LMs, notifies Joachim |
| `src/pages/api/confirm-report.ts` | Create | GET — confirms DOI for calculators, retrieves stored PDF + sends |
| `src/pages/api/lead-magnet.ts` | Modify | Add DOI trigger per segment + list assignment; skip DOI if from_questionnaire=1 |
| `src/pages/api/roi-report.ts` | Modify | Store PDF as pdf_base64, trigger DOI instead of immediate send |
| `src/pages/api/kapitalanleger-report.ts` | Modify | Same as roi-report |
| `src/pages/aktionsplan-erbengemeinschaft/index.astro` | Modify | Add email gate + "Fast fertig" screen (replaces "Jetzt starten" button) |
| `src/pages/aktionsplan-erbengemeinschaft/start.astro` | Modify | Add hidden from_questionnaire=1 to submit payload |
| `src/pages/90-tage-blueprint/index.astro` | Modify | Same email gate pattern |
| `src/pages/90-tage-blueprint/start.astro` | Modify | Add from_questionnaire=1 |
| `src/pages/entscheidungskompass-betreuung/index.astro` | Modify | Same email gate pattern |
| `src/pages/entscheidungskompass-betreuung/start.astro` | Modify | Add from_questionnaire=1 |
| `src/pages/scheidung/index.astro` | Create | Landing + email gate for Scheidung segment |
| `src/pages/scheidung/start.astro` | Create | 3-question wizard + questionnaire submit |
| `src/pages/umzug/index.astro` | Create | Landing + email gate for Umzug segment |
| `src/pages/umzug/start.astro` | Create | 3-question wizard + questionnaire submit |
| `src/pages/index.astro` | Modify | Add contextual CTAs to 7 scenario cards |
| `src/components/Footer.astro` | Modify | Remove lead magnet links from nav columns |
| `src/tests/ref.test.ts` | Create | Tests for generateRefNr() |
| `src/tests/doi-helpers.test.ts` | Create | Tests for buildDoiRedirectUrl() and db lookup helpers |

---

## Task 1: Extract generateRefNr + add DB helpers

**Files:**
- Create: `src/lib/ref.ts`
- Modify: `src/lib/db.ts`
- Create: `src/tests/ref.test.ts`

- [ ] **Step 1: Create `src/lib/ref.ts`**

```typescript
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
```

- [ ] **Step 2: Write tests in `src/tests/ref.test.ts`**

```typescript
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
    expect(refs.size).toBeGreaterThan(90); // allows tiny collision chance
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
```

- [ ] **Step 3: Run tests — expect PASS**

```bash
cd ~/code/wkdi-temp/website && npm run test -- src/tests/ref.test.ts
```

Expected: all 5 tests pass

- [ ] **Step 4: Add DB columns and lookup helpers to `src/lib/db.ts`**

After the existing `try { db.exec(...) } catch {}` migration block (around line 42-43), add:

```typescript
// DOI tracking columns
try { db.exec(`ALTER TABLE registrations ADD COLUMN doi_confirmed INTEGER DEFAULT 0`); } catch {}
try { db.exec(`ALTER TABLE registrations ADD COLUMN ref_nr TEXT`); } catch {}
try { db.exec(`ALTER TABLE registrations ADD COLUMN pdf_base64 TEXT`); } catch {}  // for roi-rechner PDF storage
try { db.exec(`ALTER TABLE leads_kapitalanleger ADD COLUMN doi_confirmed INTEGER DEFAULT 0`); } catch {}
try { db.exec(`ALTER TABLE leads_kapitalanleger ADD COLUMN ref_nr TEXT`); } catch {}
try { db.exec(`ALTER TABLE leads_kapitalanleger ADD COLUMN pdf_base64 TEXT`); } catch {}
```

**Note on `insertRegistration` and `insertKapitalanlegerLead`:** Both functions in `db.ts` already use dynamic column building from `Object.keys(data)` — they build the INSERT statement at runtime from whatever keys you pass. This means you can freely add `ref_nr`, `doi_confirmed`, `pdf_base64` to the data object without changing the function. Verify this by checking that `insertRegistration` starts with `const columns = Object.keys(data)` (it does, at line 73).

Then add these exported functions before `export default db`:

```typescript
export function findRegistrationByRef(refNr: string): Record<string, unknown> | undefined {
  return db.prepare('SELECT * FROM registrations WHERE ref_nr = ?').get(refNr) as Record<string, unknown> | undefined;
}

export function confirmRegistrationByRef(refNr: string): void {
  db.prepare('UPDATE registrations SET doi_confirmed = 1 WHERE ref_nr = ?').run(refNr);
}

export function findKapitalanlegerByRef(refNr: string): Record<string, unknown> | undefined {
  return db.prepare('SELECT * FROM leads_kapitalanleger WHERE ref_nr = ?').get(refNr) as Record<string, unknown> | undefined;
}

export function confirmKapitalanlegerByRef(refNr: string): void {
  db.prepare('UPDATE leads_kapitalanleger SET doi_confirmed = 1 WHERE ref_nr = ?').run(refNr);
}
```

- [ ] **Step 5: Fix `triggerBrevoDoubleOptIn` in `src/lib/db.ts` to accept dynamic redirectionUrl**

Find the function signature (around line 165):
```typescript
function triggerBrevoDoubleOptIn(opts: {
  email: string;
  name: string;
  typ: string;
  listId: number;
  templateId: number;
  redirectUrl: string;
}) {
```

Change `redirectUrl: string` to `redirectionUrl: string` and update the body:

The function body currently passes `opts.redirectUrl` to the API call as `redirectionUrl`. Change all references from `opts.redirectUrl` to `opts.redirectionUrl`.

Also delete or ignore the module-level `BREVO_DOI_REDIRECT_URL` constant — it's no longer used. The redirect URL is now passed per-call from the API routes.

Also export the function so API routes can call it directly:
```typescript
export function triggerBrevoDoubleOptIn(opts: { ... }) { ... }
```

- [ ] **Step 6: Run build to verify no type errors**

```bash
cd ~/code/wkdi-temp/website && npm run build 2>&1 | tail -20
```

Expected: build succeeds or only shows unrelated warnings

- [ ] **Step 6b: Add `SITE_URL` to `.env.example`**

Check if `.env.example` exists at the repo root. If it does, add:
```
SITE_URL=https://wirkaufendeineimmobilie.de
```
If `.env.example` doesn't exist, create it with just this line. This ensures staging/local environments get a correct DOI redirect URL rather than the hardcoded fallback.

- [ ] **Step 7: Commit**

```bash
git add src/lib/ref.ts src/lib/db.ts src/tests/ref.test.ts .env.example
git commit -m "feat: extract generateRefNr, add DOI DB columns + lookup helpers, dynamic DOI redirect"
```

---

## Task 2: FormPrivacyHint checkbox + danke.astro new variants

**Files:**
- Modify: `src/components/FormPrivacyHint.astro`
- Modify: `src/pages/danke.astro`

- [ ] **Step 1: Add checkbox to `src/components/FormPrivacyHint.astro`**

Replace entire file content with:

```astro
---
---
<div class="form-privacy-wrap">
  <label class="form-privacy-checkbox">
    <input type="checkbox" name="datenschutz_ok" required />
    <span>Ich habe die <a href="/datenschutz">Datenschutzerklärung</a> gelesen und stimme der Verarbeitung meiner Daten zu.</span>
  </label>
</div>

<style>
  .form-privacy-wrap {
    margin-top: var(--space-3);
  }

  .form-privacy-checkbox {
    display: flex;
    align-items: flex-start;
    gap: var(--space-2);
    cursor: pointer;
  }

  .form-privacy-checkbox input[type="checkbox"] {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
    margin-top: 2px;
    accent-color: var(--color-accent);
    cursor: pointer;
  }

  .form-privacy-checkbox span {
    font-size: var(--text-xs);
    color: var(--color-text-muted);
    line-height: var(--leading-normal);
  }

  .form-privacy-checkbox a {
    color: var(--color-text-muted);
    text-decoration: underline;
  }
</style>
```

- [ ] **Step 2: Add new variants to `src/pages/danke.astro`**

In the `content` record (after the existing `'doi-bestaetigt'` entry, around line 60), add:

```typescript
  'doi-fehler': {
    title: 'Link ungültig',
    heading: 'Dieser Link ist nicht mehr gültig.',
    message: 'Der Bestätigungslink wurde bereits verwendet oder ist abgelaufen. Bitte fülle das Formular erneut aus.',
    next: 'Zurück zur Startseite',
    nextLink: '/',
  },
  'report-versendet': {
    title: 'Analyse unterwegs',
    heading: 'Deine Analyse ist unterwegs!',
    message: 'Wir haben dir gerade eine E-Mail mit deiner persönlichen Analyse geschickt. Prüfe deinen Posteingang — auch den Spam-Ordner. Absender: office@wirkaufendeineimmobilie.de',
    next: 'Zur Startseite',
    nextLink: '/',
  },
```

- [ ] **Step 3: Run build to verify**

```bash
cd ~/code/wkdi-temp/website && npm run build 2>&1 | tail -10
```

Expected: clean build

- [ ] **Step 4: Commit**

```bash
git add src/components/FormPrivacyHint.astro src/pages/danke.astro
git commit -m "feat: add DSGVO checkbox to FormPrivacyHint, add doi-fehler + report-versendet danke variants"
```

---

## Task 3: confirm-lead endpoint (manual LMs)

**Files:**
- Create: `src/pages/api/confirm-lead.ts`

- [ ] **Step 1: Create `src/pages/api/confirm-lead.ts`**

```typescript
// src/pages/api/confirm-lead.ts
// GET endpoint — called by Brevo DOI redirect after user clicks confirmation link
// Marks registration as confirmed, notifies Joachim, lets Brevo Automation handle welcome email

import type { APIRoute } from 'astro';
import { findRegistrationByRef, confirmRegistrationByRef } from '../../lib/db';
import { sendTransactionalEmail } from '../../lib/brevo';

export const prerender = false;

const NOTIFY_EMAIL = process.env.NOTIFY_EMAIL || 'office@wirkaufendeineimmobilie.de';

const SEGMENT_LABELS: Record<string, string> = {
  'aktionsplan-erben': 'Aktionsplan Erbengemeinschaft',
  'blueprint': '90-Tage-Blueprint Fix & Flip',
  'kompass': 'Entscheidungskompass Betreuung',
  'scheidung': 'Schnell-Aktionsplan Scheidung',
  'umzug': 'Checkliste Umzug',
};

export const GET: APIRoute = async ({ url }) => {
  const ref = url.searchParams.get('ref');

  if (!ref) {
    return Response.redirect(new URL('/danke?typ=doi-fehler', url.origin), 302);
  }

  const registration = findRegistrationByRef(ref);

  // ref not found
  if (!registration) {
    return Response.redirect(new URL('/danke?typ=doi-fehler', url.origin), 302);
  }

  // already confirmed — idempotent
  if (registration.doi_confirmed) {
    return Response.redirect(new URL('/danke?typ=doi-bestaetigt', url.origin), 302);
  }

  // confirm
  confirmRegistrationByRef(ref);

  // notify Joachim
  const segmentLabel = SEGMENT_LABELS[registration.lead_magnet_typ as string] || 'Lead Magnet';
  const name = (registration.name as string) || 'Unbekannt';
  const email = registration.email as string;

  try {
    await sendTransactionalEmail({
      to: { email: NOTIFY_EMAIL, name: 'Joachim Kleinke' },
      subject: `DOI bestätigt: ${segmentLabel} — ${name}`,
      htmlContent: `<p>E-Mail bestätigt für ${segmentLabel}.</p>
<p>Name: ${name}<br>E-Mail: ${email}<br>Ref: ${ref}</p>
<p>Zeitpunkt: ${new Date().toLocaleString('de-DE')}</p>`,
    });
  } catch {
    // notification failure must not block the redirect
  }

  // Brevo Automation (configured in Brevo) handles the welcome email automatically
  // after the contact is added to the list via DOI confirmation

  const segment = registration.lead_magnet_typ as string;
  return Response.redirect(new URL(`/danke?typ=doi-bestaetigt&segment=${segment}`, url.origin), 302);
};
```

- [ ] **Step 2: Run build**

```bash
cd ~/code/wkdi-temp/website && npm run build 2>&1 | tail -10
```

Expected: clean build

- [ ] **Step 3: Commit**

```bash
git add src/pages/api/confirm-lead.ts
git commit -m "feat: add confirm-lead GET endpoint — DOI confirmation for manual lead magnets"
```

---

## Task 4: confirm-report endpoint (calculators)

**Files:**
- Create: `src/pages/api/confirm-report.ts`

- [ ] **Step 1: Create `src/pages/api/confirm-report.ts`**

```typescript
// src/pages/api/confirm-report.ts
// GET endpoint — called by Brevo DOI redirect for ROI/KA calculator leads
// Retrieves stored PDF from SQLite and sends it via Brevo

import type { APIRoute } from 'astro';
import { findRegistrationByRef, confirmRegistrationByRef, findKapitalanlegerByRef, confirmKapitalanlegerByRef } from '../../lib/db';
import { sendTransactionalEmail } from '../../lib/brevo';

export const prerender = false;

const NOTIFY_EMAIL = process.env.NOTIFY_EMAIL || 'office@wirkaufendeineimmobilie.de';

export const GET: APIRoute = async ({ url }) => {
  const ref = url.searchParams.get('ref');

  if (!ref) {
    return Response.redirect(new URL('/danke?typ=doi-fehler', url.origin), 302);
  }

  // Determine record type by prefix
  const isKA = ref.startsWith('KA-');
  const record = isKA ? findKapitalanlegerByRef(ref) : findRegistrationByRef(ref);

  if (!record) {
    return Response.redirect(new URL('/danke?typ=doi-fehler', url.origin), 302);
  }

  // already confirmed — idempotent, don't re-send PDF
  if (record.doi_confirmed) {
    return Response.redirect(new URL('/danke?typ=report-versendet', url.origin), 302);
  }

  const pdfBase64 = record.pdf_base64 as string | undefined;
  if (!pdfBase64) {
    // PDF not stored — fallback to doi-fehler (should not happen)
    return Response.redirect(new URL('/danke?typ=doi-fehler', url.origin), 302);
  }

  const vorname = (record.vorname as string) || 'Interessent';
  const email = record.email as string;
  const refNr = ref;

  const pdfName = isKA ? `KA-Analyse-${refNr}.pdf` : `ROI-Analyse-${refNr}.pdf`;
  const subject = isKA
    ? `Deine Kapitalanleger-Analyse — Ref ${refNr}`
    : `Deine persönliche Deal-Analyse — Ref ${refNr}`;

  // Mark confirmed FIRST — idempotency guard fires on any retry regardless of email outcome
  if (isKA) {
    confirmKapitalanlegerByRef(ref);
  } else {
    confirmRegistrationByRef(ref);
  }

  try {
    // Send PDF to user
    await sendTransactionalEmail({
      to: { email, name: vorname },
      subject,
      htmlContent: `<p>Hallo ${vorname},</p>
<p>anbei deine persönliche Analyse mit der Referenznummer <strong>${refNr}</strong>.</p>
<p>Das PDF enthält deine vollständige Kalkulation und nächste Empfehlungen.</p>
<p>Bei Fragen: office@wirkaufendeineimmobilie.de</p>
<br><p>Beste Grüße,<br>Joachim Kleinke</p>`,
      attachments: [{ content: pdfBase64, name: pdfName }],
    });

    // Notify Joachim
    await sendTransactionalEmail({
      to: { email: NOTIFY_EMAIL, name: 'Joachim Kleinke' },
      subject: `DOI bestätigt + Report gesendet: ${vorname} — ${refNr}`,
      htmlContent: `<p>DOI bestätigt. Report wurde an ${email} gesendet.</p><p>Ref: ${refNr}</p>`,
    });
  } catch {
    // email failure must not block the redirect — Joachim can follow up manually via ref in DB
  }

  return Response.redirect(new URL('/danke?typ=report-versendet', url.origin), 302);
};
```

- [ ] **Step 2: Run build**

```bash
cd ~/code/wkdi-temp/website && npm run build 2>&1 | tail -10
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/api/confirm-report.ts
git commit -m "feat: add confirm-report GET endpoint — DOI confirmation + stored PDF send"
```

---

## Task 5: ROI-report API refactor (store-first + DOI)

**Files:**
- Modify: `src/pages/api/roi-report.ts`

- [ ] **Step 1: Read current `src/pages/api/roi-report.ts` fully** (already done — 137 lines)

Key changes needed:
1. Import `generateRefNr`, `buildDoiRedirectUrl` from `../../lib/ref`
2. Import `triggerBrevoDoubleOptIn` from `../../lib/db`
3. Generate PDF as before, but store `pdfBase64` in SQLite instead of sending
4. Call `insertRegistration` with `ref_nr`, `doi_confirmed: 0`, `pdf_base64`
5. Trigger DOI instead of sending email
6. Return `{ success: true, status: 'doi_pending' }` — no more `result` in response (user hasn't confirmed yet)

- [ ] **Step 2: Replace `src/pages/api/roi-report.ts`**

```typescript
import type { APIRoute } from 'astro';
import puppeteer from 'puppeteer';
import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { calcRoi } from '../../lib/roi-calc';
import type { RoiInput } from '../../lib/roi-calc';
import { generatePdfHtml } from '../../lib/roi-pdf';
import { insertRegistration, triggerBrevoDoubleOptIn } from '../../lib/db';
import { generateRefNr, buildDoiRedirectUrl } from '../../lib/ref';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const portraitPath = join(__dirname, '../../../../public/images/joachim-kleinke-portrait.jpg');
let portraitB64 = '';
try {
  portraitB64 = `data:image/jpeg;base64,${readFileSync(portraitPath).toString('base64')}`;
} catch { /* portrait optional */ }

export const prerender = false;

const BREVO_DOI_TEMPLATE_ID = Number(process.env.BREVO_DOI_TEMPLATE_ID) || 0;
const BREVO_LIST_ID_ROI = Number(process.env.BREVO_LIST_ID_ROI) || 0;
const SITE_BASE_URL = process.env.SITE_URL || 'https://wirkaufendeineimmobilie.de';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { vorname, email, objekt_typ, stadtteil, kaufpreis, wohnflaeche, sanierungskosten, exit_strategie, eigenkapital_pct } = body;

    const requiredFields = { vorname, email, objekt_typ, stadtteil, kaufpreis, wohnflaeche, sanierungskosten, exit_strategie, eigenkapital_pct };
    const missingFields = Object.entries(requiredFields)
      .filter(([, v]) => v === undefined || v === null || v === '')
      .map(([k]) => k);

    if (missingFields.length > 0) {
      return new Response(
        JSON.stringify({ success: false, error: `Pflichtfelder fehlen: ${missingFields.join(', ')}` }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const input: RoiInput = {
      objekt_typ,
      stadtteil,
      kaufpreis: Number(kaufpreis),
      wohnflaeche: Number(wohnflaeche),
      sanierungskosten: Number(sanierungskosten),
      exit_strategie,
      eigenkapital_pct: Number(eigenkapital_pct),
    };

    const result = calcRoi(input);
    const refNr = generateRefNr('WKDI');
    const datum = new Date().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const html = generatePdfHtml({ input, result, vorname, email, refNr, datum, portraitB64 });

    // Generate PDF and store as base64 — sent AFTER DOI confirmation
    const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
    const browser = await puppeteer.launch({
      executablePath: executablePath || undefined,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
      headless: true,
    });
    let pdfBase64: string;
    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });
      const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
      pdfBase64 = Buffer.from(pdfBuffer).toString('base64');
    } finally {
      await browser.close();
    }

    // Store in DB — doi_confirmed=0, pdf_base64 stored for retrieval in confirm-report
    insertRegistration({
      typ: 'lead-magnet',
      email,
      name: vorname,
      lead_magnet_typ: 'roi-rechner',
      ref_nr: refNr,
      doi_confirmed: 0,
      pdf_base64: pdfBase64,
      lead_magnet_data: JSON.stringify({ ...input, result, refNr }),
    });

    // Trigger DOI — Brevo sends confirmation email, user clicks → confirm-report
    if (BREVO_DOI_TEMPLATE_ID && BREVO_LIST_ID_ROI) {
      const redirectionUrl = buildDoiRedirectUrl(SITE_BASE_URL, 'confirm-report', refNr);
      try {
        await triggerBrevoDoubleOptIn({
          email,
          name: vorname,
          typ: 'roi-rechner',
          listId: BREVO_LIST_ID_ROI,
          templateId: BREVO_DOI_TEMPLATE_ID,
          redirectionUrl,
        });
      } catch (doiErr) {
        console.error('[roi-report] DOI trigger failed:', doiErr);
        // Fail the whole request — user must retry, otherwise they'll never receive the confirmation email
        throw doiErr;
      }
    }

    return new Response(
      JSON.stringify({ success: true, status: 'doi_pending', refNr }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unbekannter Fehler';
    console.error('[roi-report] Error:', message);
    return new Response(
      JSON.stringify({ success: false, error: 'Interner Fehler. Bitte erneut versuchen.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
```

- [ ] **Step 3: Update roi-rechner.astro — after form submit, show "Fast fertig" screen**

In `src/pages/roi-rechner.astro`, find the JavaScript submit handler that currently calls `/api/roi-report`. The handler currently redirects to `/danke` on success. Change the success handler to show an inline "Fast fertig" screen instead. Add this screen to the HTML (hidden by default):

Find the submit result handler in the `<script>` block (it calls `fetch('/api/roi-report', ...)`) and change the success branch from redirecting to `showDoiPendingScreen()`. Add this function and HTML:

In the `<!-- QUIZ WRAPPER -->` section, add before the closing `</section>`:
```html
<!-- DOI Pending Screen (shown after successful submit) -->
<div id="doi-pending-screen" style="display:none; max-width:640px; margin:0 auto; padding:var(--space-16) var(--space-6); text-align:center;">
  <div style="font-size:3rem; margin-bottom:var(--space-4);">✉️</div>
  <h2>Fast fertig — check deine E-Mails</h2>
  <p style="color:var(--color-text-mid); font-size:var(--text-lg); margin:var(--space-4) 0 var(--space-6);">
    Wir haben dir gerade eine E-Mail von <strong>office@wirkaufendeineimmobilie.de</strong> geschickt.
    Klick auf den Bestätigungslink darin — dann erhältst du sofort deine persönliche Deal-Analyse.
  </p>
  <div style="background:var(--color-bg-card); border:1px solid var(--color-border); border-radius:var(--radius-lg); padding:var(--space-6); text-align:left; margin-bottom:var(--space-6);">
    <p style="font-weight:var(--weight-semibold); margin-bottom:var(--space-3);">Was dich erwartet:</p>
    <ul style="list-style:none; display:flex; flex-direction:column; gap:var(--space-2);">
      <li>✓ Deal-Score für deinen Stadtteil</li>
      <li>✓ ROI + Eigenkapital-Rendite</li>
      <li>✓ Break-even Analyse</li>
      <li>✓ Nächste konkrete Schritte</li>
    </ul>
  </div>
  <p style="font-size:var(--text-sm); color:var(--color-text-muted);">⚠️ Mail nicht da? Schau in deinen Spam-Ordner.</p>
</div>
```

In the `<script>` block, find where `window.location.href = '/danke?...'` is called on success and replace with:
```javascript
function showDoiPendingScreen() {
  document.getElementById('quiz-progress')?.style.setProperty('display', 'none');
  document.querySelectorAll('.quiz-step').forEach(el => (el as HTMLElement).style.display = 'none');
  const pending = document.getElementById('doi-pending-screen');
  if (pending) pending.style.display = 'block';
}
// In the fetch success handler, replace redirect with:
showDoiPendingScreen();
```

- [ ] **Step 4: Run build**

```bash
cd ~/code/wkdi-temp/website && npm run build 2>&1 | tail -10
```

- [ ] **Step 5: Commit**

```bash
git add src/pages/api/roi-report.ts src/pages/roi-rechner.astro
git commit -m "feat: roi-report stores PDF first, triggers DOI — PDF sent after email confirmation"
```

---

## Task 6: KA-report API refactor (same pattern as ROI)

**Files:**
- Modify: `src/pages/api/kapitalanleger-report.ts`
- Modify: `src/pages/kapitalanleger-rechner.astro`

- [ ] **Step 1: Apply same store-first + DOI pattern to `src/pages/api/kapitalanleger-report.ts`**

Follow the exact same pattern as Task 5 roi-report.ts, with these differences:
- Import `insertKapitalanlegerLead` instead of `insertRegistration`
- Use `generateRefNr('KA')` for the prefix
- Use `BREVO_LIST_ID_KAPITALANLEGER` list ID
- Store in `leads_kapitalanleger` table (which already has `ref_nr`, `doi_confirmed`, `pdf_base64` from Task 1)
- PDF generation uses `generateKapitalanlegerPdfHtml` (already imported)
- Return `{ success: true, status: 'doi_pending', refNr }`

**Complete `insertKapitalanlegerLead` call with all new fields:**

```typescript
insertKapitalanlegerLead({
  vorname,
  email,
  kaufpreis: Number(kaufpreis),
  baujahr: Number(baujahr),
  wohnflaeche: Number(wohnflaeche),
  kaltmiete: Number(kaltmiete),
  hausgeld: Number(hausgeld),
  darlehen: Number(darlehen),
  zinssatz: Number(zinssatz),
  tilgung: Number(tilgung),
  grenzsteuersatz: Number(grenzsteuersatz),
  haltedauer: Number(haltedauer ?? 10),
  gebaeudeanteil: Number(gebaeudeanteil ?? 80),
  netto_cashflow_monat: result.nettoCashflowMonat,
  kaufpreisfaktor: result.kaufpreisfaktor,
  afa_jahr: result.jahresAfA,
  npv_10j: result.npv10j,
  npv_20j: result.npv20j,
  brutto_rendite: result.bruttoRendite,
  ref_nr: refNr,           // NEW — Task 1 column
  doi_confirmed: 0,        // NEW — Task 1 column
  pdf_base64: pdfBase64,   // NEW — Task 1 column
});
```

`insertKapitalanlegerLead` uses the same dynamic `Object.keys(data)` column building as `insertRegistration` — adding new fields to the object automatically inserts them.

- [ ] **Step 2: Update `src/pages/kapitalanleger-rechner.astro` — show "Fast fertig" screen on success**

Same pattern as roi-rechner.astro in Task 5 Step 3. Add the `doi-pending-screen` HTML and update the submit handler to call `showDoiPendingScreen()` instead of redirecting.

Benefits text for this screen:
```
✓ Netto-Cashflow / Monat
✓ AfA-Vorteil / Jahr (§7 EStG)
✓ NPV-Szenarien (10J + 20J)
✓ Kaufpreisfaktor + Brutto-Rendite
```

- [ ] **Step 3: Run build**

```bash
cd ~/code/wkdi-temp/website && npm run build 2>&1 | tail -10
```

- [ ] **Step 4: Commit**

```bash
git add src/pages/api/kapitalanleger-report.ts src/pages/kapitalanleger-rechner.astro
git commit -m "feat: kapitalanleger-report stores PDF first, triggers DOI — same pattern as roi-report"
```

---

## Task 7: Lead-magnet API — DOI per segment

**Files:**
- Modify: `src/pages/api/lead-magnet.ts`

- [ ] **Step 1: Replace `src/pages/api/lead-magnet.ts`**

```typescript
import type { APIRoute } from 'astro';
import { insertRegistration, triggerBrevoDoubleOptIn } from '../../lib/db';
import { generateRefNr, buildDoiRedirectUrl } from '../../lib/ref';

export const prerender = false;

const BREVO_DOI_TEMPLATE_ID = Number(process.env.BREVO_DOI_TEMPLATE_ID) || 0;
const SITE_BASE_URL = process.env.SITE_URL || 'https://wirkaufendeineimmobilie.de';

const LIST_IDS: Record<string, number> = {
  'aktionsplan-erben':  Number(process.env.BREVO_LIST_ID_ERBEN) || 0,
  'blueprint':          Number(process.env.BREVO_LIST_ID_BLUEPRINT) || 0,
  'kompass':            Number(process.env.BREVO_LIST_ID_KOMPASS) || 0,
  'scheidung':          Number(process.env.BREVO_LIST_ID_SCHEIDUNG) || 0,
  'umzug':              Number(process.env.BREVO_LIST_ID_UMZUG) || 0,
};

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
  const email = data.get('email') as string;
  const name = (data.get('name') as string) || '';
  // from_questionnaire=1 means questionnaire data is being submitted — skip DOI
  const fromQuestionnaire = data.get('from_questionnaire') === '1';

  if (!email) {
    return new Response(JSON.stringify({ success: false, error: 'E-Mail fehlt' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const extraData: Record<string, unknown> = {};

  if (typ === 'aktionsplan-erben') {
    extraData.lead_magnet_data = JSON.stringify({
      anzahl_erben: data.get('anzahl_erben'),
      wer_blockiert: data.get('wer_blockiert'),
      blockade_dauer: data.get('blockade_dauer'),
      situation: data.get('situation'),
      objekt_typ: data.get('objekt_typ'),
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
  } else if (typ === 'scheidung') {
    extraData.lead_magnet_data = JSON.stringify({
      einigung: data.get('einigung'),
      zeitdruck: data.get('zeitdruck'),
    });
    extraData.plz = data.get('plz');
  } else if (typ === 'umzug') {
    extraData.lead_magnet_data = JSON.stringify({
      zeitpunkt: data.get('zeitpunkt'),
      leer: data.get('leer'),
    });
    extraData.plz = data.get('plz');
  }

  const refNr = generateRefNr();

  insertRegistration({
    typ: 'lead-magnet',
    email,
    name,
    lead_magnet_typ: typ,
    ref_nr: refNr,
    doi_confirmed: 0,
    ...extraData,
  });

  // Trigger DOI only for initial email-gate submissions (not questionnaire follow-ups)
  if (!fromQuestionnaire && BREVO_DOI_TEMPLATE_ID) {
    const listId = LIST_IDS[typ] || 0;
    if (listId) {
      const redirectionUrl = buildDoiRedirectUrl(SITE_BASE_URL, 'confirm-lead', refNr);
      try {
        await triggerBrevoDoubleOptIn({
          email,
          name,
          typ,
          listId,
          templateId: BREVO_DOI_TEMPLATE_ID,
          redirectionUrl,
        });
      } catch (doiErr) {
        console.error('[lead-magnet] DOI trigger failed:', doiErr);
        // Fail the request — user must retry, otherwise no confirmation email arrives
        return new Response(JSON.stringify({ success: false, error: 'E-Mail konnte nicht gesendet werden. Bitte erneut versuchen.' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }
  }

  return new Response(JSON.stringify({ success: true, status: fromQuestionnaire ? 'saved' : 'doi_pending' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
```

- [ ] **Step 2: Run build**

```bash
cd ~/code/wkdi-temp/website && npm run build 2>&1 | tail -10
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/api/lead-magnet.ts
git commit -m "feat: lead-magnet API — DOI per segment with dynamic redirect URL, skip DOI for questionnaire submits"
```

---

## Task 8: Email gates on 3 existing LM index pages

This task adds an email gate to all three existing lead magnet landing pages. The gate replaces the "Jetzt starten →" CTA. After submit, an inline "Fast fertig" screen is shown. The questionnaire (start.astro) remains accessible via the Welcome email link.

Also update each start.astro to pass `from_questionnaire=1` so the API skips DOI on questionnaire submits.

**Files:**
- Modify: `src/pages/aktionsplan-erbengemeinschaft/index.astro`
- Modify: `src/pages/aktionsplan-erbengemeinschaft/start.astro`
- Modify: `src/pages/90-tage-blueprint/index.astro`
- Modify: `src/pages/90-tage-blueprint/start.astro`
- Modify: `src/pages/entscheidungskompass-betreuung/index.astro`
- Modify: `src/pages/entscheidungskompass-betreuung/start.astro`

### 8a — Aktionsplan Erbengemeinschaft

- [ ] **Step 1: Replace CTA button in `aktionsplan-erbengemeinschaft/index.astro`**

Find the line:
```html
<a href="/aktionsplan-erbengemeinschaft/start" class="btn btn-primary ap-hero__cta">Jetzt starten &rarr;</a>
```

Replace with the email gate form + "Fast fertig" screen:
```html
<!-- EMAIL GATE -->
<div id="email-gate" class="ap-email-gate">
  <p class="ap-email-gate__label">Wohin sollen wir deinen Aktionsplan schicken?</p>
  <form id="gate-form" class="ap-email-gate__form" novalidate>
    <input type="text" name="website" style="display:none" tabindex="-1" autocomplete="off" />
    <input type="hidden" name="typ" value="aktionsplan-erben" />
    <div class="ap-gate-row">
      <input type="text" name="name" placeholder="Dein Vorname" class="ap-gate-input" />
      <input type="email" name="email" placeholder="Deine E-Mail *" required class="ap-gate-input" />
    </div>
    <FormPrivacyHint />
    <button type="submit" class="btn btn-primary ap-hero__cta">Aktionsplan anfordern &rarr;</button>
  </form>
</div>

<!-- FAST FERTIG SCREEN (hidden until submit) -->
<div id="doi-pending" class="ap-doi-pending" hidden>
  <div class="ap-doi-icon">✉️</div>
  <h3>Fast fertig — check deine E-Mails!</h3>
  <p>Wir haben dir gerade eine E-Mail von <strong>office@wirkaufendeineimmobilie.de</strong> geschickt.
     Klick auf den Bestätigungslink — dann erhältst du deinen Aktionsplan.</p>
  <div class="ap-doi-benefits">
    <p>Was dich erwartet:</p>
    <ul>
      <li>✓ 7 priorisierte Schritte für deine Situation</li>
      <li>✓ Blockade-Kosten-Rechner (was dich der Stillstand kostet)</li>
      <li>✓ Verhandlungs-Skript für den blockierenden Erben</li>
      <li>✓ Marktwert-Schätzung für dein Objekt</li>
    </ul>
  </div>
  <p class="ap-doi-spam">⚠️ Mail nicht da? Schau in deinen Spam-Ordner.</p>
</div>
```

Also add import at the top of the frontmatter:
```astro
---
import Layout from '../../layouts/Layout.astro';
import FormPrivacyHint from '../../components/FormPrivacyHint.astro';
---
```

Add script block before closing `</Layout>`:
```html
<script>
  const form = document.getElementById('gate-form') as HTMLFormElement;
  const gate = document.getElementById('email-gate') as HTMLElement;
  const pending = document.getElementById('doi-pending') as HTMLElement;

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const emailInput = form.querySelector('[name="email"]') as HTMLInputElement;
    if (!emailInput.value) { emailInput.focus(); return; }

    const checkbox = form.querySelector('[name="datenschutz_ok"]') as HTMLInputElement;
    if (checkbox && !checkbox.checked) { checkbox.focus(); return; }

    const btn = form.querySelector('button[type="submit"]') as HTMLButtonElement;
    btn.textContent = 'Wird gesendet...';
    btn.disabled = true;

    try {
      const fd = new FormData(form);
      const res = await fetch('/api/lead-magnet', { method: 'POST', body: fd });
      if (res.ok) {
        gate.hidden = true;
        pending.hidden = false;
      } else {
        btn.textContent = 'Fehler — erneut versuchen';
        btn.disabled = false;
      }
    } catch {
      btn.textContent = 'Fehler — erneut versuchen';
      btn.disabled = false;
    }
  });
</script>
```

Add CSS for the new elements in the `<style>` block:
```css
.ap-email-gate { width: 100%; max-width: 560px; }
.ap-email-gate__label { font-weight: var(--weight-semibold); margin-bottom: var(--space-3); }
.ap-email-gate__form { display: flex; flex-direction: column; gap: var(--space-3); }
.ap-gate-row { display: flex; gap: var(--space-3); }
.ap-gate-input {
  flex: 1; padding: var(--space-3) var(--space-4);
  border: 2px solid var(--color-border); border-radius: var(--radius-md);
  font-family: var(--font-family); font-size: var(--text-base);
  background: var(--color-bg); color: var(--color-text); min-height: 48px;
}
.ap-gate-input:focus { outline: none; border-color: var(--color-accent); }
@media (max-width: 560px) { .ap-gate-row { flex-direction: column; } }
.ap-doi-pending { width: 100%; max-width: 560px; text-align: center; }
.ap-doi-icon { font-size: 3rem; margin-bottom: var(--space-3); }
.ap-doi-pending h3 { margin-bottom: var(--space-3); }
.ap-doi-pending p { color: var(--color-text-mid); line-height: var(--leading-relaxed); }
.ap-doi-benefits {
  background: var(--color-bg-card); border: 1px solid var(--color-border);
  border-radius: var(--radius-lg); padding: var(--space-5); text-align: left;
  margin: var(--space-4) 0;
}
.ap-doi-benefits p { font-weight: var(--weight-semibold); color: var(--color-text); margin-bottom: var(--space-2); }
.ap-doi-benefits ul { list-style: none; display: flex; flex-direction: column; gap: var(--space-2); font-size: var(--text-sm); color: var(--color-text-mid); }
.ap-doi-spam { font-size: var(--text-sm); color: var(--color-text-muted); margin-top: var(--space-3); }
```

- [ ] **Step 2: Add `from_questionnaire=1` to `aktionsplan-erbengemeinschaft/start.astro`**

In the `<script>` block, find where `formData.append('typ', 'aktionsplan-erben')` is set (around line 515) and add:
```javascript
formData.append('from_questionnaire', '1');
```

- [ ] **Step 3: Apply same email gate pattern to `90-tage-blueprint/index.astro`**

Same structure as Step 1. Differences:
- `typ` value: `blueprint`
- Benefits text:
  - ✓ 90-Tage-Fahrplan für deinen ersten Flip
  - ✓ Budgetplanung + Kostenpuffer-Rechner
  - ✓ Handwerker-Auswahl Checkliste
  - ✓ Typische Anfängerfehler + wie du sie vermeidest
- FormPrivacyHint import already in frontmatter (check — add if missing)

- [ ] **Step 4: Add `from_questionnaire=1` to `90-tage-blueprint/start.astro`**

Find the formData append block in the `<script>` and add:
```javascript
formData.append('from_questionnaire', '1');
```

- [ ] **Step 5: Apply same email gate pattern to `entscheidungskompass-betreuung/index.astro`**

Differences:
- `typ` value: `kompass`
- Benefits text:
  - ✓ Rechte & Pflichten als Betreuer / Vormund
  - ✓ Schritt-für-Schritt Entscheidungsbaum
  - ✓ Wann brauchst du das Betreuungsgericht?
  - ✓ Lokale Ansprechpartner in deiner Region

- [ ] **Step 6: Add `from_questionnaire=1` to `entscheidungskompass-betreuung/start.astro`**

Same as Steps 2 and 4.

- [ ] **Step 7: Run build**

```bash
cd ~/code/wkdi-temp/website && npm run build 2>&1 | tail -10
```

- [ ] **Step 8: Commit**

```bash
git add src/pages/aktionsplan-erbengemeinschaft/ src/pages/90-tage-blueprint/ src/pages/entscheidungskompass-betreuung/
git commit -m "feat: add DOI email gates to 3 existing lead magnet landing pages"
```

---

## Task 9: New LM — /scheidung

**Files:**
- Create: `src/pages/scheidung/index.astro`
- Create: `src/pages/scheidung/start.astro`

- [ ] **Step 1: Create `src/pages/scheidung/index.astro`**

Model after `aktionsplan-erbengemeinschaft/index.astro` structure. Key differences:

```astro
---
import Layout from '../../layouts/Layout.astro';
import FormPrivacyHint from '../../components/FormPrivacyHint.astro';
---
<Layout
  title="Immobilie bei Scheidung verkaufen Leipzig — Schnell-Aktionsplan | wirkaufendeineimmobilie.de"
  description="Scheidungsimmobilie in Leipzig verkaufen — diskret, schnell, ohne Streit. Joachim Kleinke erstellt deinen persönlichen Aktionsplan. Kostenlos."
>

  <section class="section ap-hero">
    <div class="container ap-hero__inner">
      <div class="label">Für Scheidungsimmobilien in Leipzig</div>
      <h1>Immobilie bei Scheidung —<br /><span class="text-accent">klar geregelt in 3 Schritten</span></h1>
      <p class="ap-hero__sub">
        Scheidung ist stressig genug. Wir kümmern uns um den Immobilienverkauf —
        diskret, schnell und ohne dass ihr euch auf den Kaufpreis einigen müsst.
        Joachim Kleinke erstellt dir einen persönlichen Aktionsplan für deine Situation.
      </p>

      <div id="email-gate" class="ap-email-gate">
        <p class="ap-email-gate__label">Wohin sollen wir deinen Aktionsplan schicken?</p>
        <form id="gate-form" class="ap-email-gate__form" novalidate>
          <input type="text" name="website" style="display:none" tabindex="-1" autocomplete="off" />
          <input type="hidden" name="typ" value="scheidung" />
          <div class="ap-gate-row">
            <input type="text" name="name" placeholder="Dein Vorname" class="ap-gate-input" />
            <input type="email" name="email" placeholder="Deine E-Mail *" required class="ap-gate-input" />
          </div>
          <FormPrivacyHint />
          <button type="submit" class="btn btn-primary ap-hero__cta">Aktionsplan anfordern &rarr;</button>
        </form>
      </div>

      <div id="doi-pending" class="ap-doi-pending" hidden>
        <div class="ap-doi-icon">✉️</div>
        <h3>Fast fertig — check deine E-Mails!</h3>
        <p>Wir haben dir gerade eine E-Mail von <strong>office@wirkaufendeineimmobilie.de</strong> geschickt.
           Klick auf den Bestätigungslink — dann erhältst du deinen persönlichen Aktionsplan.</p>
        <div class="ap-doi-benefits">
          <p>Was dich erwartet:</p>
          <ul>
            <li>✓ Schnell-Aktionsplan auf deine Situation zugeschnitten</li>
            <li>✓ Was passiert wenn kein Einverständnis besteht</li>
            <li>✓ Diskreter Verkauf ohne Makler-Ghosting</li>
            <li>✓ Joachim Kleinke antwortet persönlich</li>
          </ul>
        </div>
        <p class="ap-doi-spam">⚠️ Mail nicht da? Schau in deinen Spam-Ordner.</p>
      </div>
    </div>
  </section>

</Layout>

<style>
  /* Reuse same CSS as aktionsplan-erbengemeinschaft/index.astro — copy ap-hero, ap-email-gate, ap-doi-pending styles */
  /* (copy the relevant .ap-* classes from aktionsplan-erbengemeinschaft/index.astro) */
</style>

<script>
  /* Same JS as aktionsplan-erbengemeinschaft/index.astro — copy verbatim */
</script>
```

**Important:** Copy the `<style>` block's `.ap-hero`, `.ap-email-gate`, `.ap-gate-*`, `.ap-doi-*` CSS from `aktionsplan-erbengemeinschaft/index.astro`. Copy the `<script>` block verbatim.

- [ ] **Step 2: Create `src/pages/scheidung/start.astro`**

3-question wizard, follows same wizard pattern as `aktionsplan-erbengemeinschaft/start.astro`.

```astro
---
import Layout from '../../layouts/Layout.astro';
import FormPrivacyHint from '../../components/FormPrivacyHint.astro';
---
<Layout
  title="Scheidungsimmobilie — 3 kurze Fragen"
  description="3 Fragen zu deiner Situation. Joachim Kleinke erstellt deinen persönlichen Aktionsplan."
  noindex={true}
>
  <section class="section">
    <div class="container">
      <div class="wizard">
        <div class="wizard-progress"><div class="wizard-progress-fill" style="width: 33%"></div></div>
        <div class="wizard-step-label">Schritt 1 von 3</div>

        <!-- Step 1: Einigung -->
        <div class="wizard-step" data-step="1">
          <h2>Besteht eine Einigung mit deinem Partner?</h2>
          <p class="text-mid">Das bestimmt welche Optionen realistisch sind.</p>
          <div class="wizard-options">
            <button type="button" data-value="ja" data-field="einigung">Ja, wir sind einig</button>
            <button type="button" data-value="nein" data-field="einigung">Nein, kein Einverständnis</button>
            <button type="button" data-value="verhandlung" data-field="einigung">In Verhandlung</button>
            <button type="button" data-value="getrennt" data-field="einigung">Bereits getrennt, noch kein Vertrag</button>
          </div>
        </div>

        <!-- Step 2: Zeitdruck -->
        <div class="wizard-step" data-step="2" hidden>
          <button type="button" class="wizard-back" onclick="goToStep(1)">&larr; Zurück</button>
          <h2>Wie dringend ist der Verkauf?</h2>
          <p class="text-mid">Damit wir die richtigen Käufer ansprechen.</p>
          <div class="wizard-options">
            <button type="button" data-value="sofort" data-field="zeitdruck">Sofort — so schnell wie möglich</button>
            <button type="button" data-value="3monate" data-field="zeitdruck">Innerhalb von 3 Monaten</button>
            <button type="button" data-value="kein-druck" data-field="zeitdruck">Kein akuter Zeitdruck</button>
          </div>
        </div>

        <!-- Step 3: PLZ + Kontakt -->
        <div class="wizard-step wizard-final" data-step="3" hidden>
          <button type="button" class="wizard-back" onclick="goToStep(2)">&larr; Zurück</button>
          <h2>PLZ der Immobilie + deine Kontaktdaten</h2>
          <div class="wizard-inputs">
            <div class="form-group">
              <label for="wizard-plz">PLZ der Immobilie</label>
              <input type="text" id="wizard-plz" name="plz" pattern="[0-9]{5}" maxlength="5" inputmode="numeric" placeholder="04315" />
            </div>
            <div class="form-group">
              <label for="wizard-name">Dein Name</label>
              <input type="text" id="wizard-name" name="name" placeholder="Max Mustermann" />
            </div>
            <div class="form-group">
              <label for="wizard-email">Deine E-Mail *</label>
              <input type="email" id="wizard-email" name="email" required placeholder="max@beispiel.de" />
            </div>
          </div>
          <button type="button" class="btn btn-primary wizard-submit">Aktionsplan erstellen lassen &rarr;</button>
          <FormPrivacyHint />
        </div>

        <!-- Confirmation Screen -->
        <div class="wizard-step wizard-confirmation" data-step="done" hidden>
          <div class="confirmation-icon">&#10003;</div>
          <h2>Vielen Dank für deine Angaben!</h2>
          <p>Joachim Kleinke schaut sich deine Situation an und meldet sich innerhalb von 24 Stunden persönlich bei dir.</p>
          <a href="/" class="btn btn-primary" style="margin-top: var(--space-6);">Zurück zur Startseite</a>
        </div>
      </div>
    </div>
  </section>
</Layout>

<style>
  /* Copy wizard styles from aktionsplan-erbengemeinschaft/start.astro */
</style>

<script>
  const answers: Record<string, string> = {};
  let currentStep = 1;
  const totalSteps = 3;

  document.querySelectorAll('.wizard-options button').forEach(btn => {
    btn.addEventListener('click', () => {
      const field = (btn as HTMLElement).dataset.field!;
      const value = (btn as HTMLElement).dataset.value!;
      answers[field] = value;
      btn.parentElement!.querySelectorAll('button').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      setTimeout(() => goToStep(currentStep + 1), 300);
    });
  });

  function updateProgress() {
    const bar = document.querySelector('.wizard-progress-fill') as HTMLElement;
    bar.style.width = `${(currentStep / totalSteps) * 100}%`;
    const label = document.querySelector('.wizard-step-label') as HTMLElement;
    label.textContent = `Schritt ${currentStep} von ${totalSteps}`;
  }

  function goToStep(step: number) {
    if (step < 1 || step > totalSteps) return;
    const current = document.querySelector(`[data-step="${currentStep}"]`) as HTMLElement;
    const next = document.querySelector(`[data-step="${step}"]`) as HTMLElement;
    current.hidden = true;
    next.hidden = false;
    currentStep = step;
    updateProgress();
  }

  function showConfirmation() {
    const current = document.querySelector(`[data-step="${currentStep}"]`) as HTMLElement;
    const done = document.querySelector('[data-step="done"]') as HTMLElement;
    const progress = document.querySelector('.wizard-progress') as HTMLElement;
    const label = document.querySelector('.wizard-step-label') as HTMLElement;
    current.hidden = true;
    progress.style.display = 'none';
    label.style.display = 'none';
    done.hidden = false;
  }

  (window as any).goToStep = goToStep;

  document.querySelector('.wizard-submit')?.addEventListener('click', async () => {
    const finalStep = document.querySelector('.wizard-final') as HTMLElement;
    const emailInput = finalStep.querySelector('[name="email"]') as HTMLInputElement;
    if (!emailInput.value) { emailInput.focus(); return; }

    const checkbox = finalStep.querySelector('[name="datenschutz_ok"]') as HTMLInputElement;
    if (checkbox && !checkbox.checked) { checkbox.focus(); return; }

    const btn = document.querySelector('.wizard-submit') as HTMLButtonElement;
    btn.textContent = 'Wird erstellt...';
    btn.disabled = true;

    const formData = new FormData();
    formData.append('typ', 'scheidung');
    formData.append('from_questionnaire', '1');
    Object.entries(answers).forEach(([k, v]) => formData.append(k, v));
    formData.append('plz', (finalStep.querySelector('[name="plz"]') as HTMLInputElement)?.value || '');
    formData.append('name', (finalStep.querySelector('[name="name"]') as HTMLInputElement)?.value || '');
    formData.append('email', emailInput.value);

    try {
      const res = await fetch('/api/lead-magnet', { method: 'POST', body: formData });
      if (res.ok) {
        showConfirmation();
      } else {
        btn.textContent = 'Fehler — erneut versuchen';
        btn.disabled = false;
      }
    } catch {
      btn.textContent = 'Fehler — erneut versuchen';
      btn.disabled = false;
    }
  });
</script>
```

- [ ] **Step 3: Run build**

```bash
cd ~/code/wkdi-temp/website && npm run build 2>&1 | tail -10
```

- [ ] **Step 4: Commit**

```bash
git add src/pages/scheidung/
git commit -m "feat: new /scheidung lead magnet — landing page + email gate + questionnaire"
```

---

## Task 10: New LM — /umzug

**Files:**
- Create: `src/pages/umzug/index.astro`
- Create: `src/pages/umzug/start.astro`

- [ ] **Step 1: Create `src/pages/umzug/index.astro`**

Same structure as `scheidung/index.astro`. Key differences:

- `typ` value: `umzug`
- Title: "Immobilie bei Umzug verkaufen Leipzig — Checkliste | wirkaufendeineimmobilie.de"
- Heading: "Verkauf bei Umzug —<br /><span class="text-accent">schnell und ohne Stress</span>"
- Subtitle: "Neue Stadt, neue Stelle — die Wohnung in Leipzig steht leer. Wir finden schnell geprüfte Käufer, damit du dich auf deinen Neustart konzentrieren kannst."
- CTA button text: "Checkliste anfordern →"
- Benefits:
  - ✓ Checkliste für stressfreien Verkauf unter Zeitdruck
  - ✓ Typischer Zeitplan: Bewertung bis Notartermin
  - ✓ Was wenn die Wohnung leer steht?
  - ✓ Joachim Kleinke antwortet persönlich

- [ ] **Step 2: Create `src/pages/umzug/start.astro`**

3-question wizard. Differences from scheidung/start.astro:

- `typ` value: `umzug`
- Step 1 question: "Wann ist der Umzug geplant?" — options: "Bereits erfolgt", "In 1–3 Monaten", "In 3–6 Monaten", "Noch unklar" — field: `zeitpunkt`
- Step 2 question: "Ist die Immobilie bereits leer?" — options: "Ja, bereits leer", "Nein, noch bewohnt" — field: `leer`
- Step 3: PLZ + Name + Email (same as scheidung)
- formData `typ`: `umzug`

- [ ] **Step 3: Run build**

```bash
cd ~/code/wkdi-temp/website && npm run build 2>&1 | tail -10
```

- [ ] **Step 4: Commit**

```bash
git add src/pages/umzug/
git commit -m "feat: new /umzug lead magnet — landing page + email gate + questionnaire"
```

---

## Task 11: Homepage contextual CTAs

**Files:**
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Add CTAs to 7 scenario cards in `src/pages/index.astro`**

Scenario cards are in the `.scenarios-grid` section (around line 160). Each card has the structure:
```html
<div class="scenario-card">
  <div class="scenario-bg">...</div>
  <div class="scenario-icon">...</div>
  <h3>Erbengemeinschaft</h3>
  <p>...</p>
  <!-- ADD CTA HERE -->
</div>
```

Add a CTA link after each `<p>` in the relevant cards:

**Erbengemeinschaft** (after its `<p>`):
```html
<a href="/aktionsplan-erbengemeinschaft" class="scenario-cta">Aktionsplan holen &rarr;</a>
```

**Messie-Objekt** (after its `<p>`):
```html
<a href="#hero-form" class="scenario-cta">Kostenlos bewerten &rarr;</a>
```

**Energetische Sanierung** (after its `<p>`):
```html
<a href="#hero-form" class="scenario-cta">Kostenlos bewerten &rarr;</a>
```

**Insolvenzverfahren** (after its `<p>`):
```html
<a href="#hero-form" class="scenario-cta">Kostenlos bewerten &rarr;</a>
```

**Kapitalanleger mit Renovierungsdruck** (after its `<p>`):
```html
<a href="/roi-rechner" class="scenario-cta scenario-cta--highlight">ROI berechnen &rarr;</a>
```

**Scheidung** (after its `<p>`):
```html
<a href="/scheidung" class="scenario-cta">Schnell-Aktionsplan holen &rarr;</a>
```

**Beruflicher Umzug / Zeitdruck** (after its `<p>`):
```html
<a href="/umzug" class="scenario-cta">Checkliste holen &rarr;</a>
```

Add CSS in the `<style>` block:
```css
.scenario-cta {
  display: inline-block;
  margin-top: var(--space-3);
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
  color: var(--color-accent);
  text-decoration: none;
  transition: color var(--duration-fast) var(--ease-default);
}
.scenario-cta:hover { color: var(--color-accent-hover); }
.scenario-cta--highlight { color: var(--color-accent); }
```

- [ ] **Step 2: Run build**

```bash
cd ~/code/wkdi-temp/website && npm run build 2>&1 | tail -10
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat: add contextual CTAs to homepage scenario cards"
```

---

## Task 12: Footer cleanup

**Files:**
- Modify: `src/components/Footer.astro`

- [ ] **Step 1: Remove lead magnet links from Footer navigation columns**

In `src/components/Footer.astro`, the "Für Verkäufer" column (around line 24-29) currently contains:
```html
<a href="/aktionsplan-erbengemeinschaft">Aktionsplan: Erbengemeinschaft</a>
<a href="/entscheidungskompass-betreuung">Kompass: Verkauf unter Betreuung</a>
```

Remove these two lines. Keep:
```html
<a href="/#bewertung">Immobilie bewerten</a>
<a href="/so-funktionierts">Ablauf für Verkäufer</a>
```

In the "Für Investoren" column (around line 33-37), remove:
```html
<a href="/90-tage-blueprint">Blueprint: Fix &amp; Flip</a>
```

Keep:
```html
<a href="/investoren">Investoren-Zugang</a>
<a href="/roi-rechner">ROI berechnen</a>
<a href="/tippgeber">Tippgeber-Programm</a>
```

- [ ] **Step 2: Run build**

```bash
cd ~/code/wkdi-temp/website && npm run build 2>&1 | tail -10
```

- [ ] **Step 3: Run all tests**

```bash
cd ~/code/wkdi-temp/website && npm run test
```

Expected: all tests pass

- [ ] **Step 4: Commit**

```bash
git add src/components/Footer.astro
git commit -m "feat: remove lead magnet links from footer — CTAs now on scenario cards"
```

---

## Final: Env vars checklist

Before deploy, add these to Coolify env for wirkaufendeineimmobilie.de:

```
BREVO_LIST_ID_ERBEN=        # ID from Brevo > Contacts > Lists
BREVO_LIST_ID_BLUEPRINT=
BREVO_LIST_ID_KOMPASS=
BREVO_LIST_ID_ROI=
BREVO_LIST_ID_KAPITALANLEGER=
BREVO_LIST_ID_SCHEIDUNG=
BREVO_LIST_ID_UMZUG=
BREVO_DOI_TEMPLATE_ID=      # ID from Brevo > Transactional > Templates (DOI template)
SITE_URL=https://wirkaufendeineimmobilie.de
```

**Brevo manual setup required (by Stefan) before the system is live:**
1. Create 7 lists in Brevo > Contacts > Lists
2. Create 1 DOI confirmation email template in Brevo > Transactional > Templates
3. Set up 7 Welcome Automations (1 per list) in Brevo > Automations
4. Add all IDs to Coolify env vars
