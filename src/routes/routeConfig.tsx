import React from 'react';
import { RouteObject } from 'react-router-dom';
import { RequireAuth } from '@/components/auth/RequireAuth';
import ErrorBoundary from '@/components/ErrorBoundary';

console.log('🚀 RouteConfig: Loading route configuration...');

// Lazy load all pages for better performance
const Dashboard = React.lazy(() => {
  console.log('🚀 RouteConfig: Loading Dashboard component...');
  return import('@/pages/Dashboard');
});
const Associations = React.lazy(() => import('@/pages/Associations'));
const Homeowners = React.lazy(() => import('@/pages/Homeowners'));
const HomeownerDetailPage = React.lazy(() => import('@/pages/HomeownerDetailPage'));
const Compliance = React.lazy(() => import('@/pages/Compliance'));
const AccountingDashboard = React.lazy(() => import('@/pages/accounting/AccountingDashboard'));
const BankAccounts = React.lazy(() => import('@/pages/accounting/BankAccounts'));
const InvoiceQueue = React.lazy(() => {
  console.log('🚀 RouteConfig: Loading InvoiceQueue component...');
  return import('@/pages/accounting/InvoiceQueue');
});
const InvoiceDetails = React.lazy(() => import('@/pages/accounting/InvoiceDetails'));
const InvoiceCreate = React.lazy(() => import('@/pages/accounting/InvoiceCreate'));
const InvoiceEdit = React.lazy(() => import('@/pages/accounting/InvoiceEdit'));
const TransactionsAndPayments = React.lazy(() => import('@/pages/accounting/TransactionsAndPayments'));
const GLAccounts = React.lazy(() => import('@/pages/accounting/GLAccounts'));
const BudgetPlanning = React.lazy(() => import('@/pages/accounting/BudgetPlanning'));
const Messaging = React.lazy(() => import('@/pages/communications/Messaging'));
const Announcements = React.lazy(() => import('@/pages/communications/Announcements'));
const LeadsDashboard = React.lazy(() => import('@/pages/lead-management/LeadsDashboard'));
const Proposals = React.lazy(() => import('@/pages/lead-management/Proposals'));
const EmailCampaigns = React.lazy(() => import('@/pages/lead-management/EmailCampaigns'));
const Analytics = React.lazy(() => import('@/pages/lead-management/Analytics'));
const OnboardingWizard = React.lazy(() => import('@/pages/lead-management/OnboardingWizard'));
const OperationsDashboard = React.lazy(() => import('@/pages/operations/OperationsDashboard'));
const CalendarPage = React.lazy(() => import('@/pages/CalendarPage'));
const Vendors = React.lazy(() => import('@/pages/operations/Vendors'));
const LetterTemplates = React.lazy(() => import('@/pages/operations/LetterTemplates'));
const Workflows = React.lazy(() => import('@/pages/operations/Workflows'));
const PrintQueue = React.lazy(() => import('@/pages/operations/PrintQueue'));
const Documents = React.lazy(() => import('@/pages/records-reports/Documents'));
const Reports = React.lazy(() => import('@/pages/Reports'));
const ResaleManagement = React.lazy(() => import('@/pages/resale-management/ResaleManagement'));
const ResaleCertificate = React.lazy(() => import('@/pages/resale-management/ResaleCertificate'));
const DocsCenter = React.lazy(() => import('@/pages/resale-management/DocsCenter'));
const ResaleCalendar = React.lazy(() => import('@/pages/resale-management/ResaleCalendar'));
const OrderQueue = React.lazy(() => import('@/pages/resale-management/OrderQueue'));
const ResaleAnalytics = React.lazy(() => import('@/pages/resale-management/ResaleAnalytics'));
const SystemSettings = React.lazy(() => import('@/pages/system/SystemSettings'));
const EmailWorkflows = React.lazy(() => import('@/pages/system/EmailWorkflows'));
const DataManagement = React.lazy(() => import('@/pages/system/DataManagement'));
const FinancialReportMapping = React.lazy(() => import('@/pages/accounting/FinancialReportMapping'));
const WorkflowSchedule = React.lazy(() => import('@/pages/system/WorkflowSchedule'));
const Permissions = React.lazy(() => import('@/pages/system/Permissions'));
const ProjectTypes = React.lazy(() => import('@/pages/admin/ProjectTypes'));
const AssessmentTypes = React.lazy(() => import('@/pages/admin/AssessmentTypes'));
const UserProfile = React.lazy(() => import('@/pages/user/UserProfile'));
const MaintenanceRequests = React.lazy(() => import('@/pages/MaintenanceRequests'));
const HomeownerRequests = React.lazy(() => import('@/pages/HomeownerRequests'));
const BidRequests = React.lazy(() => import('@/pages/BidRequests'));
const CreateBidRequest = React.lazy(() => import('@/pages/community-management/CreateBidRequest'));
const BillingDashboard = React.lazy(() => import('@/pages/billing/BillingDashboard'));

