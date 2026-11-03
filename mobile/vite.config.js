import { defineConfig } from 'vite';
import { readFileSync } from 'node:fs';

const config = JSON.parse(readFileSync(new URL('./public/config.json', import.meta.url)));
const origins = [config.apiBaseUrl, config.supabaseUrl].filter(Boolean).map(value => {
  const url = new URL(value);
  if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash) {
    throw new Error('Configure somente URLs HTTPS, sem credenciais, query ou fragmento.');
  }
  return url.origin;
});

export default defineConfig({
  base: './',
  plugins: [{
    name: 'exact-account-origins',
    transformIndexHtml: html => html.replace('ACCOUNT_CONNECT_ORIGINS', ["'self'", ...new Set(origins)].join(' '))
  }],
  build: { outDir: 'dist', sourcemap: false }
});
