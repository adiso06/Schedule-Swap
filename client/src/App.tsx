import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ScheduleProvider } from "./context/ScheduleContext";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Footer from "@/components/Footer";
import { useEffect } from "react";
import { BASE_PATH, getGitHubPagesPath } from "./lib/gitHubPagesConfig";

// Create a custom hook for base path
const useBasePath = () => {
  // This will return the base path ('/Schedule-Swap' for GitHub Pages or '' for local development)
  return BASE_PATH;
};

// Create a hook for handling 404 page redirects
const useRedirectFromSessionStorage = () => {
  const [location, setLocation] = useLocation();

  useEffect(() => {
    // Check if we were redirected from the 404 page
    const redirectPath = sessionStorage.getItem('redirect-path');
    if (redirectPath) {
      console.log('Found redirect path in session storage:', redirectPath);
      // Remove the value from sessionStorage to prevent future redirects
      sessionStorage.removeItem('redirect-path');
      
      // Extract the path without the base path
      const cleanPath = redirectPath.replace(BASE_PATH, '');
      console.log('Clean path after removing base path:', cleanPath);
      
      // Only redirect if we're not already on the target path
      if (location !== cleanPath) {
        // If the redirectPath is not empty or "/", update the location
        if (cleanPath && cleanPath !== '/') {
          setLocation(cleanPath);
        } else {
          // Default to home page
          setLocation('/');
        }
      }
    }
  }, [location, setLocation]);
  
  return null;
};

function Router() {
  // This helps with GitHub Pages SPA routing
  useRedirectFromSessionStorage();
  
  return (
    <Switch>
      <Route path="/" component={Home} />
      {/* If we have additional routes, they will be added here */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const basePath = useBasePath();
  
  // Handle GitHub Pages routing on initial load
  useEffect(() => {
    // Check for a redirect path from the 404.html page
    const redirectPath = sessionStorage.getItem('redirect-path');
    if (redirectPath) {
      console.log('Initial load with redirect path:', redirectPath);
    }
    
    // Log the environment and current path
    console.log('App initialized with base path:', basePath);
    console.log('Current pathname:', window.location.pathname);
    
    // For debugging GitHub Pages URLs
    if (window.location.hostname.endsWith('github.io')) {
      console.log('GitHub Pages detected');
      console.log('Path segments:', window.location.pathname.split('/'));
    }
  }, [basePath]);
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ScheduleProvider>
          <WouterRouter base={basePath}>
            <div className="flex flex-col min-h-screen">
              <Toaster />
              <Router />
              <Footer />
            </div>
          </WouterRouter>
        </ScheduleProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
