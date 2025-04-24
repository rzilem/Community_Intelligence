
import React from 'react';
import { Navigate } from 'react-router-dom';
import HomeownerListPage from '../pages/homeowners/HomeownerListPage';
import Dashboard from '../pages/Dashboard';
import LoginPage from '../pages/auth/LoginPage';
import RegistrationPage from '../pages/auth/RegistrationPage';

export const mainRoutes = [
  {
    path: "/dashboard",
    element: <Dashboard />,
    protected: true
  },
  {
    path: "/homeowners",
    element: <HomeownerListPage />,
    protected: true
  },
  {
    path: "/auth/login",
    element: <LoginPage />,
    protected: false
  },
  {
    path: "/auth/register",
    element: <RegistrationPage />,
    protected: false
  },
];
