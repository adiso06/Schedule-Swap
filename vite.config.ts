import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

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
  // Set base path to be relative instead of absolute
  // This ensures assets are loaded correctly regardless of the URL path
  base: './',
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
