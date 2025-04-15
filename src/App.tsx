
import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { mainRoutes } from '@/routes';
import { AuthProvider } from './contexts/auth/AuthProvider';
import { Toaster as SonnerToaster } from 'sonner';
import { useSystemSetting } from '@/hooks/settings/use-system-settings';
import { applyAppearanceSettings } from '@/hooks/settings/use-system-settings-helpers';
import { AppearanceSettings } from '@/types/settings-types';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false
    }
  }
});

// Create the router with all the routes from mainRoutes
const router = createBrowserRouter(mainRoutes);

function App() {
  // Load appearance settings
  const { data: appearanceSettings } = useSystemSetting<AppearanceSettings>('appearance');
  
  // Apply appearance settings on app load
  useEffect(() => {
    if (appearanceSettings) {
      applyAppearanceSettings(appearanceSettings);
    }
  }, [appearanceSettings]);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
        <Toaster />
        <SonnerToaster position="top-right" />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
