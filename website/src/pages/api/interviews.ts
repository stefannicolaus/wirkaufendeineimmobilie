// website/src/pages/api/interviews.ts
import type { APIRoute } from 'astro';
import { writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const interview = await request.json();

    if (!interview.id || !interview.thema) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const dir = join(process.cwd(), 'data', 'interviews');
    await mkdir(dir, { recursive: true });

    const filename = `${interview.id}.json`;
    await writeFile(join(dir, filename), JSON.stringify(interview, null, 2), 'utf-8');

    return new Response(JSON.stringify({ success: true, id: interview.id }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Interview save error:', err);
    return new Response(JSON.stringify({ error: 'Save failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
