#!/bin/bash

# Script to build the project for GitHub Pages deployment
echo "Building for GitHub Pages deployment at /swap/ path..."

# Create .env file with base path configuration
echo "VITE_BASE_PATH=/swap" > .env

# Set environment variable for Vite to use the correct base path
export GITHUB_PAGES=true

# Create a temporary vite.config.js that overrides the base path
cat > vite.config.override.js << EOL
import baseConfig from './vite.config.ts';
export default {
  ...baseConfig,
  base: '/swap/'
};
EOL

# Run the build command with the override config
VITE_USER_NODE_OPTIONS=--require=./vite.config.stub.js npm run build

# Clean up the temporary file
rm vite.config.override.js

echo "Build complete! Files are in dist/public directory"
echo "You can now commit and push to GitHub to deploy to GitHub Pages"