# Residency Swap Application

A sophisticated client-side web application for healthcare professionals to manage complex residency schedule swaps with advanced scheduling intelligence.

## Features

- Import and visualize residency schedules
- Identify valid swap opportunities based on complex rules
- Manage PGY levels and assignment compatibility
- Find payback swap options
- Save and manage multiple schedules

## Technologies

- React with TypeScript
- Shadcn UI for modern, accessible component design
- React Day Picker for date selection
- Context API for state management
- Custom hooks for advanced schedule manipulation
- Responsive design with intuitive user interactions

## Deployment to GitHub Pages

This project is configured to be deployed to GitHub Pages at `adityasood.me/swap`. Follow these steps to deploy:

### Automatic Deployment with GitHub Actions

1. Fork or clone this repository to your GitHub account
2. Create a new repository named "residency-swap"
3. Push this code to your new repository
4. Go to the repository settings > Pages
5. Set the GitHub Pages source to GitHub Actions

The GitHub Actions workflow will automatically build and deploy the application whenever changes are pushed to the main branch.

### Manual Deployment

If you prefer manual deployment:

1. Clone the repository
2. Run `chmod +x build-for-github.sh` if not already executable
3. Run `./build-for-github.sh` to build the application for GitHub Pages
4. The built files will be in the `dist/public` directory
5. Commit and push these files to the `gh-pages` branch of your repository

## Configuring with your domain

To make this application accessible at `adityasood.me/swap`:

1. Ensure your domain `adityasood.me` is already configured with GitHub Pages for your repository "personal-website"
2. In your repository "personal-website", create a file at the path `public/swap/.nojekyll` (to prevent Jekyll processing)
3. In your repository "residency-swap", ensure the GitHub Pages settings are properly configured
4. The GitHub Actions workflow will build with the correct base path (`/swap/`) for the subdirectory

## Local Development

1. Install dependencies: `npm install`
2. Start the development server: `npm run dev`
3. Open your browser to `http://localhost:3000`

## Building for Production

To build for production (not GitHub Pages):

```
npm run build
```

## License

MIT