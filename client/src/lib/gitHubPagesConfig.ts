/**
 * Configuration file for GitHub Pages deployments
 * 
 * The application can run in two different environments:
 * 1. Local development - Base path is '/'
 * 2. GitHub Pages - Base path is '/swap/'
 * 
 * This file provides utilities to handle these differences
 */

// Check if the app is running on GitHub Pages
const isGitHubPages = 
  typeof window !== 'undefined' && 
  (window.location.hostname === 'adityasood.me' || 
   import.meta.env.GITHUB_PAGES === 'true');

// Determine the base path based on environment
// This will be '/swap' when deployed to GitHub Pages
export const BASE_PATH = isGitHubPages ? '/swap' : '';

// Log the environment on startup
console.log('Application running with base path:', BASE_PATH);

/**
 * Helper function to get a path with the correct base path
 * @param path The path to format with the base path
 * @returns The path with the correct base path prefix
 */
export function getGitHubPagesPath(path: string): string {
  // Don't add base path if it's already there or if we're not on GitHub Pages
  if (path.startsWith(BASE_PATH) || BASE_PATH === '') {
    return path;
  }

  // Ensure path starts with '/'
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${BASE_PATH}${normalizedPath}`;
}

/**
 * Helper function to get an asset URL with the correct base path
 * @param assetPath The asset path relative to the public directory
 * @returns The asset URL with the correct base path prefix
 */
export function getAssetUrl(assetPath: string): string {
  // Remove leading slash if present
  const normalizedPath = assetPath.startsWith('/') ? assetPath.substring(1) : assetPath;
  return `${BASE_PATH}/${normalizedPath}`;
}

/**
 * Check if the current runtime is GitHub Pages
 * For use in conditional logic that needs to behave differently on GitHub Pages
 */
export function isGitHubPagesEnvironment(): boolean {
  return isGitHubPages;
}