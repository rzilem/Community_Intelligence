
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
            <ErrorBoundary
              fallback={
                <div className="p-8">
                  <h2 className="text-xl font-bold mb-4">Authentication System Error</h2>
                  <p className="mb-4">There was a problem with the authentication system. Please refresh the page.</p>
                  <button
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                    onClick={() => window.location.reload()}
                  >
                    Refresh Application
                  </button>
                </div>
              }
            >
              <AuthProvider>
                <ErrorBoundary
                  fallback={
                    <div className="p-8">
                      <h2 className="text-xl font-bold mb-4">Notification System Error</h2>
                      <p className="mb-4">There was a problem with the notification system. The app will continue to function without notifications.</p>
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
                          <p className="mb-4">There was a problem loading this page. Please try navigating to another page.</p>
                          <div className="space-x-4">
                            <button
                              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                              onClick={() => window.location.href = '/'}
                            >
                              Go to Home
                            </button>
                            <button
                              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                              onClick={() => window.location.href = '/dashboard'}
                            >
                              Go to Dashboard
                            </button>
                            <button
                              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
                              onClick={() => window.location.reload()}
                            >
                              Refresh Page
                            </button>
                          </div>
                        </div>
                      }
                    >
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
