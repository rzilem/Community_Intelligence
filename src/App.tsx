
import { RouterProvider } from "react-router-dom";
import { router } from "./routes/index";
import { NotificationProvider } from './hooks/useRealTimeNotifications';
import './App.css';

function App() {
  return (
    <NotificationProvider>
      <RouterProvider router={router} />
    </NotificationProvider>
  );
}

export default App;
