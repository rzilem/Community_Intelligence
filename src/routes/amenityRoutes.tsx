
import { RouteObject } from "react-router-dom";
import { RequireAuth } from "@/components/auth/RequireAuth";
import AmenityBookingPage from "@/pages/amenities/AmenityBookingPage";

export const amenityRoutes: RouteObject[] = [
  {
    path: "/amenities",
    element: <RequireAuth><AmenityBookingPage /></RequireAuth>
  }
];
