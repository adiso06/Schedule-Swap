/**
 * Configuration file for GitHub Pages deployments
 * 
 * This file provides utilities to handle different deployment environments
 * without hardcoding repository names or paths.
 */

// Function to detect the base path at runtime
const detectBasePath = (): string => {
  if (typeof window === 'undefined') {
    return ''; // Default for SSR
  }
  
  const { hostname, pathname } = window.location;
  
  // For GitHub Pages, we need to detect the base path that includes the repository name
  if (hostname.endsWith('github.io')) {
    const pathParts = pathname.split('/').filter(Boolean);
    
    // If there's at least one path segment (the repo name)
    if (pathParts.length > 0) {
      // GitHub Pages - use only the repository name as the base path
      // The whole /repo-name/swap/ path is handled by our directory structure
      return '/' + pathParts[0]; // e.g., /Schedule-Swap
    }
  }
  
  // For custom domains like adityasood.me or localhost
  return '';
};

// Determine the runtime base path
export const BASE_PATH = detectBasePath();

// Log the environment on startup
console.log('Application running with base path:', BASE_PATH);
console.log('Hostname:', typeof window !== 'undefined' ? window.location.hostname : 'SSR');
console.log('Pathname:', typeof window !== 'undefined' ? window.location.pathname : 'SSR');

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
  
  // For GitHub Pages, include /swap/ in the path
  if (typeof window !== 'undefined' && window.location.hostname.endsWith('github.io')) {
    return `${BASE_PATH}/swap${normalizedPath}`;
  }
  
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
  
  // If we're in the /swap/ directory, adjust paths for assets
  if (typeof window !== 'undefined' && 
      window.location.pathname.includes('/swap/')) {
    return normalizedPath;
  }
  
  return `${BASE_PATH}/${normalizedPath}`;
}

/**
 * Check if the current runtime is GitHub Pages
 * For use in conditional logic that needs to behave differently on GitHub Pages
 */
export function isGitHubPagesEnvironment(): boolean {
  return typeof window !== 'undefined' && window.location.hostname.endsWith('github.io');
}