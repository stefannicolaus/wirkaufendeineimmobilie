import type { APIRoute } from 'astro';
import { writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const data = await request.formData();

  const typ = data.get('typ') as string; // 'aktionsplan-erben', 'blueprint', or 'kompass'

  const submission: Record<string, unknown> = {
    typ,
    email: data.get('email'),
    timestamp: new Date().toISOString(),
  };

  // Aktionsplan Erbengemeinschaft fields
  if (typ === 'aktionsplan-erben') {
    submission.anzahl_erben = data.get('anzahl_erben');
    submission.blockiert_seit = data.get('blockiert_seit');
    submission.plz = data.get('plz');
  }

  // Blueprint fields
  if (typ === 'blueprint') {
    submission.erfahrung = data.get('erfahrung');
    submission.budget = data.get('budget');
    submission.handwerker = data.get('handwerker');
  }

  // Kompass Betreuung fields
  if (typ === 'kompass') {
    submission.rolle = data.get('rolle');
    submission.vermoegenssorge = data.get('vermoegenssorge');
    submission.plz = data.get('plz');
  }

  const dir = join(process.cwd(), 'data', 'submissions');
  await mkdir(dir, { recursive: true });
  await writeFile(
    join(dir, `${typ}-${Date.now()}.json`),
    JSON.stringify(submission, null, 2)
  );

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
