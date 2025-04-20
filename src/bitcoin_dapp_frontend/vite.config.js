import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'url';
import environment from 'vite-plugin-environment';
import dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: '../../.env' });

export default defineConfig({
  build: {
    emptyOutDir: true,
    // Add CSP-compatible settings
    target: 'es2015',
    minify: 'terser',
    terserOptions: {
      format: {
        comments: false,
      },
    },
    rollupOptions: {
      output: {
        // Avoid using eval in the code by setting format to es
        format: 'es',
        // Disable code splitting to prevent dynamic imports that might use eval
        manualChunks: undefined,
      },
      // External libraries that shouldn't be bundled
      external: [
        // Add any external dependencies here if needed
      ]
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: "globalThis",
      },
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://127.0.0.1:4943",
        changeOrigin: true,
      },
    },
  },
  publicDir: "assets",
  plugins: [
    environment("all", { prefix: "CANISTER_" }),
    environment("all", { prefix: "DFX_" }),
  ],
  resolve: {
    alias: {
      // Define exact alias paths to each declaration file
      'bitcoin_dapp_declarations': resolve(__dirname, '../../src/declarations/bitcoin_dapp'),
      'bitcoin_dapp_backend_declarations': resolve(__dirname, '../../src/declarations/bitcoin_dapp_backend'),
      'bitcoin_dapp_frontend_declarations': resolve(__dirname, '../../src/declarations/bitcoin_dapp_frontend'),
      'declarations': resolve(__dirname, '../../src/declarations'),
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
    dedupe: ['@dfinity/agent'],
  },
  define: {
    'process.env': {
      NODE_ENV: JSON.stringify(process.env.NODE_ENV),
      DFX_NETWORK: JSON.stringify(process.env.DFX_NETWORK || 'local'),
      CANISTER_ID_BITCOIN_DAPP: JSON.stringify(process.env.CANISTER_ID_BITCOIN_DAPP || 'bkyz2-fmaaa-aaaaa-qaaaq-cai'),
      CANISTER_ID_BITCOIN_DAPP_BACKEND: JSON.stringify(process.env.CANISTER_ID_BITCOIN_DAPP_BACKEND || 'bd3sg-teaaa-aaaaa-qaaba-cai')
    }
  }
});
