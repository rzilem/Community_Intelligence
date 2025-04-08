
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { RequireAuth } from "./components/auth/RequireAuth";

// Pages
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Properties from "./pages/Properties";
import Residents from "./pages/Residents";
import CalendarPage from "./pages/CalendarPage";
import Accounting from "./pages/Accounting";
import Compliance from "./pages/Compliance";
import Reports from "./pages/Reports";
import Communications from "./pages/Communications";
import SettingsPage from "./pages/Settings";
import Help from "./pages/Help";
import NotFound from "./pages/NotFound";

// Community Management Pages
import CommunityManagement from "./pages/community-management/CommunityManagement";
import BidRequests from "./pages/community-management/BidRequests";

// Accounting Pages
import AccountingDashboard from "./pages/accounting/AccountingDashboard";
import BankAccounts from "./pages/accounting/BankAccounts";
import InvoiceQueue from "./pages/accounting/InvoiceQueue";
import Transactions from "./pages/accounting/Transactions";
import Payments from "./pages/accounting/Payments";
import JournalEntries from "./pages/accounting/JournalEntries";
import GLAccounts from "./pages/accounting/GLAccounts";
import FinancialReports from "./pages/accounting/FinancialReports";
import BudgetPlanning from "./pages/accounting/BudgetPlanning";

// Communications Pages
import Messaging from "./pages/communications/Messaging";
import Announcements from "./pages/communications/Announcements";

// Lead Management Pages
import LeadManagement from "./pages/lead-management/LeadManagement";
import LeadsDashboard from "./pages/lead-management/LeadsDashboard";
import Proposals from "./pages/lead-management/Proposals";
import EmailCampaigns from "./pages/lead-management/EmailCampaigns";
import Analytics from "./pages/lead-management/Analytics";
import OnboardingWizard from "./pages/lead-management/OnboardingWizard";

// Operations Pages
import Operations from "./pages/operations/Operations";
import OperationsDashboard from "./pages/operations/OperationsDashboard";
import OperationsCalendar from "./pages/operations/OperationsCalendar";
import Vendors from "./pages/operations/Vendors";
import LetterTemplates from "./pages/operations/LetterTemplates";
import Workflows from "./pages/operations/Workflows";
import PrintQueue from "./pages/operations/PrintQueue";

// Records & Reports Pages
import RecordsReports from "./pages/records-reports/RecordsReports";
import Records from "./pages/records-reports/Records";
import Documents from "./pages/records-reports/Documents";
import ReportsPage from "./pages/records-reports/ReportsPage";

// Resale Management Pages
import ResaleManagement from "./pages/resale-management/ResaleManagement";
import ResaleCertificate from "./pages/resale-management/ResaleCertificate";
import CondoQuestionnaire from "./pages/resale-management/CondoQuestionnaire";
import PropertyInspection from "./pages/resale-management/PropertyInspection";
import AccountStatements from "./pages/resale-management/AccountStatements";
import TRECForms from "./pages/resale-management/TRECForms";
import OrderQueue from "./pages/resale-management/OrderQueue";

