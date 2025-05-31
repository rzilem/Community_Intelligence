import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Auth } from '@/pages/Auth';
import { Index } from '@/pages/Index';
import AppLayout from '@/components/layout/AppLayout';
import { AuthProvider } from '@/contexts/auth';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "@/components/ui/toaster"
import ErrorBoundary from '@/components/ErrorBoundary';
import { Dashboard } from '@/pages/Dashboard';
import { Associations } from '@/pages/Associations';
import { Homeowners } from '@/pages/Homeowners';
import { Compliance } from '@/pages/Compliance';
import { AccountingDashboard } from '@/pages/accounting/AccountingDashboard';
import { BankAccounts } from '@/pages/accounting/BankAccounts';
import { InvoiceQueue } from '@/pages/accounting/InvoiceQueue';
import { TransactionsPayments } from '@/pages/accounting/TransactionsPayments';
import { GLAccounts } from '@/pages/accounting/GLAccounts';
import { BudgetPlanning } from '@/pages/accounting/BudgetPlanning';
import { Messaging } from '@/pages/communications/Messaging';
import { Announcements } from '@/pages/communications/Announcements';
import { LeadsDashboard } from '@/pages/lead-management/LeadsDashboard';
import { Proposals } from '@/pages/lead-management/Proposals';
import { EmailCampaigns } from '@/pages/lead-management/EmailCampaigns';
import { Analytics } from '@/pages/lead-management/Analytics';
import { OnboardingWizard } from '@/pages/lead-management/OnboardingWizard';
import { OperationsDashboard } from '@/pages/operations/OperationsDashboard';
import { CalendarPage } from '@/pages/operations/CalendarPage';
import { Vendors } from '@/pages/operations/Vendors';
import { LetterTemplates } from '@/pages/operations/LetterTemplates';
import { Workflows } from '@/pages/operations/Workflows';
import { PrintQueue } from '@/pages/operations/PrintQueue';
import { Documents } from '@/pages/records-reports/Documents';
import { Reports } from '@/pages/records-reports/Reports';
import { ResaleCertificate } from '@/pages/resale-management/ResaleCertificate';
import { DocsCenter } from '@/pages/resale-management/DocsCenter';
import { ResaleCalendar } from '@/pages/resale-management/ResaleCalendar';
import { OrderQueue } from '@/pages/resale-management/OrderQueue';
import { ResaleAnalytics } from '@/pages/resale-management/ResaleAnalytics';
import { SystemSettings } from '@/pages/system/SystemSettings';
import { EmailWorkflows } from '@/pages/system/EmailWorkflows';
import { DataManagement } from '@/pages/system/DataManagement';
import { FinancialReportMapping } from '@/pages/system/FinancialReportMapping';
import { WorkflowSchedule } from '@/pages/system/WorkflowSchedule';
import { Permissions } from '@/pages/system/Permissions';
import { ProjectTypes } from '@/pages/admin/ProjectTypes';
import { UserProfile } from '@/pages/user/UserProfile';
import { MaintenanceRequests } from '@/pages/MaintenanceRequests';
import { HomeownerRequests } from '@/pages/HomeownerRequests';
import { ResaleManagement } from '@/pages/resale-management/ResaleManagement';
import { BidRequests } from '@/pages/BidRequests';
import { InvoiceDetails } from '@/pages/accounting/InvoiceDetails';
import { InvoiceCreate } from '@/pages/accounting/InvoiceCreate';
import { InvoiceEdit } from '@/pages/accounting/InvoiceEdit';
import { AssessmentTypes } from '@/pages/admin/AssessmentTypes';
import { InvitationPage } from '@/pages/InvitationPage';
import { PaymentSuccessPage } from '@/pages/PaymentSuccessPage';
import { BillingDashboard } from '@/pages/billing/BillingDashboard';

const queryClient = new QueryClient();

