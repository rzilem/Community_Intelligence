
import { RouteObject } from "react-router-dom";
import { RequireAuth } from "@/components/auth/RequireAuth";
import PollsPage from "@/pages/community/PollsPage";
import CompliancePage from "@/pages/compliance/CompliancePage";

export const communityRoutes: RouteObject[] = [
  {
    path: "/community/polls",
    element: <RequireAuth><PollsPage /></RequireAuth>
  },
  {
    path: "/compliance",
    element: <RequireAuth><CompliancePage /></RequireAuth>
  }
];
