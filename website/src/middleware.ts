import { defineMiddleware } from 'astro:middleware';
import { isValidSession } from './lib/admin-auth';

const CANONICAL_HOST = 'wirkaufendeineimmobilie.de';

export const onRequest = defineMiddleware(({ request, redirect }, next) => {
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || '';
  const pathname = new URL(request.url).pathname;
  const search = new URL(request.url).search;

  // Redirect old subdomain to canonical
  if (host && host !== CANONICAL_HOST && host !== `www.${CANONICAL_HOST}` && !host.startsWith('localhost')) {
    return redirect(`https://${CANONICAL_HOST}${pathname}${search}`, 301);
  }

  // www → non-www
  if (host === `www.${CANONICAL_HOST}`) {
    return redirect(`https://${CANONICAL_HOST}${pathname}${search}`, 301);
  }

  // Admin-Schutz: /admin/* nur mit gültigem Session-Cookie erreichbar
  // /admin/login ist explizit ausgenommen (sonst Redirect-Loop)
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    if (!isValidSession(request.headers.get('cookie'))) {
      return redirect('/admin/login', 302);
    }
  }

  return next();
});
