
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Index from "./pages/Index";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/dashboard" element={<Dashboard />} />
            
            {/* Original Pages */}
            <Route path="/properties" element={<Properties />} />
            <Route path="/residents" element={<Residents />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/accounting" element={<Accounting />} />
            <Route path="/compliance" element={<Compliance />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/communications" element={<Communications />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/help" element={<Help />} />
            
            {/* Community Management Routes */}
            <Route path="/community-management" element={<CommunityManagement />} />
            <Route path="/bid-requests" element={<BidRequests />} />
            
            {/* Accounting Routes */}
            <Route path="/accounting/dashboard" element={<AccountingDashboard />} />
            <Route path="/accounting/bank-accounts" element={<BankAccounts />} />
            <Route path="/accounting/invoice-queue" element={<InvoiceQueue />} />
            <Route path="/accounting/transactions" element={<Transactions />} />
            <Route path="/accounting/payments" element={<Payments />} />
            <Route path="/accounting/journal-entries" element={<JournalEntries />} />
            <Route path="/accounting/gl-accounts" element={<GLAccounts />} />
            <Route path="/accounting/financial-reports" element={<FinancialReports />} />
            <Route path="/accounting/budget-planning" element={<BudgetPlanning />} />
            
            {/* Communications Routes */}
            <Route path="/communications/messaging" element={<Messaging />} />
            <Route path="/communications/announcements" element={<Announcements />} />
            
            {/* Lead Management Routes */}
            <Route path="/lead-management" element={<LeadManagement />} />
            <Route path="/lead-management/dashboard" element={<LeadsDashboard />} />
            <Route path="/lead-management/proposals" element={<Proposals />} />
            <Route path="/lead-management/email-campaigns" element={<EmailCampaigns />} />
            <Route path="/lead-management/analytics" element={<Analytics />} />
            <Route path="/lead-management/onboarding" element={<OnboardingWizard />} />
            
            {/* Operations Routes */}
            <Route path="/operations" element={<Operations />} />
            <Route path="/operations/dashboard" element={<OperationsDashboard />} />
            <Route path="/operations/calendar" element={<OperationsCalendar />} />
            <Route path="/operations/vendors" element={<Vendors />} />
            <Route path="/operations/letter-templates" element={<LetterTemplates />} />
            <Route path="/operations/workflows" element={<Workflows />} />
            <Route path="/operations/print-queue" element={<PrintQueue />} />
            
            {/* Records & Reports Routes */}
            <Route path="/records-reports" element={<RecordsReports />} />
            <Route path="/records-reports/records" element={<Records />} />
            <Route path="/records-reports/documents" element={<Documents />} />
            <Route path="/records-reports/reports" element={<ReportsPage />} />
            
            {/* Resale Management Routes */}
            <Route path="/resale-management" element={<ResaleManagement />} />
            <Route path="/resale-management/certificate" element={<ResaleCertificate />} />
            <Route path="/resale-management/questionnaire" element={<CondoQuestionnaire />} />
            <Route path="/resale-management/inspection" element={<PropertyInspection />} />
            <Route path="/resale-management/statements" element={<AccountStatements />} />
            <Route path="/resale-management/trec-forms" element={<TRECForms />} />
            <Route path="/resale-management/order-queue" element={<OrderQueue />} />
            
            {/* System Routes */}
            <Route path="/system" element={<System />} />
            <Route path="/system/integrations" element={<Integrations />} />
            <Route path="/system/settings" element={<SystemSettings />} />
            <Route path="/system/email-workflows" element={<EmailWorkflows />} />
            <Route path="/system/data" element={<DataImportExport />} />
            <Route path="/system/workflow-schedule" element={<WorkflowSchedule />} />
            <Route path="/system/associations" element={<Associations />} />
            <Route path="/system/permissions" element={<Permissions />} />
            
            {/* Catch-all Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
