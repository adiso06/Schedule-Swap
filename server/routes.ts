/**
 * This file is a placeholder for server routes.
 * The SWAP application is entirely client-side and doesn't require server-side APIs.
 */

import type { Express } from "express";
import { createServer, type Server } from "http";

export async function registerRoutes(app: Express): Promise<Server> {
  // The SWAP application is entirely client-side and doesn't use any server APIs
  const httpServer = createServer(app);
  return httpServer;
}
