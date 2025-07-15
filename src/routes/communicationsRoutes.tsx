
import { RouteObject } from "react-router-dom";
import { SimpleRequireAuth } from "@/components/auth/SimpleRequireAuth";
import Communications from "@/pages/Communications";
import NotificationsPage from "@/pages/communications/NotificationsPage";
import TemplatesPage from "@/pages/communications/TemplatesPage";
import TrackingPage from "@/pages/communications/TrackingPage";

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
  },
  {
    path: "/communications/notifications",
    element: <SimpleRequireAuth><NotificationsPage /></SimpleRequireAuth>
  },
  {
    path: "/communications/templates",
    element: <SimpleRequireAuth><TemplatesPage /></SimpleRequireAuth>
  },
  {
    path: "/communications/tracking",
    element: <SimpleRequireAuth><TrackingPage /></SimpleRequireAuth>
  }
];
