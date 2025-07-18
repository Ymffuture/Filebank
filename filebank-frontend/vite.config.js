import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import lexical from 'vite-plugin-lexical';

export default defineConfig({
  plugins: [react(), lexical()],
});
