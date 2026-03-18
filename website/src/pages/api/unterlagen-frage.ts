import type { APIRoute } from 'astro';
import { writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      // Voice-Nachricht als Audio-Blob
      const data = await request.formData();
      const sessionId = data.get('sessionId') as string;
      const audio = data.get('audio') as File;

      if (!sessionId || !audio) {
        return new Response(JSON.stringify({ error: 'Fehlende Daten' }), { status: 400 });
      }

      const dir = join(process.cwd(), 'data', 'uploads', sessionId, 'fragen');
      await mkdir(dir, { recursive: true });

      if (audio.size > 5 * 1024 * 1024) {
        return new Response(JSON.stringify({ error: 'Datei zu groß (max 5MB)' }), { status: 400 });
      }

      const buffer = Buffer.from(await audio.arrayBuffer());
      const filename = `voice-${Date.now()}.webm`;
      await writeFile(join(dir, filename), buffer);

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } else {
      // Text-Frage als JSON
      const body = await request.json();
      const { sessionId, text } = body;

      if (!sessionId || !text) {
        return new Response(JSON.stringify({ error: 'Fehlende Daten' }), { status: 400 });
      }

      const dir = join(process.cwd(), 'data', 'uploads', sessionId, 'fragen');
      await mkdir(dir, { recursive: true });

      await writeFile(
        join(dir, `text-${Date.now()}.json`),
        JSON.stringify({ text, timestamp: new Date().toISOString() }, null, 2)
      );

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  } catch (err) {
    console.error('[/api/unterlagen-frage]', err);
    return new Response(JSON.stringify({ error: 'Serverfehler' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
