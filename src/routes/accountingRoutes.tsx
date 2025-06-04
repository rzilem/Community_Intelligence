
import React from 'react';
import { Calculator, Receipt, FileText, TrendingUp } from 'lucide-react';
import Accounting from '@/pages/Accounting';
import InvoiceQueue from '@/pages/accounting/InvoiceQueue';
import { Route } from './types';

export const accountingRoutes: Route[] = [
  {
    path: 'accounting',
    element: <Accounting />,
    label: 'Accounting',
    icon: Calculator,
    category: 'accounting',
    requiresAuth: true,
    description: 'Manage finances, budgets, and transactions'
  },
  {
    path: 'accounting/dashboard',
    element: <Accounting />,
    label: 'Accounting Dashboard',
    category: 'accounting',
    requiresAuth: true,
    description: 'Financial overview and metrics'
  },
  {
    path: 'accounting/invoice-queue',
    element: <InvoiceQueue />,
    label: 'Invoice Queue',
    category: 'accounting',
    requiresAuth: true,
    description: 'Process and approve vendor invoices'
  },
  {
    path: 'accounting/invoice-queue/:id',
    element: <InvoiceQueue />,
    category: 'accounting',
    requiresAuth: true,
    description: 'View invoice details'
  },
  {
    path: 'accounting/invoice-queue/new',
    element: <InvoiceQueue />,
    category: 'accounting',
    requiresAuth: true,
    description: 'Create new invoice'
  },
];
