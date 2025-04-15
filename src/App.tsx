
import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { mainRoutes } from '@/routes';
import { AuthProvider } from './contexts/auth/AuthProvider';
import { Toaster as SonnerToaster } from 'sonner';
import { AppearanceSettings } from '@/types/settings-types';
import { useSystemSetting } from '@/hooks/settings/use-system-settings';
import { applyAppearanceSettings } from '@/hooks/settings/use-system-settings-helpers';
import { TooltipProvider } from '@/components/ui/tooltip';

// Create router
const router = createBrowserRouter(mainRoutes);

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false
    }
  }
});

// Create AppContent component to use hooks after QueryClientProvider is available
function AppContent() {
  // Load appearance settings
  const appearanceSettings = useSystemSetting<AppearanceSettings>('appearance').data;
  
  // Apply appearance settings on app load
  useEffect(() => {
    if (appearanceSettings) {
      applyAppearanceSettings(appearanceSettings);
    }
  }, [appearanceSettings]);

  return (
    <TooltipProvider>
      <AuthProvider>
        <RouterProvider router={router} />
        <Toaster />
        <SonnerToaster position="top-right" />
      </AuthProvider>
    </TooltipProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}

export default App;
