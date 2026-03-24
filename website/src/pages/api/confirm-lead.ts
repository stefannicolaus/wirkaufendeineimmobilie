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
