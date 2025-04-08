
import { RouteObject } from "react-router-dom";
import { RequireAuth } from "@/components/auth/RequireAuth";
import Messaging from "@/pages/communications/Messaging";
import Announcements from "@/pages/communications/Announcements";

// Communications Routes
export const communicationsRoutes: RouteObject[] = [
  {
    path: "/communications/messaging",
    element: <RequireAuth><Messaging /></RequireAuth>
  },
  {
    path: "/communications/announcements",
    element: <RequireAuth><Announcements /></RequireAuth>
  }
];
