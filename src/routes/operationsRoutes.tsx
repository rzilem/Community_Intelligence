import React from 'react';
import Operations from '@/pages/operations/Operations';
import Vendors from '@/pages/operations/Vendors';
import VendorProfile from '@/pages/operations/VendorProfile';
import Workflows from '@/pages/operations/Workflows';
import WorkflowDetails from '@/pages/operations/WorkflowDetails';
import LetterTemplates from '@/pages/operations/LetterTemplates';
import OperationsDashboard from '@/pages/operations/OperationsDashboard';
import OperationsCalendar from '@/pages/operations/OperationsCalendar';
import PrintQueue from '@/pages/operations/PrintQueue';
import OperationsReports from '@/pages/operations/OperationsReports';
import VendorsAdvanced from '@/pages/operations/VendorsAdvanced';
import MaintenanceRequests from '@/pages/operations/MaintenanceRequests';

export const operationsRoutes = [
  {
    path: '/operations',
    element: <Operations />
  },
  {
    path: '/maintenance-requests',
    element: <MaintenanceRequests />
  },
  {
    path: '/operations/dashboard',
    element: <OperationsDashboard />
  },
  {
    path: '/operations/calendar',
    element: <OperationsCalendar />
  },
  {
    path: '/operations/vendors',
    element: <Vendors />
  },
  {
    path: '/operations/vendors/advanced',
    element: <VendorsAdvanced />
  },
  {
    path: '/operations/vendors/:id',
    element: <VendorProfile />
  },
  {
    path: '/operations/workflows',
    element: <Workflows />
  },
  {
    path: '/operations/workflows/:id',
    element: <WorkflowDetails />
  },
  {
    path: '/operations/letter-templates',
    element: <LetterTemplates />
  },
  {
    path: '/operations/print-queue',
    element: <PrintQueue />
  },
  {
    path: '/operations/reports',
    element: <OperationsReports />
  }
];