// System Pages
import System from "./pages/system/System";
import Integrations from "./pages/system/Integrations";
import SystemSettings from "./pages/system/SystemSettings";
import EmailWorkflows from "./pages/system/EmailWorkflows";
import DataImportExport from "./pages/system/DataImportExport";
import WorkflowSchedule from "./pages/system/WorkflowSchedule";
import Associations from "./pages/system/Associations";
import Permissions from "./pages/system/Permissions";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            
            {/* Protected Routes */}
            <Route path="/dashboard" element={
              <RequireAuth>
                <Dashboard />
              </RequireAuth>
            } />
            
            {/* Original Pages */}
            <Route path="/properties" element={
              <RequireAuth>
                <Properties />
              </RequireAuth>
            } />
            <Route path="/residents" element={
              <RequireAuth>
                <Residents />
              </RequireAuth>
            } />
            <Route path="/calendar" element={
              <RequireAuth>
                <CalendarPage />
              </RequireAuth>
            } />
            <Route path="/accounting" element={
              <RequireAuth>
                <Accounting />
              </RequireAuth>
            } />
            <Route path="/compliance" element={
              <RequireAuth>
                <Compliance />
              </RequireAuth>
            } />
            <Route path="/reports" element={
              <RequireAuth>
                <Reports />
              </RequireAuth>
            } />
            <Route path="/communications" element={
              <RequireAuth>
                <Communications />
              </RequireAuth>
            } />
            <Route path="/settings" element={
              <RequireAuth>
                <SettingsPage />
              </RequireAuth>
            } />
            <Route path="/help" element={
              <RequireAuth>
                <Help />
              </RequireAuth>
            } />
            
            {/* Community Management Routes */}
            <Route path="/community-management" element={
              <RequireAuth>
                <CommunityManagement />
              </RequireAuth>
            } />
            <Route path="/bid-requests" element={
              <RequireAuth>
                <BidRequests />
              </RequireAuth>
            } />
            
            {/* Accounting Routes */}
            <Route path="/accounting/dashboard" element={
              <RequireAuth>
                <AccountingDashboard />
              </RequireAuth>
            } />
            <Route path="/accounting/bank-accounts" element={
              <RequireAuth>
                <BankAccounts />
              </RequireAuth>
            } />
            <Route path="/accounting/invoice-queue" element={
              <RequireAuth>
                <InvoiceQueue />
              </RequireAuth>
            } />
            <Route path="/accounting/transactions" element={
              <RequireAuth>
                <Transactions />
              </RequireAuth>
            } />
            <Route path="/accounting/payments" element={
              <RequireAuth>
                <Payments />
              </RequireAuth>
            } />
            <Route path="/accounting/journal-entries" element={
              <RequireAuth>
                <JournalEntries />
              </RequireAuth>
            } />
            <Route path="/accounting/gl-accounts" element={
              <RequireAuth>
                <GLAccounts />
              </RequireAuth>
            } />
            <Route path="/accounting/financial-reports" element={
              <RequireAuth>
                <FinancialReports />
              </RequireAuth>
            } />
            <Route path="/accounting/budget-planning" element={
              <RequireAuth>
                <BudgetPlanning />
              </RequireAuth>
            } />
            
            {/* Communications Routes */}
            <Route path="/communications/messaging" element={
              <RequireAuth>
                <Messaging />
              </RequireAuth>
            } />
            <Route path="/communications/announcements" element={
              <RequireAuth>
                <Announcements />
              </RequireAuth>
            } />
            
            {/* Lead Management Routes */}
            <Route path="/lead-management" element={
              <RequireAuth allowedRoles={['admin', 'manager']}>
                <LeadManagement />
              </RequireAuth>
            } />
            <Route path="/lead-management/dashboard" element={
              <RequireAuth allowedRoles={['admin', 'manager']}>
                <LeadsDashboard />
              </RequireAuth>
            } />
            <Route path="/lead-management/proposals" element={
              <RequireAuth allowedRoles={['admin', 'manager']}>
                <Proposals />
              </RequireAuth>
            } />
            <Route path="/lead-management/email-campaigns" element={
              <RequireAuth allowedRoles={['admin', 'manager']}>
                <EmailCampaigns />
              </RequireAuth>
            } />
            <Route path="/lead-management/analytics" element={
              <RequireAuth allowedRoles={['admin', 'manager']}>
                <Analytics />
              </RequireAuth>
            } />
            <Route path="/lead-management/onboarding" element={
              <RequireAuth allowedRoles={['admin', 'manager']}>
                <OnboardingWizard />
              </RequireAuth>
            } />
            
            {/* Operations Routes */}
            <Route path="/operations" element={
              <RequireAuth>
                <Operations />
              </RequireAuth>
            } />
            <Route path="/operations/dashboard" element={
              <RequireAuth>
                <OperationsDashboard />
              </RequireAuth>
            } />
            <Route path="/operations/calendar" element={
              <RequireAuth>
                <OperationsCalendar />
              </RequireAuth>
            } />
            <Route path="/operations/vendors" element={
              <RequireAuth>
                <Vendors />
              </RequireAuth>
            } />
            <Route path="/operations/letter-templates" element={
              <RequireAuth>
                <LetterTemplates />
              </RequireAuth>
            } />
            <Route path="/operations/workflows" element={
              <RequireAuth>
                <Workflows />
              </RequireAuth>
            } />
            <Route path="/operations/print-queue" element={
              <RequireAuth>
                <PrintQueue />
              </RequireAuth>
            } />
            
            {/* Records & Reports Routes */}
            <Route path="/records-reports" element={
              <RequireAuth>
                <RecordsReports />
              </RequireAuth>
            } />
            <Route path="/records-reports/records" element={
              <RequireAuth>
                <Records />
              </RequireAuth>
            } />
            <Route path="/records-reports/documents" element={
              <RequireAuth>
                <Documents />
              </RequireAuth>
            } />
            <Route path="/records-reports/reports" element={
              <RequireAuth>
                <ReportsPage />
              </RequireAuth>
            } />
            
            {/* Resale Management Routes */}
            <Route path="/resale-management" element={
              <RequireAuth>
                <ResaleManagement />
              </RequireAuth>
            } />
            <Route path="/resale-management/certificate" element={
              <RequireAuth>
                <ResaleCertificate />
              </RequireAuth>
            } />
            <Route path="/resale-management/questionnaire" element={
              <RequireAuth>
                <CondoQuestionnaire />
              </RequireAuth>
            } />
            <Route path="/resale-management/inspection" element={
              <RequireAuth>
                <PropertyInspection />
              </RequireAuth>
            } />
            <Route path="/resale-management/statements" element={
              <RequireAuth>
                <AccountStatements />
              </RequireAuth>
            } />
            <Route path="/resale-management/trec-forms" element={
              <RequireAuth>
                <TRECForms />
              </RequireAuth>
            } />
            <Route path="/resale-management/order-queue" element={
              <RequireAuth>
                <OrderQueue />
              </RequireAuth>
            } />
            
            {/* System Routes */}
            <Route path="/system" element={
              <RequireAuth allowedRoles={['admin']}>
                <System />
              </RequireAuth>
            } />
            <Route path="/system/integrations" element={
              <RequireAuth allowedRoles={['admin']}>
                <Integrations />
              </RequireAuth>
            } />
            <Route path="/system/settings" element={
              <RequireAuth allowedRoles={['admin']}>
                <SystemSettings />
              </RequireAuth>
            } />
            <Route path="/system/email-workflows" element={
              <RequireAuth allowedRoles={['admin']}>
                <EmailWorkflows />
              </RequireAuth>
            } />
            <Route path="/system/data" element={
              <RequireAuth allowedRoles={['admin']}>
                <DataImportExport />
              </RequireAuth>
            } />
            <Route path="/system/workflow-schedule" element={
              <RequireAuth allowedRoles={['admin']}>
                <WorkflowSchedule />
              </RequireAuth>
            } />
            <Route path="/system/associations" element={
              <RequireAuth allowedRoles={['admin']}>
                <Associations />
              </RequireAuth>
            } />
            <Route path="/system/permissions" element={
              <RequireAuth allowedRoles={['admin']}>
                <Permissions />
              </RequireAuth>
            } />
            
            {/* Catch-all Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
