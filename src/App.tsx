
import React, { memo, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./contexts/auth";
import { NotificationProvider } from "./contexts/notifications";
import { AppRouter } from "./routes";
import ErrorBoundary from "./components/ErrorBoundary";
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
      console.log('App initialized - client logger initialized');
    } catch (error) {
      console.error('Failed to initialize logger:', error);
    }
  }, []);

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <ErrorBoundary>
              <AuthProvider>
                <ErrorBoundary>
                  <NotificationProvider>
                    <Toaster />
                    <Sonner />
                    <ErrorBoundary>
                      <MemoizedAppRouter />
                    </ErrorBoundary>
                  </NotificationProvider>
                </ErrorBoundary>
              </AuthProvider>
            </ErrorBoundary>
          </TooltipProvider>
        </QueryClientProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
};

export default App;
