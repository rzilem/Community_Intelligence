
import { useEffect } from 'react';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { mainRoutes } from '@/routes';
import { AuthProvider } from './contexts/auth/AuthProvider';
import { Toaster as SonnerToaster } from 'sonner';
import { useSystemSetting } from '@/hooks/settings/use-system-settings';
import { applyAppearanceSettings } from '@/hooks/settings/use-system-settings-helpers';
import { AppearanceSettings } from '@/types/settings-types';

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
    <AuthProvider>
      <RouterProvider router={router} />
      <Toaster />
      <SonnerToaster position="top-right" />
    </AuthProvider>
  );
}

export default App;
