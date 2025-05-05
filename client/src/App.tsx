import { Switch, Route, Router as WouterRouter } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ScheduleProvider } from "./context/ScheduleContext";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Footer from "@/components/Footer";
import { BASE_PATH } from "./lib/gitHubPagesConfig";

// Create a custom hook for base path
const useBasePath = () => {
  // This will return the base path ('/swap' for GitHub Pages or '' for local development)
  return BASE_PATH;
};

function Router() {
  const basePath = useBasePath();
  
  return (
    <Switch>
      <Route path={`${basePath}/`} component={Home} />
      <Route path={`${basePath}`} component={Home} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const basePath = useBasePath();
  
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
