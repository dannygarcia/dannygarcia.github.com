import { defineConfig } from 'astro/config';
import netlify from '@astrojs/netlify';

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
  integrations: []
});
