// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// BASE_PATH is set in GitHub Pages CI (e.g. "/pecit-watch-guild/"). Local/custom-domain builds use "/".
const base = process.env.BASE_PATH || '/';

export default defineConfig({
  site: process.env.SITE_URL || 'https://pecitwatchguild.com',
  base,
  trailingSlash: 'always',
  redirects: {
    '/pdfviewer/kahayag-multidisciplinary-research-journal/': '/research/kahayag/',
    '/pdfviewer/magazine-2024/': '/magazine/magazine-2024/',
    '/pdfviewer/the-watchguild-magazine/': '/magazine/watchguild-magazine/',
  },
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [
    sitemap({
      entryLimit: 1000,
      chunks: {
        services: (item) => {
          const path = new URL(item.url).pathname;
          if (path === '/services/' || path.startsWith('/services/')) return item;
        },
        'service-areas': (item) => {
          const path = new URL(item.url).pathname;
          if (path === '/service-areas/' || path.startsWith('/service-areas/')) return item;
        },
        blog: (item) => {
          const path = new URL(item.url).pathname;
          if (path === '/blog/' || path.startsWith('/blog/')) return item;
        },
        articles: (item) => {
          const path = new URL(item.url).pathname;
          if (path === '/articles/' || path.startsWith('/articles/')) return item;
        },
      },
      filter: (page) =>
        !page.includes('/preview/') &&
        !page.endsWith('/preview'),
    }),
  ],
});
