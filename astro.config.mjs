import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import node from '@astrojs/node';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  site: 'https://hicc.pro',
  image: {
    domains: ['image.hicc.pro', 'hicc.pro'],
  },
  integrations: [mdx(), sitemap(), react()],
  output: 'server',
  adapter: node({ mode: 'middleware' }),
  prefetch: true,
});
