import { staticAdapter } from '@builder.io/qwik-city/adapters/static/vite';
import { qwikCity } from '@builder.io/qwik-city/vite';
import { qwikVite } from '@builder.io/qwik/optimizer';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig(() => {
  return {
    plugins: [
      qwikCity(),
      qwikVite(),
      tsconfigPaths({ root: '.' }),
      staticAdapter({
        origin: 'https://qwik-ecommerce-product-page-build49.vercel.app'
      })
    ]
  };
});
