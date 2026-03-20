import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  adapter: node({ mode: 'standalone' }),
  site: 'https://wirkaufendeineimmobilie.de',
  security: { checkOrigin: false },
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/danke') && !page.includes('/api/'),
    }),
  ],
  vite: {
    css: {
      devSourcemap: true,
    },
  },
});
