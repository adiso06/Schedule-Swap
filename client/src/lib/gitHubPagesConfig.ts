/**
 * Configuration for GitHub Pages deployment
 * This helps with routing when the app is deployed to a subdirectory
 */

// Determine if we're running in GitHub Pages environment
const isGitHubPages = import.meta.env.GITHUB_PAGES === 'true' || window.location.pathname.includes('/swap');

// Set the base path for GitHub Pages deployment
export const BASE_PATH = isGitHubPages ? '/swap' : '';

/**
 * Helper function to get a path with the correct base path
 * @param path The path to format with the base path
 * @returns The path with the correct base path prefix
 */
export function getGitHubPagesPath(path: string): string {
  // Ensure path starts with a slash
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${BASE_PATH}${normalizedPath}`;
}