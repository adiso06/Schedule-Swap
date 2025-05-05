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

This project is configured to be deployed to GitHub Pages. Follow these steps to deploy:

### Automatic Deployment with GitHub Actions

1. Push changes to the main branch
2. GitHub Actions will automatically build and deploy the application
3. Your site will be available at https://adityasood.me/swap/

### Manual Deployment

If you prefer manual deployment:

1. Build the application for GitHub Pages:
   ```
   npm run build:gh-pages
   ```
2. The built files will be in the `dist/public` directory
3. You can deploy these files to GitHub Pages or any static hosting service

## Local Development

1. Install dependencies:
   ```
   npm install
   ```
2. Start the development server:
   ```
   npm run dev
   ```
3. Open your browser to `http://localhost:3000`

## License

MIT