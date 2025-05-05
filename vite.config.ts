import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

// Determine the correct base path based on the environment
const getBasePath = () => {
  // For GitHub Pages deployment
  if (process.env.GITHUB_PAGES === 'true') {
    // This will output assets with paths like /swap/assets/...
    return '/swap/';
  }
  // For local development
  return '/';
};

export default defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer(),
          ),
        ]
      : []),
  ],
  base: getBasePath(),
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client/src"),
      "@components": path.resolve(import.meta.dirname, "client/src/components"),
      "@lib": path.resolve(import.meta.dirname, "client/src/lib"),
      "@hooks": path.resolve(import.meta.dirname, "client/src/hooks"),
      "@context": path.resolve(import.meta.dirname, "client/src/context"),
      "@pages": path.resolve(import.meta.dirname, "client/src/pages"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist"),
    emptyOutDir: true,
  },
});
