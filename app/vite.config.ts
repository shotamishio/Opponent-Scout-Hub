import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Build output goes to ../site (a plain static file set meant to be
// uploaded as-is to any web server — see site/README.txt). Two things
// matter for that use case, since the server/subfolder it lands in isn't
// known ahead of time:
//  - `base: './'` makes every asset reference relative, so the site still
//    works whether it's served from the domain root or a subfolder
//    (e.g. example.com/scouthub/).
//  - Asset filenames are grouped into assets/js, assets/css, assets/img,
//    assets/fonts instead of Vite's default flat "assets/" dump, so the
//    published file tree is easy to scan and reason about later.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  base: './',
  build: {
    outDir: path.resolve(__dirname, '../site'),
    emptyOutDir: true,
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        entryFileNames: 'assets/js/[name]-[hash].js',
        chunkFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const name = assetInfo.names?.[0] ?? assetInfo.name ?? '';
          const ext = name.split('.').pop() ?? '';
          if (ext === 'css') return 'assets/css/[name]-[hash][extname]';
          if (['woff', 'woff2', 'ttf', 'otf'].includes(ext)) return 'assets/fonts/[name]-[hash][extname]';
          if (['svg', 'png', 'jpg', 'jpeg', 'gif', 'webp', 'ico'].includes(ext)) return 'assets/img/[name]-[hash][extname]';
          return 'assets/[name]-[hash][extname]';
        },
      },
    },
  },
});
