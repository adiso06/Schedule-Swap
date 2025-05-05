import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ScheduleProvider } from "./context/ScheduleContext";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import PaybackSwapPage from "@/pages/PaybackSwapPage";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/payback-swaps" component={PaybackSwapPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ScheduleProvider>
          <Toaster />
          <Router />
        </ScheduleProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
