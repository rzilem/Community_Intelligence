
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/contexts/auth';
import { NotificationProvider } from '@/contexts/notifications';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "@/components/ui/toaster"
import GlobalErrorBoundary from '@/components/GlobalErrorBoundary';
import GlobalErrorHandler from '@/components/GlobalErrorHandler';
import { AppRouter } from '@/routes/AppRouter';

console.log('🚀 App.tsx: Initializing App component...');

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

console.log('✅ App.tsx: QueryClient created');

function App() {
  console.log('🚀 App.tsx: App component rendering...');

  // Ensure CSS is loaded
  React.useEffect(() => {
    console.log('🎨 App.tsx: CSS and styles should be loaded');
    // Force a repaint to ensure styles are applied
    document.body.style.visibility = 'hidden';
    setTimeout(() => {
      document.body.style.visibility = 'visible';
    }, 0);
  }, []);

  return (
    <GlobalErrorBoundary>
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <GlobalErrorHandler />
            <AuthProvider>
              <NotificationProvider>
                <AppRouter />
              </NotificationProvider>
            </AuthProvider>
          </TooltipProvider>
        </QueryClientProvider>
      </BrowserRouter>
    </GlobalErrorBoundary>
  );
}

console.log('✅ App.tsx: App component defined');

export default App;
