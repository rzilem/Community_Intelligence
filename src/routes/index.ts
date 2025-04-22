
import { createBrowserRouter } from "react-router-dom";
import { appRoutes } from "./appRoutes";
import { landingRoutes } from "./landingRoutes";
import { homeownerRoutes } from "./homeownerRoutes";
import { accountingRoutes } from "./accountingRoutes";
import { analyticsRoutes } from "./analyticsRoutes";
import { authRoutes } from "./authRoutes";
import { communicationsRoutes } from "./communicationsRoutes";
import { complianceRoutes } from "./complianceRoutes";
import { onboardingRoutes } from "./onboardingRoutes";
import { portalRoutes } from "./portalRoutes";
import { settingsRoutes } from "./settingsRoutes";
import { documentRoutes } from "./documentRoutes";
import { maintenanceRoutes } from "./maintenanceRoutes";

export const router = createBrowserRouter([
  ...landingRoutes,
  ...appRoutes,
  ...homeownerRoutes,
  ...accountingRoutes,
  ...analyticsRoutes,
  ...authRoutes,
  ...communicationsRoutes,
  ...complianceRoutes,
  ...onboardingRoutes,
  ...portalRoutes,
  ...settingsRoutes,
  ...documentRoutes,
  ...maintenanceRoutes,
]);
