#!/bin/bash

# Script to build the project for GitHub Pages deployment
echo "Building for GitHub Pages deployment at /swap/ path..."

# Set environment variable for Vite to use the correct base path
export GITHUB_PAGES=true

# Run the build command
npm run build

echo "Build complete! Files are in dist/public directory"
echo "You can now commit and push to GitHub to deploy to GitHub Pages"