#!/usr/bin/env node

/**
 * Direct client startup script for SWAP application
 * This script can be run directly to start the client app without any server dependency
 */

import { spawn } from 'child_process';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const clientDir = resolve(__dirname, 'client');

console.log('Starting SWAP client-only application...');
console.log(`Using client directory: ${clientDir}`);

// Run the client vite process with the right configuration
  const viteProcess = spawn('npx', ['vite', '--port', '3000', '--host', '0.0.0.0'], {
  cwd: clientDir,
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, FORCE_COLOR: 'true' }
});

viteProcess.on('error', (err) => {
  console.error('Failed to start client:', err);
  process.exit(1);
});

// Handle process termination
process.on('SIGINT', () => {
  viteProcess.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  viteProcess.kill('SIGTERM');
  process.exit(0);
});