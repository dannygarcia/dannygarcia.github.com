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
      lastmod: new Date(),
      filter: (page) => page !== undefined,
      customPages: [],
      entryLimit: 10000,
      serialize: (item) => {
        // Homepage gets daily updates, everything else weekly
        if (item.url === 'https://danny-garcia.com/') {
          return {
            ...item,
            changefreq: 'daily',
            priority: 0.8
          };
        } else {
          return {
            ...item,
            changefreq: 'weekly',
            priority: 0.7
          };
        }
      }
    })
  ]
});