function App() {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <ErrorBoundary>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/invitation/:token" element={<InvitationPage />} />
              <Route path="/payment-success" element={<PaymentSuccessPage />} />
              <Route path="/" element={<Index />} />
              <Route
                path="/*"
                element={
                  <AuthProvider>
                    <NotificationProvider>
                      <AppLayout>
                        <Routes>
                          <Route path="/dashboard" element={<Dashboard />} />
                          <Route path="/associations" element={<Associations />} />
                          <Route path="/homeowners" element={<Homeowners />} />
                          <Route path="/compliance" element={<Compliance />} />
                          <Route path="/accounting/dashboard" element={<AccountingDashboard />} />
                          <Route path="/accounting/bank-accounts" element={<BankAccounts />} />
                          <Route path="/accounting/invoice-queue" element={<InvoiceQueue />} />
                          <Route path="/accounting/invoice/:id" element={<InvoiceDetails />} />
                          <Route path="/accounting/invoice/create" element={<InvoiceCreate />} />
                          <Route path="/accounting/invoice/edit/:id" element={<InvoiceEdit />} />
                          <Route path="/accounting/transactions-payments" element={<TransactionsPayments />} />
                          <Route path="/accounting/gl-accounts" element={<GLAccounts />} />
                          <Route path="/accounting/budget-planning" element={<BudgetPlanning />} />
                          <Route path="/communications/messaging" element={<Messaging />} />
                          <Route path="/communications/announcements" element={<Announcements />} />
                          <Route path="/lead-management/dashboard" element={<LeadsDashboard />} />
                          <Route path="/lead-management/proposals" element={<Proposals />} />
                          <Route path="/lead-management/email-campaigns" element={<EmailCampaigns />} />
                          <Route path="/lead-management/analytics" element={<Analytics />} />
                          <Route path="/lead-management/onboarding" element={<OnboardingWizard />} />
                          <Route path="/operations/dashboard" element={<OperationsDashboard />} />
                          <Route path="/operations/calendar" element={<CalendarPage />} />
                          <Route path="/operations/vendors" element={<Vendors />} />
                          <Route path="/operations/letter-templates" element={<LetterTemplates />} />
                          <Route path="/operations/workflows" element={<Workflows />} />
                          <Route path="/operations/print-queue" element={<PrintQueue />} />
                          <Route path="/records-reports/documents" element={<Documents />} />
                          <Route path="/records-reports/reports" element={<Reports />} />
                          <Route path="/resale-management" element={<ResaleManagement />} />
                          <Route path="/resale-management/certificate" element={<ResaleCertificate />} />
                          <Route path="/resale-management/docs-center" element={<DocsCenter />} />
                          <Route path="/resale-management/calendar" element={<ResaleCalendar />} />
                          <Route path="/resale-management/order-queue" element={<OrderQueue />} />
                          <Route path="/resale-management/analytics" element={<ResaleAnalytics />} />
                          <Route path="/system/settings" element={<SystemSettings />} />
                          <Route path="/system/email-workflows" element={<EmailWorkflows />} />
                          <Route path="/system/data-management" element={<DataManagement />} />
                          <Route path="/system/financial-report-mapping" element={<FinancialReportMapping />} />
                          <Route path="/system/workflow-schedule" element={<WorkflowSchedule />} />
                          <Route path="/system/permissions" element={<Permissions />} />
                          <Route path="/admin/project-types" element={<ProjectTypes />} />
                          <Route path="/admin/assessment-types" element={<AssessmentTypes />} />
                          <Route path="/user/profile" element={<UserProfile />} />
                          <Route path="/maintenance-requests" element={<MaintenanceRequests />} />
                          <Route path="/community-management/homeowner-requests" element={<HomeownerRequests />} />
                          <Route path="/community-management/bid-requests" element={<BidRequests />} />
                          <Route path="/billing" element={<BillingDashboard />} />
                        </Routes>
                      </AppLayout>
                    </NotificationProvider>
                  </AuthProvider>
                }
              />
            </Routes>
          </ErrorBoundary>
        </TooltipProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}

export default App;
