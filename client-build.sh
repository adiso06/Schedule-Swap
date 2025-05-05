#!/bin/bash

# Script to build only the client-side portion for GitHub Pages
echo "Building client-only version for GitHub Pages deployment at /swap/ path..."

# Create .env file with base path configuration
echo "VITE_BASE_PATH=/swap" > .env

# Set environment variable for Vite
export GITHUB_PAGES=true

# Run client-side Vite build
npx vite build --base=/swap/ --outDir=dist

echo "Build complete! Client files are in dist directory"
echo "You can now commit and push these files to GitHub to deploy to GitHub Pages"