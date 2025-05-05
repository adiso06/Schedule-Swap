/**
 * This file is a placeholder to maintain compatibility with the development server.
 * The application doesn't actually use a database since it's entirely client-side.
 */

import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// Create a mock pool and db instance to maintain compatibility
// This code won't actually be used, but is needed for the server to start
export const pool = process.env.DATABASE_URL 
  ? new Pool({ connectionString: process.env.DATABASE_URL }) 
  : null;
  
export const db = pool 
  ? drizzle({ client: pool, schema }) 
  : null;
