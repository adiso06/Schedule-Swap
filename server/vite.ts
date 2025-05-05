import type { Express } from "express";
import express from "express";
import { createServer } from "http";
import { join, resolve } from "path";
import { fileURLToPath } from "url";

// For ESM compatibility
const __dirname = fileURLToPath(new URL(".", import.meta.url));

// Simple logging function
export function log(message: string) {
  const now = new Date();
  const time = `${now.getHours()}:${String(now.getMinutes()).padStart(2, "0")}:${String(
    now.getSeconds()
  ).padStart(2, "0")} ${now.getHours() >= 12 ? "PM" : "AM"}`;
  
  console.log(`${time} [express] ${message}`);
}

// Setup Vite in development mode
export async function setupVite(app: Express, httpServer: ReturnType<typeof createServer>) {
  // Create Vite server in middleware mode
  const { createServer: createViteServer } = await import("vite");
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
    root: resolve(__dirname, "../client"),
  });

  // Use vite's connect instance as middleware
  app.use(vite.middlewares);
  
  return vite;
}

// Serve static files in production
export function serveStatic(app: Express) {
  const clientDistPath = resolve(__dirname, "../dist/client");
  
  app.use(
    "/assets",
    express.static(join(clientDistPath, "assets"), {
      immutable: true,
      maxAge: "365d",
    })
  );
  
  app.use(express.static(clientDistPath));
  
  // For SPA routing, serve index.html for all non-asset routes
  app.get("*", (_req, res) => {
    res.sendFile(join(clientDistPath, "index.html"));
  });
} 