
import React, { memo, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { SafeTooltipProvider } from "@/components/ui/safe-tooltip-provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./contexts/auth";
import { NotificationProvider } from "./contexts/notifications";
import { AppRouter } from "./routes";
import ErrorBoundary from "./components/ErrorBoundary";
import { AuthDebugger } from "./components/debug/AuthDebugger";
import { logger } from "./utils/client-logger";

// Create the query client outside of the component with optimized settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      refetchOnReconnect: true,
    },
  },
});

// Use memo to prevent unnecessary re-renders
const MemoizedAppRouter = memo(AppRouter);

const App = () => {
  // Initialize the logger once when the app starts
  useEffect(() => {
    try {
      logger.init();
      console.log('[App] Application initialized - client logger initialized');
      console.log('[App] Current route:', window.location.pathname);
    } catch (error) {
      console.error('[App] Failed to initialize logger:', error);
    }
  }, []);

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <SafeTooltipProvider>
            <ErrorBoundary>
              <AuthProvider>
                <ErrorBoundary>
                  <NotificationProvider>
                    <Toaster />
                    <Sonner />
                    <ErrorBoundary>
                      <MemoizedAppRouter />
                      <AuthDebugger />
                    </ErrorBoundary>
                  </NotificationProvider>
                </ErrorBoundary>
              </AuthProvider>
            </ErrorBoundary>
          </SafeTooltipProvider>
        </QueryClientProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
};

export default App;
