import type { APIRoute } from 'astro';
import { writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const data = await request.formData();
  const submission = {
    typ: 'bewertung',
    plz: data.get('plz'),
    name: data.get('name'),
    email: data.get('email'),
    telefon: data.get('telefon'),
    timestamp: new Date().toISOString(),
  };

  const dir = join(process.cwd(), 'data', 'submissions');
  await mkdir(dir, { recursive: true });
  await writeFile(
    join(dir, `bewertung-${Date.now()}.json`),
    JSON.stringify(submission, null, 2)
  );

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
