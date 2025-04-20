import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svelte()],
  resolve: {
    alias: {
      // Any import like "$canisters/XXX" → project-root/src/declarations/XXX
      "$canisters": path.resolve(__dirname, "../src/declarations"),
      // This provides polyfills for Node.js core modules
      events: 'rollup-plugin-node-polyfills/polyfills/events',
    }
  },
  server: {
    fs: {
      // Allow Vite to serve files from one level up
      allow: [path.resolve(__dirname, "..")]
    }
  },
  define: {
    // This adds global variables required by @dfinity/agent
    global: 'globalThis',
    'process.env': {},
  },
  // Ensure proper handling of imports from declarations
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis'
      }
    }
  }
});




