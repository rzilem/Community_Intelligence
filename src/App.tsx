
import React, { memo } from "react";
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

// Initialize the client logger
logger.init();

// Create the query client outside of the component with optimized settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      retry: 1,
      refetchOnWindowFocus: false, // Prevent refetches on window focus
      refetchOnMount: false, // Prevent refetches when components mount
      refetchOnReconnect: false, // Prevent refetches on reconnect
    },
  },
});

// Use memo to prevent unnecessary re-renders
const MemoizedAppRouter = memo(AppRouter);

const App = () => {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <AuthProvider>
              <ErrorBoundary
                fallback={
                  <div className="p-8">
                    <h2 className="text-xl font-bold mb-4">Notification System Error</h2>
                    <p>There was a problem with the notification system. The app will continue to function without notifications.</p>
                    <button
                      className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                      onClick={() => window.location.reload()}
                    >
                      Refresh Application
                    </button>
                  </div>
                }
              >
                <NotificationProvider>
                  <Toaster />
                  <Sonner />
                  <ErrorBoundary
                    fallback={
                      <div className="p-8 text-center">
                        <h2 className="text-2xl font-bold text-red-600 mb-4">Route Error</h2>
                        <p className="mb-4">There was a problem loading this page. Other parts of the application should still work.</p>
                        <button
                          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                          onClick={() => window.location.href = '/'}
                        >
                          Go to Dashboard
                        </button>
                      </div>
                    }
                  >
                    <MemoizedAppRouter />
                  </ErrorBoundary>
                </NotificationProvider>
              </ErrorBoundary>
            </AuthProvider>
          </TooltipProvider>
        </QueryClientProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
};

export default App;
