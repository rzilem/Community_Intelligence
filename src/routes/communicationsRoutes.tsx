
import { RouteObject } from "react-router-dom";
import { RequireAuth } from "@/components/auth/RequireAuth";
import Communications from "@/pages/Communications";
import { MessageProvider } from "@/contexts/message/MessageContext";

// Communications Routes
export const communicationsRoutes: RouteObject[] = [
  {
    path: "/communications",
    element: <RequireAuth><Communications /></RequireAuth>
  },
  {
    path: "/communications/messaging",
    element: <RequireAuth><Communications /></RequireAuth>
  },
  {
    path: "/communications/announcements",
    element: <RequireAuth><Communications /></RequireAuth>
  }
];
