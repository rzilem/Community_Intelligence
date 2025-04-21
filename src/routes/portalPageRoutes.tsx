import React from 'react';
import { Route } from 'react-router-dom';
import RequireAuth from '@/components/auth/RequireAuth';

// Homeowner Portal Pages
import HomeownerPaymentsPage from '@/pages/portal/homeowner/PaymentsPage';
import HomeownerRequestsPage from '@/pages/portal/homeowner/RequestsPage';
import HomeownerCalendarPage from '@/pages/portal/homeowner/CalendarPage';
import HomeownerDirectoryPage from '@/pages/portal/homeowner/DirectoryPage';
import HomeownerDocumentsPage from '@/pages/portal/homeowner/DocumentsPage';

// Board Portal Pages
import BoardInvoicesPage from '@/pages/portal/board/InvoicesPage';
import BoardWorkOrdersPage from '@/pages/portal/board/WorkOrdersPage';
import BoardCollectionsPage from '@/pages/portal/board/CollectionsPage';
import BoardHomeownersPage from '@/pages/portal/board/HomeownersPage';
import BoardBankAccountsPage from '@/pages/portal/board/BankAccountsPage';
import BoardReportsPage from '@/pages/portal/board/ReportsPage';
import BoardViolationsPage from '@/pages/portal/board/ViolationsPage';
import BoardTasksPage from '@/pages/portal/board/BoardTasksPage';
import BoardEmailPage from '@/pages/portal/board/EmailPage';
import BoardTrainingPage from '@/pages/portal/board/TrainingPage';
import BoardVideoEducationPage from '@/pages/portal/board/VideoEducationPage';
import BoardAIAssistantPage from '@/pages/portal/board/AIAssistantPage';
import BoardReimbursementPage from '@/pages/portal/board/ReimbursementPage';
import BoardDashboardPage from '@/pages/portal/board/MemberDashboardPage';
import OperationsPage from '@/pages/portal/board/OperationsPage';
import CommunityPulsePage from '@/pages/portal/board/CommunityPulsePage';

// Homeowner Portal Routes
export const homeownerPortalRoutes = [
  <Route 
    key="homeowner-payments"
    path="/portal/homeowner/payments"
    element={
      <RequireAuth menuId="homeowner-portal">
        <HomeownerPaymentsPage />
      </RequireAuth>
    }
  />,
  <Route 
    key="homeowner-requests"
    path="/portal/homeowner/requests"
    element={
      <RequireAuth menuId="homeowner-portal">
        <HomeownerRequestsPage />
      </RequireAuth>
    }
  />,
  <Route 
    key="homeowner-calendar"
    path="/portal/homeowner/calendar"
    element={
      <RequireAuth menuId="homeowner-portal">
        <HomeownerCalendarPage />
      </RequireAuth>
    }
  />,
  <Route 
    key="homeowner-directory"
    path="/portal/homeowner/directory"
    element={
      <RequireAuth menuId="homeowner-portal">
        <HomeownerDirectoryPage />
      </RequireAuth>
    }
  />,
  <Route 
    key="homeowner-documents"
    path="/portal/homeowner/documents"
    element={
      <RequireAuth menuId="homeowner-portal">
        <HomeownerDocumentsPage />
      </RequireAuth>
    }
  />,
];

// Board Portal Routes
export const boardPortalRoutes = [
  <Route 
    key="board-community-pulse"
    path="/portal/board/community-pulse"
    element={
      <RequireAuth menuId="board-portal">
        <CommunityPulsePage />
      </RequireAuth>
    }
  />,
  <Route 
    key="board-operations"
    path="/portal/board/operations"
    element={
      <RequireAuth menuId="board-portal">
        <OperationsPage />
      </RequireAuth>
    }
  />,
  <Route 
    key="board-invoices"
    path="/portal/board/invoices"
    element={
      <RequireAuth menuId="board-portal">
        <BoardInvoicesPage />
      </RequireAuth>
    }
  />,
  <Route 
    key="board-work-orders"
    path="/portal/board/work-orders"
    element={
      <RequireAuth menuId="board-portal">
        <BoardWorkOrdersPage />
      </RequireAuth>
    }
  />,
  <Route 
    key="board-collections"
    path="/portal/board/collections"
    element={
      <RequireAuth menuId="board-portal">
        <BoardCollectionsPage />
      </RequireAuth>
    }
  />,
  <Route 
    key="board-homeowners"
    path="/portal/board/homeowners"
    element={
      <RequireAuth menuId="board-portal">
        <BoardHomeownersPage />
      </RequireAuth>
    }
  />,
  <Route 
    key="board-bank-accounts"
    path="/portal/board/bank-accounts"
    element={
      <RequireAuth menuId="board-portal">
        <BoardBankAccountsPage />
      </RequireAuth>
    }
  />,
  <Route 
    key="board-reports"
    path="/portal/board/reports"
    element={
      <RequireAuth menuId="board-portal">
        <BoardReportsPage />
      </RequireAuth>
    }
  />,
  <Route 
    key="board-violations"
    path="/portal/board/violations"
    element={
      <RequireAuth menuId="board-portal">
        <BoardViolationsPage />
      </RequireAuth>
    }
  />,
  <Route 
    key="board-tasks"
    path="/portal/board/tasks"
    element={
      <RequireAuth menuId="board-portal">
        <BoardTasksPage />
      </RequireAuth>
    }
  />,
  <Route 
    key="board-email"
    path="/portal/board/email"
    element={
      <RequireAuth menuId="board-portal">
        <BoardEmailPage />
      </RequireAuth>
    }
  />,
  <Route 
    key="board-training"
    path="/portal/board/training"
    element={
      <RequireAuth menuId="board-portal">
        <BoardTrainingPage />
      </RequireAuth>
    }
  />,
  <Route 
    key="board-video-education"
    path="/portal/board/video-education"
    element={
      <RequireAuth menuId="board-portal">
        <BoardVideoEducationPage />
      </RequireAuth>
    }
  />,
  <Route 
    key="board-ai-assistant"
    path="/portal/board/ai-assistant"
    element={
      <RequireAuth menuId="board-portal">
        <BoardAIAssistantPage />
      </RequireAuth>
    }
  />,
  <Route 
    key="board-reimbursement"
    path="/portal/board/reimbursement"
    element={
      <RequireAuth menuId="board-portal">
        <BoardReimbursementPage />
      </RequireAuth>
    }
  />,
  <Route 
    key="board-member-dashboard"
    path="/portal/board/dashboard"
    element={
      <RequireAuth menuId="board-portal">
        <BoardDashboardPage />
      </RequireAuth>
    }
  />,
];

// All portal routes
export const portalPageRoutes = [...homeownerPortalRoutes, ...boardPortalRoutes];
