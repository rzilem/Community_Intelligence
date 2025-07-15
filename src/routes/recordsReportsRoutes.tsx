
import React from 'react';
import RecordsReports from '@/pages/records-reports/RecordsReports';
import Documents from '@/pages/records-reports/Documents';
import ReportsPage from '@/pages/records-reports/ReportsPage';
import DataImportExport from '@/pages/system/DataImportExport';

export const recordsReportsRoutes = [
  {
    path: '/records-reports',
    element: <RecordsReports />
  },
  {
    path: '/records-reports/documents',
    element: <Documents />
  },
  {
    path: '/records-reports/reports',
    element: <ReportsPage />
  },
  {
    path: '/records-reports/data-import-export',
    element: <DataImportExport />
  },
  {
    path: '/data-import-export',
    element: <DataImportExport />
  }
];
