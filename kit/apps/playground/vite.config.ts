import { defineConfig, defaultClientConditions } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { changelog } from './changelog.ts';

export default defineConfig({
  plugins: [react(), tailwindcss(), changelog()],
  // dtx-source: read the kit's TypeScript source, so dev and build never need `npm run build -w @dgtx/ui-frek` first
  resolve: { conditions: ['dtx-source', ...defaultClientConditions] },
});
