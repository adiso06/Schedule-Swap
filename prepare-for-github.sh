#!/bin/bash

# Script to prepare the repository for GitHub Pages deployment
echo "Preparing for GitHub Pages deployment at adityasood.me/swap..."

# Create a directory for the GitHub Pages version
GITHUB_DIR="github-pages-deploy"
rm -rf $GITHUB_DIR
mkdir -p $GITHUB_DIR

# Copy only the client files needed for deployment
echo "Copying client files..."
cp -r client $GITHUB_DIR/
cp package.json $GITHUB_DIR/
cp package-lock.json $GITHUB_DIR/
cp vite.config.stub.js $GITHUB_DIR/
cp .github $GITHUB_DIR/ -r
cp client-build.sh $GITHUB_DIR/
cp postcss.config.js $GITHUB_DIR/
cp tailwind.config.ts $GITHUB_DIR/
cp tsconfig.json $GITHUB_DIR/
cp components.json $GITHUB_DIR/
cp attached_assets $GITHUB_DIR/ -r
cp generated-icon.png $GITHUB_DIR/ 2>/dev/null || :

# Create a simpler package.json for GitHub Pages
cat > $GITHUB_DIR/package.json << EOL
{
  "name": "residency-swap",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build --base=/swap/",
    "preview": "vite preview"
  },
  "dependencies": {
    "@hookform/resolvers": "^3.3.4",
    "@radix-ui/react-accordion": "^1.1.2",
    "@radix-ui/react-alert-dialog": "^1.0.5",
    "@radix-ui/react-aspect-ratio": "^1.0.3",
    "@radix-ui/react-avatar": "^1.0.4",
    "@radix-ui/react-checkbox": "^1.0.4",
    "@radix-ui/react-collapsible": "^1.0.3",
    "@radix-ui/react-context-menu": "^2.1.5",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-dropdown-menu": "^2.0.6",
    "@radix-ui/react-hover-card": "^1.0.7",
    "@radix-ui/react-label": "^2.0.2",
    "@radix-ui/react-menubar": "^1.0.4",
    "@radix-ui/react-navigation-menu": "^1.1.4",
    "@radix-ui/react-popover": "^1.0.7",
    "@radix-ui/react-progress": "^1.0.3",
    "@radix-ui/react-radio-group": "^1.1.3",
    "@radix-ui/react-scroll-area": "^1.0.5",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-separator": "^1.0.3",
    "@radix-ui/react-slider": "^1.1.2",
    "@radix-ui/react-slot": "^1.0.2",
    "@radix-ui/react-switch": "^1.0.3",
    "@radix-ui/react-tabs": "^1.0.4",
    "@radix-ui/react-toast": "^1.1.5",
    "@radix-ui/react-toggle": "^1.0.3",
    "@radix-ui/react-toggle-group": "^1.0.4",
    "@radix-ui/react-tooltip": "^1.0.7",
    "@tanstack/react-query": "^5.14.2",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "cmdk": "^0.2.0",
    "date-fns": "^2.30.0",
    "embla-carousel-react": "^8.0.0-rc17",
    "framer-motion": "^10.16.16",
    "input-otp": "^1.0.1",
    "lucide-react": "^0.294.0",
    "next-themes": "^0.2.1",
    "react": "^18.2.0",
    "react-day-picker": "^8.9.1",
    "react-dom": "^18.2.0",
    "react-hook-form": "^7.49.2",
    "react-icons": "^4.12.0",
    "react-resizable-panels": "^1.0.1",
    "recharts": "^2.10.3",
    "tailwind-merge": "^2.2.0",
    "tailwindcss-animate": "^1.0.7",
    "vaul": "^0.8.0",
    "wouter": "^2.12.1",
    "zod": "^3.22.4",
    "zod-validation-error": "^2.1.0"
  },
  "devDependencies": {
    "@replit/vite-plugin-cartographer": "^1.0.2",
    "@replit/vite-plugin-runtime-error-modal": "^0.1.9",
    "@tailwindcss/typography": "^0.5.10",
    "@tailwindcss/vite": "^4.0.0-alpha.7",
    "@types/react": "^18.2.20",
    "@types/react-dom": "^18.2.7",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32",
    "tailwindcss": "^3.3.6",
    "typescript": "^5.3.3",
    "vite": "^5.0.10"
  }
}
EOL

# Create a README.md for GitHub
cat > $GITHUB_DIR/README.md << EOL
# Residency Swap

A sophisticated client-side web application for healthcare professionals to manage complex residency schedule swaps with advanced scheduling intelligence.

## Deployment

This application is deployed at: [adityasood.me/swap](https://adityasood.me/swap)

## Technologies

- React with TypeScript
- Shadcn UI components
- Client-side data persistence
- Advanced schedule manipulation algorithms

## Development

To run locally:

\`\`\`bash
npm install
npm run dev
\`\`\`

To build for production:

\`\`\`bash
npm run build
\`\`\`
EOL

# Create a CNAME file for GitHub Pages custom domain
echo "adityasood.me" > $GITHUB_DIR/client/public/CNAME

# Create a modified index.html that loads the correct paths
cat > $GITHUB_DIR/client/index.html << EOL
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="./generated-icon.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Residency Swap</title>
    <meta name="description" content="A sophisticated client-side web application for healthcare professionals to manage complex residency schedule swaps with advanced scheduling intelligence." />
    <script>
      // Check if redirected from 404 page
      window.addEventListener('DOMContentLoaded', function() {
        var redirectPath = sessionStorage.getItem('redirect-path');
        if (redirectPath) {
          console.log('Redirected from 404 page, path:', redirectPath);
          sessionStorage.removeItem('redirect-path');
          // Use history API to update the URL without reloading
          var basePath = window.location.pathname.includes('/swap') ? '/swap/' : '/';
          if (redirectPath && redirectPath !== '/') {
            history.replaceState(null, null, basePath + redirectPath.substring(1));
          }
        }
      });
    </script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="./src/main.tsx"></script>
  </body>
</html>
EOL

# Create a .nojekyll file to prevent Jekyll processing
touch $GITHUB_DIR/.nojekyll
touch $GITHUB_DIR/client/public/.nojekyll

# Create a simple vite.config.ts that works for GitHub Pages
cat > $GITHUB_DIR/vite.config.ts << EOL
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { join } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  base: '/swap/',
  resolve: {
    alias: {
      '@': join(__dirname, './client/src'),
      '@components': join(__dirname, './client/src/components'),
      '@lib': join(__dirname, './client/src/lib'),
      '@hooks': join(__dirname, './client/src/hooks'),
      '@context': join(__dirname, './client/src/context'),
      '@pages': join(__dirname, './client/src/pages'),
      '@assets': join(__dirname, './attached_assets'),
    },
  },
  server: {
    host: '0.0.0.0',
  },
});
EOL

echo "Preparation complete!"
echo ""
echo "Next steps:"
echo "1. Download the '$GITHUB_DIR' directory from Replit"
echo "2. Extract it locally and initialize a new Git repository:"
echo "   git init"
echo "   git add ."
echo "   git commit -m 'Initial commit for GitHub Pages'"
echo ""
echo "3. Create a new GitHub repository named 'residency-swap'"
echo "4. Push to GitHub:"
echo "   git remote add origin https://github.com/YOUR_USERNAME/residency-swap.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "5. Enable GitHub Pages in repository settings:"
echo "   - Go to Settings > Pages"
echo "   - Select 'GitHub Actions' as the source"
echo "   - GitHub will use the workflow file in .github/workflows/deploy.yml"
echo ""
echo "Your site will be deployed at: adityasood.me/swap"