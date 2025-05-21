
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
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <ErrorBoundary>
            <AuthProvider>
              <ErrorBoundary
                fallback={
                  <div className="p-8">
                    <h2 className="text-xl font-bold mb-4">Notification Error</h2>
                    <p>There was a problem loading notifications. The app will continue to function without them.</p>
                  </div>
                }
              >
                <NotificationProvider>
                  <Toaster />
                  <Sonner />
                  <MemoizedAppRouter />
                </NotificationProvider>
              </ErrorBoundary>
            </AuthProvider>
          </ErrorBoundary>
        </TooltipProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
};

export default App;
