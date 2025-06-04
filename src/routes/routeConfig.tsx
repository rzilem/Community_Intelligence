
import { Route } from './types';
import { mainRoutes } from './mainRoutes';
import { portfolioRoutes } from './portfolioRoutes';
import { communicationRoutes } from './communicationRoutes';
import { adminRoutes } from './adminRoutes';
import { billingRoutes } from './billingRoutes';
import { onboardingRoutes } from './onboardingRoutes';
import { aiRoutes } from './aiRoutes';
import { amenityRoutes } from './amenityRoutes';
import { reportingRoutes } from './reportingRoutes';
import { notificationRoutes } from './notificationRoutes';
import { portalRoutes } from './portalRoutes';
import { accountingRoutes } from './accountingRoutes';
import { customerServiceRoutes } from './customerServiceRoutes';
import { leadManagementRoutes } from './leadManagementRoutes';

export type { Route } from './types';

export const protectedRoutes: Route[] = [
  ...mainRoutes,
  ...portfolioRoutes,
  ...communicationRoutes,
  ...billingRoutes,
  ...accountingRoutes,
  ...onboardingRoutes,
  ...adminRoutes,
  ...aiRoutes,
  ...amenityRoutes,
  ...reportingRoutes,
  ...notificationRoutes,
  ...portalRoutes,
  ...customerServiceRoutes,
  ...leadManagementRoutes,
];

export { navigationItems } from './navigationConfig';
