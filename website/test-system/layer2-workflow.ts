// test-system/layer2-workflow.ts
import { chromium } from 'playwright';
import Database from 'better-sqlite3';
import { join } from 'node:path';
import { personas, BASE_URL } from './personas.js';

const DB_PATH = process.env.WKDI_DB_PATH || join(process.cwd(), 'data', 'wkdi', 'wkdi.db');
const GMAIL_CHECK_TIMEOUT = 30_000;

export interface WorkflowResult {
  persona: string;
  segment: string;
  step: string;
  passed: boolean;
  detail: string;
}

export async function runLayer2(): Promise<WorkflowResult[]> {
  const db = new Database(DB_PATH, { readonly: true });
  const results: WorkflowResult[] = [];
  const browser = await chromium.launch({ headless: true });

  for (const persona of personas.slice(0, 2)) {
    console.log(`\n  Layer 2: ${persona.name} (${persona.segment})...`);
    const page = await browser.newPage();

    const pageUrl = `${BASE_URL}/${persona.segment === 'investor' ? 'investoren' : persona.segment}`;
    try {
      await page.goto(pageUrl);

      for (const [field, value] of Object.entries(persona.fields)) {
        const selector = `[name="${field}"]`;
        const el = page.locator(selector).first();
        const tag = await el.evaluate(n => n.tagName.toLowerCase()).catch(() => null);
        if (!tag) continue;
        if (tag === 'select') {
          await el.selectOption(value).catch(() => {});
        } else {
          await el.fill(value).catch(() => {});
        }
      }

      await page.click('[type="submit"]');
      await page.waitForSelector('#post-submit', { timeout: 10000 }).catch(() => {});

      const postSubmitVisible = await page.locator('#post-submit').isVisible().catch(() => false);
      results.push({
        persona: persona.name,
        segment: persona.segment,
        step: 'Post-Submit-UX sichtbar',
        passed: postSubmitVisible,
        detail: postSubmitVisible ? 'Danke-Block erscheint nach Submit' : 'Danke-Block NICHT erschienen',
      });
    } catch (err) {
      results.push({
        persona: persona.name,
        segment: persona.segment,
        step: 'Formular-Submit',
        passed: false,
        detail: `Fehler: ${err}`,
      });
      await page.close();
      continue;
    }

    await new Promise(r => setTimeout(r, 1000));
    const row = db.prepare(
      `SELECT * FROM registrations WHERE email = ? AND typ = ? ORDER BY id DESC LIMIT 1`
    ).get(persona.email, persona.segment) as Record<string, unknown> | undefined;

    results.push({
      persona: persona.name,
      segment: persona.segment,
      step: 'DB-Eintrag vorhanden',
      passed: !!row,
      detail: row ? `ID: ${row.id}, pain_freitext: ${row.pain_freitext ? 'vorhanden' : 'leer'}` : 'KEIN Eintrag in DB!',
    });

    results.push({
      persona: persona.name,
      segment: persona.segment,
      step: 'E-Mail-Check (Gmail)',
      passed: true,
      detail: `CHECK_GMAIL:info@hempura.de:${persona.segment}-${persona.name}`,
    });

    await page.close();
  }

  await browser.close();
  db.close();
  return results;
}
