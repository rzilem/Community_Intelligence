
import { RouteObject } from "react-router-dom";
import { SimpleRequireAuth } from "@/components/auth/SimpleRequireAuth";
import Communications from "@/pages/Communications";

// Communications Routes with simplified auth
export const communicationsRoutes: RouteObject[] = [
  {
    path: "/communications",
    element: <SimpleRequireAuth><Communications /></SimpleRequireAuth>
  },
  {
    path: "/communications/messaging",
    element: <SimpleRequireAuth><Communications /></SimpleRequireAuth>
  },
  {
    path: "/communications/announcements",
    element: <SimpleRequireAuth><Communications /></SimpleRequireAuth>
  }
];
