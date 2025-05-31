
import { Route } from './types';
import { mainRoutes } from './mainRoutes';
import { communicationRoutes } from './communicationRoutes';
import { adminRoutes } from './adminRoutes';
import { billingRoutes } from './billingRoutes';
import { onboardingRoutes } from './onboardingRoutes';
import { aiRoutes } from './aiRoutes';
import { amenityRoutes } from './amenityRoutes';
import { reportingRoutes } from './reportingRoutes';
import { notificationRoutes } from './notificationRoutes';
import { portalRoutes } from './portalRoutes';

export type { Route } from './types';

export const protectedRoutes: Route[] = [
  ...mainRoutes,
  ...communicationRoutes,
  ...billingRoutes,
  ...onboardingRoutes,
  ...adminRoutes,
  ...aiRoutes,
  ...amenityRoutes,
  ...reportingRoutes,
  ...notificationRoutes,
  ...portalRoutes,
];

export { navigationItems } from './navigationConfig';
