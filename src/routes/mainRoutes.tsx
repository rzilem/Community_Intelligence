
import React from 'react';
import { Navigate } from 'react-router-dom';
import HomeownerListPage from '../pages/homeowners/HomeownerListPage';
import Dashboard from '../pages/Dashboard';
import LoginPage from '../pages/auth/LoginPage';
import RegistrationPage from '../pages/auth/RegistrationPage';

export const mainRoutes = [
  {
    path: "/",
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: "/dashboard",
    element: <Dashboard />,
  },
  {
    path: "/homeowners",
    element: <HomeownerListPage />,
  },
  {
    path: "/auth/login",
    element: <LoginPage />,
  },
  {
    path: "/auth/register",
    element: <RegistrationPage />,
  },
];
