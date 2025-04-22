
import { createBrowserRouter } from "react-router-dom";
import { documentRoutes } from "./documentRoutes";
import { maintenanceRoutes } from "./maintenanceRoutes";
import { amenityRoutes } from "./amenityRoutes";

export const router = createBrowserRouter([
  ...documentRoutes,
  ...maintenanceRoutes,
  ...amenityRoutes,
]);
