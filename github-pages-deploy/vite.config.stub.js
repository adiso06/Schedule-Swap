// This is a stub for GitHub Pages deployment
// It modifies the Vite configuration to use /swap/ as the base path
// without changing the main vite.config.ts file

import { defineConfig } from "vite";
import { dirname } from 'path';
import { fileURLToPath } from 'url';

/**
 * @type {import('vite').UserConfig}
 */
export default {
  base: '/swap/',
};