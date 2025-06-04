
import React from 'react';
import { HeadphonesIcon, MessageSquare, Ticket, BarChart3 } from 'lucide-react';
import CustomerServiceDashboard from '@/pages/customer-service/CustomerServiceDashboard';
import InquiriesQueue from '@/pages/customer-service/InquiriesQueue';
import { Route } from './types';

export const customerServiceRoutes: Route[] = [
  {
    path: 'customer-service',
    element: <CustomerServiceDashboard />,
    label: 'Customer Service',
    icon: HeadphonesIcon,
    category: 'customer-service',
    requiresAuth: true,
    description: 'Manage customer inquiries and support tickets'
  },
  {
    path: 'customer-service/inquiries',
    element: <InquiriesQueue />,
    label: 'Inquiries Queue',
    category: 'customer-service',
    requiresAuth: true,
    description: 'Process customer service inquiries'
  },
  {
    path: 'customer-service/inquiries/:id',
    element: <InquiriesQueue />,
    category: 'customer-service',
    requiresAuth: true,
    description: 'View inquiry details'
  },
];
