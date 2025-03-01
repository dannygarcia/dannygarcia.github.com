import { defineConfig } from 'astro/config';
import netlify from '@astrojs/netlify';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://danny-garcia.com',
  output: 'static',
  adapter: netlify(),
  scopedStyleStrategy: 'class',
  vite: {
    ssr: {
      noExternal: ['three']
    },
    build: {
      rollupOptions: {
        input: {
          main: './src/client/main.ts'
        }
      }
    }
  },
  integrations: [
    sitemap({
      changefreq: 'daily',
      priority: 0.7,
      lastmod: new Date(),
      filter: (page) => page !== undefined,
      customPages: [],
      entryLimit: 10000
    })
  ]
});
