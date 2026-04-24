import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import HomeScreen from "@/pages/HomeScreen";
import Welcome from "@/pages/Welcome";
import Baseline from "@/pages/Baseline";
import BaselineResult from "@/pages/BaselineResult";
import TreeHole from "@/pages/TreeHole";
import Report from "@/pages/Report";
import Profile from "@/pages/Profile";
import Achievements from "@/pages/Achievements";
import BlindBox from "@/pages/BlindBox";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomeScreen} />
      <Route path="/welcome" component={Welcome} />
      <Route path="/baseline" component={Baseline} />
      <Route path="/baseline-result" component={BaselineResult} />
      <Route path="/tree-hole" component={TreeHole} />
      <Route path="/report" component={Report} />
      <Route path="/profile" component={Profile} />
      <Route path="/achievements" component={Achievements} />
      <Route path="/blindbox" component={BlindBox} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: "#FCFCF9",
              border: "1px solid #E8DDD2",
              color: "#5C4A3F",
              borderRadius: "16px",
            },
          }}
        />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
