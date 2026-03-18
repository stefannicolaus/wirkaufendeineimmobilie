import type { APIRoute } from 'astro';
import { writeFile, mkdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { existsSync } from 'node:fs';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.formData();
    const sessionId = data.get('sessionId') as string;
    const docType = data.get('docType') as string;

    if (!sessionId || !docType) {
      return new Response(JSON.stringify({ error: 'sessionId und docType erforderlich' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const dir = join(process.cwd(), 'data', 'uploads', sessionId);
    await mkdir(dir, { recursive: true });

    // Kontakt-Schritt: Metadaten speichern
    if (docType === 'kontakt') {
      const meta = {
        sessionId,
        name: data.get('name'),
        email: data.get('email'),
        adresse: data.get('adresse'),
        timestamp: new Date().toISOString(),
        steps: {},
      };
      await writeFile(join(dir, 'meta.json'), JSON.stringify(meta, null, 2));
      return new Response(JSON.stringify({ success: true, sessionId }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // "Habe ich nicht" — als fehlend markieren
    if (data.get('missing') === 'true') {
      const notiz = (data.get('notiz') as string) || '';
      await writeFile(
        join(dir, `${docType}-missing.json`),
        JSON.stringify({ docType, missing: true, notiz, timestamp: new Date().toISOString() }, null, 2)
      );
      // Wir kümmern uns-Flag für Energieausweis
      if (data.get('wkdiKuemmert') === 'true') {
        await writeFile(
          join(dir, `${docType}-wkdi-action.json`),
          JSON.stringify({ docType, action: 'wkdi_besorgt_energieausweis', timestamp: new Date().toISOString() }, null, 2)
        );
      }
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Datei-Upload
    const files = data.getAll('files') as File[];
    if (files.length === 0) {
      return new Response(JSON.stringify({ error: 'Keine Dateien erhalten' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const docDir = join(dir, docType);
    await mkdir(docDir, { recursive: true });

    const savedFiles: string[] = [];
    for (const file of files) {
      if (!(file instanceof File) || file.size === 0) continue;
      if (file.size > 20 * 1024 * 1024) continue; // 20MB Limit
      const buffer = Buffer.from(await file.arrayBuffer());
      const safeName = file.name.replace(/[^a-zA-Z0-9.\-_äöüÄÖÜß]/g, '_');
      const filename = `${Date.now()}-${safeName}`;
      await writeFile(join(docDir, filename), buffer);
      savedFiles.push(file.name);
    }

    return new Response(JSON.stringify({ success: true, files: savedFiles }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[/api/unterlagen]', err);
    return new Response(JSON.stringify({ error: 'Serverfehler' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
