import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

// Simple Replit environment detection
const isReplit = !!process.env.REPL_ID;
const replPath = isReplit ? process.env.REPL_SLUG : '';

export default defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay()
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@shared": path.resolve(__dirname, "../shared"),
      "@assets": path.resolve(__dirname, "../attached_assets"),
    }
  },
  server: {
    host: "0.0.0.0",
    port: 3000,
    strictPort: true,
    hmr: {
      clientPort: 443
    },
    cors: true,
    headers: {
      "Access-Control-Allow-Origin": "*"
    },
    watch: {
      usePolling: true
    },
    fs: {
      strict: false,
      allow: ['..']
    },
    // Explicitly add the Replit host to allowed hosts
    allowedHosts: [
      '500aab0c-a850-4bd6-83eb-93dd31377654-00-2ph9s9kwix55k.picard.replit.dev',
      'all'
    ]
  },
  build: {
    outDir: path.resolve(__dirname, "../dist"),
    emptyOutDir: true
  },
  base: './'
});