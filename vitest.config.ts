import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    include: ['tests/unit/**/*.test.ts'],
    environment: 'node',
    // Tiap suite database memulai PGlite dan menjalankan migrasi. Saat beberapa suite jalan bersamaan, 10 detik bawaan bisa terlewati.
    hookTimeout: 60_000,
    testTimeout: 30_000,
  },
});
