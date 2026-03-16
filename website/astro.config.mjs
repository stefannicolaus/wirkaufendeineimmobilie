import { defineConfig } from 'astro/config';
import node from '@astrojs/node';

export default defineConfig({
  adapter: node({ mode: 'standalone' }),
  site: 'https://wirkaufendeineimmobilie.build-upstream.com',
  vite: {
    css: {
      devSourcemap: true,
    },
  },
});
