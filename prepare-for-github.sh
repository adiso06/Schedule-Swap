#!/bin/bash

# Script to prepare the project for GitHub and GitHub Pages deployment

echo "==== Preparing Residency Swap App for GitHub Deployment ===="
echo ""
echo "This script will:"
echo "1. Create a new .gitignore file"
echo "2. Initialize a git repository"
echo "3. Build the project for GitHub Pages"
echo ""

# Create a .gitignore file
echo "Creating .gitignore file..."
cat > .gitignore << EOL
# Dependencies
node_modules
.pnp
.pnp.js

# Build outputs
dist
build

# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

# Environment files
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Editor directories and files
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?
EOL

echo ".gitignore file created!"

# Initialize git repository if not already initialized
if [ ! -d ".git" ]; then
  echo "Initializing git repository..."
  git init
  echo "Git repository initialized!"
else
  echo "Git repository already exists."
fi

# Set instructions for building and pushing to GitHub
echo ""
echo "===== GitHub Repository Setup Instructions ====="
echo ""
echo "1. Create a new repository named 'residency-swap' on GitHub"
echo "2. Run the following commands to push to GitHub:"
echo ""
echo "   git add ."
echo "   git commit -m \"Initial commit of Residency Swap app\""
echo "   git branch -M main"
echo "   git remote add origin https://github.com/YOUR-USERNAME/residency-swap.git"
echo "   git push -u origin main"
echo ""
echo "3. After pushing to GitHub, go to repository Settings > Pages"
echo "4. Set the GitHub Pages source to GitHub Actions"
echo ""
echo "Your app will then be automatically built and deployed to adityasood.me/swap"