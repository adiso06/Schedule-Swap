import type { Express } from "express";
import { createServer, type Server } from "http";

// Create and return a basic HTTP server
export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  return httpServer;
} 