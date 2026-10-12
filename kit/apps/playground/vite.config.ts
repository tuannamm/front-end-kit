import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { changelog } from './changelog.ts';

export default defineConfig({ plugins: [react(), tailwindcss(), changelog()] });
