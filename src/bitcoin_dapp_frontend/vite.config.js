import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'url';
import environment from 'vite-plugin-environment';
import dotenv from 'dotenv';

dotenv.config({ path: '../../.env' });

export default defineConfig({
  build: {
    emptyOutDir: true,
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
    alias: [
      {
        find: "declarations",
        replacement: fileURLToPath(
          new URL("../declarations", import.meta.url)
        ),
      },
    ],
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
