import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@idoa/fuel-session-policy-sdk': resolve(
        __dirname,
        '../packages/session-policy-sdk/src/index.ts'
      )
    }
  }
});