// Suspense wrapper component
const SuspenseWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  console.log('🚀 RouteConfig: SuspenseWrapper rendering...');
  return (
    <React.Suspense 
      fallback={
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600">Loading...</p>
          </div>
        </div>
      }
    >
      {children}
    </React.Suspense>
  );
};

// Helper function to create protected route elements
const createProtectedRoute = (element: React.ReactElement, allowedRoles: string[] = ['admin', 'manager', 'resident', 'maintenance', 'accountant']) => {
  console.log('🚀 RouteConfig: Creating protected route with roles:', allowedRoles);
  return (
    <RequireAuth allowedRoles={allowedRoles}>
      <SuspenseWrapper>
        <ErrorBoundary>
          {element}
        </ErrorBoundary>
      </SuspenseWrapper>
    </RequireAuth>
  );
};

// Define all routes with proper role-based access control
export const protectedRoutes: RouteObject[] = [
  {
    path: '/dashboard',
    element: createProtectedRoute(<Dashboard />)
  },
  
  // Community Management Routes
  {
    path: '/associations',
    element: createProtectedRoute(<Associations />, ['admin', 'manager'])
  },
  {
    path: '/homeowners',
    element: createProtectedRoute(<Homeowners />, ['admin', 'manager'])
  },
  {
    path: '/homeowners/:id',
    element: createProtectedRoute(<HomeownerDetailPage />, ['admin', 'manager'])
  },
  {
    path: '/community-management/homeowner-requests',
    element: createProtectedRoute(<HomeownerRequests />, ['admin', 'manager'])
  },
  {
    path: '/community-management/bid-requests',
    element: createProtectedRoute(<BidRequests />, ['admin', 'manager'])
  },
  {
    path: '/community-management/bid-requests/new',
    element: createProtectedRoute(<CreateBidRequest />, ['admin', 'manager'])
  },
  {
    path: '/compliance',
    element: createProtectedRoute(<Compliance />, ['admin', 'manager'])
  },
  
  // Accounting Routes
  {
    path: '/accounting/dashboard',
    element: createProtectedRoute(<AccountingDashboard />, ['admin', 'manager', 'accountant'])
  },
  {
    path: '/accounting/bank-accounts',
    element: createProtectedRoute(<BankAccounts />, ['admin', 'manager', 'accountant'])
  },
  {
    path: '/accounting/invoice-queue',
    element: createProtectedRoute(<InvoiceQueue />, ['admin', 'manager', 'accountant'])
  },
  {
    path: '/accounting/invoice/:id',
    element: createProtectedRoute(<InvoiceDetails />, ['admin', 'manager', 'accountant'])
  },
  {
    path: '/accounting/invoice/create',
    element: createProtectedRoute(<InvoiceCreate />, ['admin', 'manager', 'accountant'])
  },
  {
    path: '/accounting/invoice/edit/:id',
    element: createProtectedRoute(<InvoiceEdit />, ['admin', 'manager', 'accountant'])
  },
  {
    path: '/accounting/transactions-payments',
    element: createProtectedRoute(<TransactionsAndPayments />, ['admin', 'manager', 'accountant'])
  },
  {
    path: '/accounting/gl-accounts',
    element: createProtectedRoute(<GLAccounts />, ['admin', 'manager', 'accountant'])
  },
  {
    path: '/accounting/budget-planning',
    element: createProtectedRoute(<BudgetPlanning />, ['admin', 'manager', 'accountant'])
  },
  {
    path: '/accounting/financial-report-mapping',
    element: createProtectedRoute(<FinancialReportMapping />, ['admin', 'manager', 'accountant'])
  },
  
  // Communications Routes
  {
    path: '/communications/messaging',
    element: createProtectedRoute(<Messaging />)
  },
  {
    path: '/communications/announcements',
    element: createProtectedRoute(<Announcements />)
  },
  
  // Lead Management Routes
  {
    path: '/lead-management/dashboard',
    element: createProtectedRoute(<LeadsDashboard />, ['admin', 'manager'])
  },
  {
    path: '/lead-management/proposals',
    element: createProtectedRoute(<Proposals />, ['admin', 'manager'])
  },
  {
    path: '/lead-management/email-campaigns',
    element: createProtectedRoute(<EmailCampaigns />, ['admin', 'manager'])
  },
  {
    path: '/lead-management/analytics',
    element: createProtectedRoute(<Analytics />, ['admin', 'manager'])
  },
  {
    path: '/lead-management/onboarding',
    element: createProtectedRoute(<OnboardingWizard />, ['admin', 'manager'])
  },
  
  // Operations Routes
  {
    path: '/operations/dashboard',
    element: createProtectedRoute(<OperationsDashboard />, ['admin', 'manager', 'maintenance'])
  },
  {
    path: '/operations/calendar',
    element: createProtectedRoute(<CalendarPage />, ['admin', 'manager', 'maintenance'])
  },
  {
    path: '/operations/vendors',
    element: createProtectedRoute(<Vendors />, ['admin', 'manager', 'maintenance'])
  },
  {
    path: '/operations/letter-templates',
    element: createProtectedRoute(<LetterTemplates />, ['admin', 'manager', 'maintenance'])
  },
  {
    path: '/operations/workflows',
    element: createProtectedRoute(<Workflows />, ['admin', 'manager', 'maintenance'])
  },
  {
    path: '/operations/print-queue',
    element: createProtectedRoute(<PrintQueue />, ['admin', 'manager', 'maintenance'])
  },
  
  // Records & Reports Routes
  {
    path: '/records-reports/documents',
    element: createProtectedRoute(<Documents />)
  },
  {
    path: '/records-reports/reports',
    element: createProtectedRoute(<Reports />)
  },
  
  // Resale Management Routes
  {
    path: '/resale-management',
    element: createProtectedRoute(<ResaleManagement />, ['admin', 'manager'])
  },
  {
    path: '/resale-management/certificate',
    element: createProtectedRoute(<ResaleCertificate />, ['admin', 'manager'])
  },
  {
    path: '/resale-management/docs-center',
    element: createProtectedRoute(<DocsCenter />, ['admin', 'manager'])
  },
  {
    path: '/resale-management/calendar',
    element: createProtectedRoute(<ResaleCalendar />, ['admin', 'manager'])
  },
  {
    path: '/resale-management/order-queue',
    element: createProtectedRoute(<OrderQueue />, ['admin', 'manager'])
  },
  {
    path: '/resale-management/analytics',
    element: createProtectedRoute(<ResaleAnalytics />, ['admin', 'manager'])
  },
  
  // System Routes
  {
    path: '/system/settings',
    element: createProtectedRoute(<SystemSettings />, ['admin'])
  },
  {
    path: '/system/email-workflows',
    element: createProtectedRoute(<EmailWorkflows />, ['admin'])
  },
  {
    path: '/system/data-management',
    element: createProtectedRoute(<DataManagement />, ['admin'])
  },
  {
    path: '/system/workflow-schedule',
    element: createProtectedRoute(<WorkflowSchedule />, ['admin'])
  },
  {
    path: '/system/permissions',
    element: createProtectedRoute(<Permissions />, ['admin'])
  },
  
  // Admin Routes
  {
    path: '/admin/project-types',
    element: createProtectedRoute(<ProjectTypes />, ['admin'])
  },
  {
    path: '/admin/assessment-types',
    element: createProtectedRoute(<AssessmentTypes />, ['admin'])
  },
  
  // User Routes
  {
    path: '/user/profile',
    element: createProtectedRoute(<UserProfile />)
  },
  
  // Other Routes
  {
    path: '/maintenance-requests',
    element: createProtectedRoute(<MaintenanceRequests />)
  },
  {
    path: '/billing',
    element: createProtectedRoute(<BillingDashboard />, ['admin', 'manager', 'accountant'])
  }
];

console.log('✅ RouteConfig: Route configuration loaded, total routes:', protectedRoutes.length);
