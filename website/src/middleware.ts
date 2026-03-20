import { defineMiddleware } from 'astro:middleware';

const CANONICAL_HOST = 'wirkaufendeineimmobilie.de';

export const onRequest = defineMiddleware(({ request, redirect }, next) => {
  const url = new URL(request.url);

  // Redirect old subdomain to canonical domain (301 permanent)
  if (url.hostname !== CANONICAL_HOST && url.hostname !== `www.${CANONICAL_HOST}` && url.hostname !== 'localhost') {
    const target = new URL(url.pathname + url.search, `https://${CANONICAL_HOST}`);
    return redirect(target.toString(), 301);
  }

  // Redirect www to non-www (301 permanent)
  if (url.hostname === `www.${CANONICAL_HOST}`) {
    const target = new URL(url.pathname + url.search, `https://${CANONICAL_HOST}`);
    return redirect(target.toString(), 301);
  }

  return next();
});
