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
