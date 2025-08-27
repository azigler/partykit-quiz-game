import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [
    svelte({
      preprocess: vitePreprocess()
    })
  ],
  server: {
    port: 3000,
    host: true
  },
  build: {
    target: 'esnext',
    outDir: 'dist'
  }
});
