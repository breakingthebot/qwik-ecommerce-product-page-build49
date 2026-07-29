// scripts/prerender.js
import { renderToStream } from '@builder.io/qwik/server';
import { manifest } from '../dist/q-manifest.json' assert { type: 'json' };
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import the SSR entry point built by Vite
import render from '../server/entry.ssr.js';

async function buildStaticPage() {
  console.log('⚡ Prerendering Qwik HTML page to dist/index.html...');
  // Ensure dist directory exists
  const distDir = path.join(__dirname, '..', 'dist');
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }
  
  // Render full Qwik HTML document
  const result = await render({
    manifest,
    symbolMapper: manifest.symbols
  });

  console.log('✅ Generated static dist/index.html successfully!');
}

buildStaticPage().catch(err => {
  console.error('Prerender error:', err);
  process.exit(1);
});
