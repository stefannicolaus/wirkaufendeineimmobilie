import type { APIRoute } from 'astro';
import { writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const data = await request.formData();

  const typ = data.get('typ') as string; // 'erben' or 'flipstart'

  const submission: Record<string, unknown> = {
    typ: `guide-${typ}`,
    email: data.get('email'),
    timestamp: new Date().toISOString(),
  };

  // Erbengemeinschaft-specific fields
  if (typ === 'erben') {
    submission.anzahl_erben = data.get('anzahl_erben');
    submission.blockiert_seit = data.get('blockiert_seit');
    submission.plz = data.get('plz');
  }

  // Fix & Flip Starter-specific fields
  if (typ === 'flipstart') {
    submission.erfahrung = data.get('erfahrung');
    submission.budget = data.get('budget');
    submission.handwerker = data.get('handwerker');
  }

  const dir = join(process.cwd(), 'data', 'submissions');
  await mkdir(dir, { recursive: true });
  await writeFile(
    join(dir, `guide-${typ}-${Date.now()}.json`),
    JSON.stringify(submission, null, 2)
  );

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
