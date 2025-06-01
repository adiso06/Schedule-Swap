#!/usr/bin/env node

// Simple script to start the application in client-only mode
import { spawn } from 'child_process';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

console.log('Starting client-only SWAP application...');

// Start Vite with the client-only config
const vite = spawn('vite', ['--config', 'client-only.vite.config.ts'], {
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, NODE_ENV: 'development' }
});

vite.on('error', (err) => {
  console.error('Error starting Vite:', err);
  process.exit(1);
});

// Handle termination
process.on('SIGINT', () => {
  vite.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  vite.kill('SIGTERM');
  process.exit(0);
});