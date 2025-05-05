import express from "express";
import { createServer } from "http";
import { join, resolve } from "path";
import { fileURLToPath } from "url";

// For ESM compatibility
const __dirname = fileURLToPath(new URL(".", import.meta.url));

// Simple logging function
function log(message: string) {
  const now = new Date();
  const time = `${now.getHours()}:${String(now.getMinutes()).padStart(2, "0")}:${String(
    now.getSeconds()
  ).padStart(2, "0")} ${now.getHours() >= 12 ? "PM" : "AM"}`;
  
  console.log(`${time} [express] ${message}`);
}

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Create HTTP server
const server = createServer(app);

// Setup for development
if (process.env.NODE_ENV === "development") {
  // Import Vite in development mode
  import("vite").then(async ({ createServer: createViteServer }) => {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
      root: resolve(__dirname, "../client"),
    });

    // Use vite's connect instance as middleware
    app.use(vite.middlewares);

    // Start the server
    const port = parseInt(process.env.PORT || "3000", 10);
    server.listen({
      port,
      host: "0.0.0.0",
    }, () => {
      log(`Development server running at http://localhost:${port}`);
    });
  });
} else {
  // Serve static files in production
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
  
  // Start the server
  const port = parseInt(process.env.PORT || "3000", 10);
  server.listen({
    port,
    host: "0.0.0.0",
  }, () => {
    log(`Production server running at http://localhost:${port}`);
  });
} 