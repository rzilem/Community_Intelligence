
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
import GlobalErrorHandler from "./components/GlobalErrorHandler";
import { logger } from "./utils/client-logger";

// Create the query client outside of the component with optimized settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors (client errors)
        if (error?.status >= 400 && error?.status < 500) return false;
        return failureCount < 2; // Retry up to 2 times for other errors
      },
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1, // Retry mutations once
    },
  },
});

// Use memo to prevent unnecessary re-renders
const MemoizedAppRouter = memo(AppRouter);

const App = () => {
  // Initialize the logger once when the app starts
  useEffect(() => {
    logger.init();
    console.log('🚀 Community Intelligence - App initialized');
  }, []);

  return (
    <ErrorBoundary showDetails={import.meta.env.MODE === 'development'}>
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <AuthProvider>
              <ErrorBoundary
                fallback={
                  <div className="min-h-screen flex items-center justify-center p-8">
                    <div className="text-center space-y-4">
                      <h2 className="text-2xl font-bold text-red-600">Authentication System Error</h2>
                      <p className="text-gray-600">There was a problem with the authentication system.</p>
                      <button
                        className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg"
                        onClick={() => window.location.reload()}
                      >
                        Refresh Application
                      </button>
                    </div>
                  </div>
                }
              >
                <ErrorBoundary
                  fallback={
                    <div className="min-h-screen flex items-center justify-center p-8">
                      <div className="text-center space-y-4">
                        <h2 className="text-2xl font-bold text-red-600">Notification System Error</h2>
                        <p className="text-gray-600">There was a problem with notifications. The app will continue without them.</p>
                        <button
                          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg"
                          onClick={() => window.location.reload()}
                        >
                          Refresh Application
                        </button>
                      </div>
                    </div>
                  }
                >
                  <NotificationProvider>
                    <GlobalErrorHandler />
                    <Toaster />
                    <Sonner 
                      position="top-right"
                      toastOptions={{
                        duration: 4000,
                        style: {
                          background: 'white',
                          border: '1px solid #e2e8f0',
                          color: '#1e293b',
                        },
                      }}
                    />
                    <ErrorBoundary
                      fallback={
                        <div className="min-h-screen flex items-center justify-center p-8">
                          <div className="text-center space-y-4">
                            <h2 className="text-2xl font-bold text-red-600">Navigation Error</h2>
                            <p className="text-gray-600">There was a problem loading this page.</p>
                            <div className="space-x-4">
                              <button
                                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg"
                                onClick={() => window.location.href = '/dashboard'}
                              >
                                Go to Dashboard
                              </button>
                              <button
                                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg"
                                onClick={() => window.location.reload()}
                              >
                                Refresh Page
                              </button>
                            </div>
                          </div>
                        </div>
                      }
                    >
                      <MemoizedAppRouter />
                    </ErrorBoundary>
                  </NotificationProvider>
                </ErrorBoundary>
              </ErrorBoundary>
            </AuthProvider>
          </TooltipProvider>
        </QueryClientProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
};

export default App;
