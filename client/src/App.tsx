import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ScheduleProvider } from "./context/ScheduleContext";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Moonlighting from "@/pages/Moonlighting";
import Footer from "@/components/Footer";
import { useEffect } from "react";
import { BASE_PATH, getGitHubPagesPath } from "./lib/gitHubPagesConfig";

// Create a custom hook for base path
const useBasePath = () => {
  // This will return the base path ('/swap' for GitHub Pages or '' for local development)
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
      
      // Only redirect if we're not already on the target path
      if (location !== redirectPath) {
        // If the redirectPath is not "/", update the location
        if (redirectPath !== '/') {
          setLocation(redirectPath);
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
      <Route path="/moonlighting" component={Moonlighting} />
      {/* If we have additional routes, they will be added here */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const basePath = useBasePath();
  
  // Handle GitHub Pages redirect on initial load
  useEffect(() => {
    // Check for a redirect path from the 404.html page
    const redirectPath = sessionStorage.getItem('redirect-path');
    if (redirectPath) {
      console.log('Initial load with redirect path:', redirectPath);
    }
    
    // Log the environment
    console.log('App initialized with base path:', basePath);
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
