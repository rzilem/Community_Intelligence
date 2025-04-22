
import { RouteObject } from "react-router-dom";
import { RequireAuth } from "@/components/auth/RequireAuth";
import DocumentsPage from "@/pages/documents/DocumentsPage";

export const documentRoutes: RouteObject[] = [
  {
    path: "/documents",
    element: <RequireAuth><DocumentsPage /></RequireAuth>
  }
];
