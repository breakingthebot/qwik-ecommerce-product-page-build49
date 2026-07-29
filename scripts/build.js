// scripts/build.js
import { renderToString } from '@builder.io/qwik/server';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Root from '../src/root.js';

async function build() {
  try {
    const result = await renderToString(Root, {
      pretty: true,
    });
    const distDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist');
    if (!fs.existsSync(distDir)) {
      fs.mkdirSync(distDir, { recursive: true });
    }
    fs.writeFileSync(path.join(distDir, 'index.html'), result.html);
    console.log('✅ Generated static dist/index.html (' + result.html.length + ' bytes)');
  } catch (err) {
    console.error('Error generating static HTML:', err);
  }
}

build();
