
import { RouterProvider } from "react-router-dom";
import { router } from "./routes/index";
import { NotificationProvider } from './hooks/useRealTimeNotifications';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './App.css';

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <NotificationProvider>
        <RouterProvider router={router} />
      </NotificationProvider>
    </QueryClientProvider>
  );
}

export default App;
