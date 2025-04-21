
import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import HomeownerListPage from './pages/homeowners/HomeownerListPage';
import HomeownerDetailPage from './pages/HomeownerDetailPage';
import ResidentDetailPage from './pages/ResidentDetailPage';
import ResidentListPage from './pages/residents/ResidentListPage';
import UserProfile from './pages/user/UserProfile';
import HomeownerDashboard from './pages/portal/HomeownerDashboard';
import HomeownerPortalPage from './pages/portal/HomeownerPortalPage';

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomeownerListPage />,
  },
  {
    path: "/homeowners",
    element: <HomeownerListPage />,
  },
  {
    path: "/homeowners/:id",
    element: <HomeownerDetailPage />,
  },
  {
    path: "/residents",
    element: <ResidentListPage />,
  },
  {
    path: "/residents/:id",
    element: <ResidentDetailPage />,
  },
  {
    path: "/user/profile",
    element: <UserProfile />,
  },
  {
    path: "/portal/homeowner",
    element: <HomeownerPortalPage />,
  },
  {
    path: "/portal/homeowner-dashboard",
    element: <HomeownerDashboard />,
  },
]);

export default router;
