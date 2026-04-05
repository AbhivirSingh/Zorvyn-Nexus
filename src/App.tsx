import { Switch, Route, Router, useLocation } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster, ToastProvider } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Sidebar } from "./components/layout/Sidebar";
import { Header } from "./components/layout/Header";
import { MobileNav } from "./components/layout/MobileNav";
import { MobileSidebar } from "./components/layout/MobileSidebar";
import { CommandPalette } from "./components/shared/CommandPalette";
import { NotificationPanel } from "./components/shared/NotificationPanel";
import OverviewPage from "./pages/overview";
import TransactionsPage from "./pages/transactions";
import InsightsPage from "./pages/insights";
import NotFound from "@/pages/not-found";
import { useTheme } from "./hooks/useTheme";

/** Maps routes to page titles for the header */
const PAGE_TITLES: Record<string, string> = {
  '/': 'Overview',
  '/transactions': 'Transactions',
  '/insights': 'Insights',
};

function AppLayout() {
  // Initialize theme system
  useTheme();
  const [location] = useLocation();
  const title = PAGE_TITLES[location] || 'Zorvyn Nexus';

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Skip to content — A11y */}
      <a href="#main-content" className="skip-link" tabIndex={0}>
        Skip to content
      </a>

      {/* Desktop sidebar */}
      <Sidebar />

      {/* Mobile sidebar overlay */}
      <MobileSidebar />

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={title} />

        <main
          id="main-content"
          className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 md:pb-6"
          role="main"
        >
          <Switch>
            <Route path="/" component={OverviewPage} />
            <Route path="/transactions" component={TransactionsPage} />
            <Route path="/insights" component={InsightsPage} />
            <Route component={NotFound} />
          </Switch>
        </main>
      </div>

      {/* Mobile bottom nav */}
      <MobileNav />

      {/* Global overlays */}
      <CommandPalette />
      <NotificationPanel />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ToastProvider>
          <Toaster />
          <Router hook={useHashLocation}>
            <AppLayout />
          </Router>
        </ToastProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;