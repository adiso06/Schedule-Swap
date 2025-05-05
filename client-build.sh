#!/bin/bash

# Script to build only the client-side portion for GitHub Pages
echo "Building client-only version for GitHub Pages deployment at /swap/ path..."

# Create .env file with base path configuration
echo "VITE_BASE_PATH=/swap" > .env

# Set environment variable for Vite
export GITHUB_PAGES=true

# Run only the client-side Vite build without the server
npx vite build --base=/swap/ --outDir=dist/public

echo "Build complete! Client-only files are in dist/public directory"
echo "You can now commit and push these files to GitHub to deploy to GitHub Pages"