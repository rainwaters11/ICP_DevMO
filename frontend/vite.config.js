import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import path from "path";

export default defineConfig({
  plugins: [svelte()],
  resolve: {
    alias: {
      // Any import like "$canisters/XXX" → project-root/src/declarations/XXX
      "$canisters": path.resolve(__dirname, "../src/declarations")
    }
  },
  server: {
    fs: {
      // Allow Vite to serve files from one level up
      allow: [path.resolve(__dirname, "..")]
    }
  }
});




