import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: process.env.SITE_URL || 'https://faberroof.com',
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/admin'),
    }),
  ],
  // Google Drive FS often skips native file events — poll so HMR actually fires
  vite: {
    envPrefix: ['PUBLIC_', 'SITE_'],
    server: {
      watch: {
        usePolling: true,
        interval: 800,
      },
    },
  },
  image: {
    domains: ['media.stokeleads.com', 'lh3.googleusercontent.com', 'randomuser.me'],
    remotePatterns: [
      { protocol: 'https', hostname: 'media.stokeleads.com' },
      { protocol: 'https', hostname: '*.r2.dev' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'randomuser.me' },
    ],
  },
});
