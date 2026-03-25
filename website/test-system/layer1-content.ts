// test-system/layer1-content.ts
import Anthropic from '@anthropic-ai/sdk';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const client = new Anthropic();
const SITE_ROOT = join(process.cwd(), 'src/pages');

export interface ContentAuditResult {
  page: string;
  persona: string;
  segment: string;
  klar_was_zu_tun: boolean;
  benefits_sichtbar: boolean;
  email_adresse_sichtbar: boolean;
  vertrauen_aufgebaut: boolean;
  issues: string[];
  score: number;
}

async function auditPage(
  pagePath: string,
  personaName: string,
  segment: string,
  personaBeschreibung: string
): Promise<ContentAuditResult> {
  const content = readFileSync(join(SITE_ROOT, pagePath), 'utf-8');
  const htmlContent = content.replace(/^---[\s\S]*?---\n/m, '').slice(0, 8000);

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 512,
    messages: [{
      role: 'user',
      content: `Du bist ${personaName} (${personaBeschreibung}).
Du besuchst diese Webseite zum ersten Mal.

SEITENINHALT:
${htmlContent}

Beantworte AUSSCHLIESSLICH als JSON (kein Text davor/danach):
{
  "klar_was_zu_tun": true/false,
  "benefits_sichtbar": true/false,
  "email_adresse_sichtbar": true/false,
  "vertrauen_aufgebaut": true/false,
  "issues": ["Issue 1", "Issue 2"]
}

Regeln:
- klar_was_zu_tun: Weißt du nach dem Lesen was der nächste Schritt ist?
- benefits_sichtbar: Siehst du konkrete Vorteile für dich?
- email_adresse_sichtbar: Siehst du office@wirkaufendeineimmobilie.de oder ähnliche Kontaktadresse?
- vertrauen_aufgebaut: Würdest du deine Daten eingeben?
- issues: Max 3 konkrete Punkte was unklar oder fehlend ist`,
    }],
  });

  let parsed = {
    klar_was_zu_tun: false,
    benefits_sichtbar: false,
    email_adresse_sichtbar: false,
    vertrauen_aufgebaut: false,
    issues: [] as string[],
  };

  try {
    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    parsed = JSON.parse(text);
  } catch {}

  const score = [
    parsed.klar_was_zu_tun,
    parsed.benefits_sichtbar,
    parsed.email_adresse_sichtbar,
    parsed.vertrauen_aufgebaut,
  ].filter(Boolean).length;

  return { page: pagePath, persona: personaName, segment, ...parsed, score };
}

export async function runLayer1(): Promise<ContentAuditResult[]> {
  const checks = [
    { page: 'investoren.astro', persona: 'Klaus Müller', segment: 'investor', beschreibung: 'Erfahrener Investor, sucht Fix&Flip unter 150k' },
    { page: 'investoren.astro', persona: 'Thomas Wagner', segment: 'investor', beschreibung: 'Anfänger-Investor, will erstes Objekt' },
    { page: 'tippgeber.astro', persona: 'Sabine Richter', segment: 'tippgeber', beschreibung: 'Maklerin mit Objektkontakt' },
    { page: 'makler.astro', persona: 'Peter Hoffmann', segment: 'makler', beschreibung: 'Makler mit Investoren-Kunden' },
  ];

  const results: ContentAuditResult[] = [];
  for (const check of checks) {
    console.log(`  Layer 1: ${check.page} als ${check.persona}...`);
    results.push(await auditPage(check.page, check.persona, check.segment, check.beschreibung));
  }
  return results;
}
