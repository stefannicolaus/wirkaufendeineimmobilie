import { defineMiddleware } from 'astro:middleware';

const CANONICAL_HOST = 'wirkaufendeineimmobilie.de';

export const onRequest = defineMiddleware(({ request, redirect }, next) => {
  // Traefik sets X-Forwarded-Host with the real hostname
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || '';
  const pathname = new URL(request.url).pathname;
  const search = new URL(request.url).search;

  // Redirect old subdomain to canonical domain (301 permanent)
  if (host && host !== CANONICAL_HOST && host !== `www.${CANONICAL_HOST}` && !host.startsWith('localhost')) {
    return redirect(`https://${CANONICAL_HOST}${pathname}${search}`, 301);
  }

  // Redirect www to non-www (301 permanent)
  if (host === `www.${CANONICAL_HOST}`) {
    return redirect(`https://${CANONICAL_HOST}${pathname}${search}`, 301);
  }

  return next();
});
