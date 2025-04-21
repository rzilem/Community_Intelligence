
import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/auth';
import { useSupabaseQuery } from '@/hooks/supabase';
import { Building, Users, FileText, BarChart2, Calendar, AlertTriangle } from 'lucide-react';
import DashboardWidget from '@/components/portal/DashboardWidget';
import PermissionGuard from '@/components/auth/PermissionGuard';

const BoardDashboard: React.FC = () => {
  const { user, currentAssociation } = useAuth();
  
  // In a real application, we would fetch user-specific widget preferences first,
  // then fall back to association defaults if none are set
  const { data: userWidgets = [], isLoading: loadingUserWidgets } = useSupabaseQuery(
    'user_portal_widgets',
    {
      select: '*',
      filter: [{ column: 'user_id', value: user?.id }],
      order: { column: 'position', ascending: true },
    },
    !!user?.id
  );

  return (
    <PermissionGuard menuId="board-portal">
      <AppLayout>
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-2">
            <Building className="h-6 w-6" />
            <h1 className="text-3xl font-bold tracking-tight">Board Member Dashboard</h1>
          </div>
          
          <p className="text-muted-foreground">
            Welcome to your board member portal. Access important association information and management tools.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <DashboardWidget title="Financial Summary" widgetType="financial-snapshot" isLoading={loadingUserWidgets}>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Operating Balance:</span>
                  <span className="font-semibold">$87,500.00</span>
                </div>
                <div className="flex justify-between">
                  <span>Reserve Balance:</span>
                  <span className="font-semibold">$142,300.00</span>
                </div>
                <div className="flex justify-between">
                  <span>YTD Income:</span>
                  <span className="font-semibold">$65,420.00</span>
                </div>
                <div className="flex justify-between">
                  <span>YTD Expenses:</span>
                  <span className="font-semibold">$43,780.00</span>
                </div>
                <button className="w-full bg-primary text-white py-2 px-4 rounded">View Financial Reports</button>
              </div>
            </DashboardWidget>
            
            <DashboardWidget title="Violations Summary" widgetType="violations" isLoading={loadingUserWidgets}>
              <div className="space-y-4">
                <p className="text-lg font-semibold">12 Active Violations</p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Landscaping:</span>
                    <span>7</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Architectural:</span>
                    <span>3</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Other:</span>
                    <span>2</span>
                  </div>
                </div>
                <button className="w-full bg-primary text-white py-2 px-4 rounded">Review Violations</button>
              </div>
            </DashboardWidget>
            
            <DashboardWidget title="Homeowner Requests" widgetType="requests" isLoading={loadingUserWidgets}>
              <div className="space-y-4">
                <p className="text-lg font-semibold">5 Pending Requests</p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>ARC Requests:</span>
                    <span>3</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Maintenance:</span>
                    <span>2</span>
                  </div>
                </div>
                <button className="w-full bg-primary text-white py-2 px-4 rounded">Review Requests</button>
              </div>
            </DashboardWidget>
            
            <DashboardWidget title="Upcoming Meetings" widgetType="calendar" isLoading={loadingUserWidgets}>
              <div className="space-y-4">
                <div className="border-l-4 border-blue-500 pl-3 py-1">
                  <p className="font-semibold">Board Meeting</p>
                  <p className="text-sm text-muted-foreground">May 15, 2023 - 7:00 PM</p>
                </div>
                <div className="border-l-4 border-green-500 pl-3 py-1">
                  <p className="font-semibold">Budget Committee</p>
                  <p className="text-sm text-muted-foreground">May 22, 2023 - 6:30 PM</p>
                </div>
                <div className="border-l-4 border-amber-500 pl-3 py-1">
                  <p className="font-semibold">Annual Meeting</p>
                  <p className="text-sm text-muted-foreground">June 10, 2023 - 1:00 PM</p>
                </div>
                <button className="w-full bg-primary text-white py-2 px-4 rounded">View Calendar</button>
              </div>
            </DashboardWidget>
            
            <DashboardWidget title="Documents" widgetType="documents" isLoading={loadingUserWidgets}>
              <div className="space-y-4">
                <p className="text-lg font-semibold">Board Documents</p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span>Annual Budget 2023</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span>Meeting Minutes - April 2023</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span>Reserve Study</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span>Financial Statements Q1</span>
                  </li>
                </ul>
                <button className="w-full bg-primary text-white py-2 px-4 rounded">View All Documents</button>
              </div>
            </DashboardWidget>
            
            <DashboardWidget title="Board Summary" widgetType="board-summary" isLoading={loadingUserWidgets}>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  <span>Total Board Members: 7</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  <span>Next Meeting: May 15, 2023</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  <span>Pending Approvals: 4</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  <span>Action Items: 3</span>
                </div>
                <div className="flex items-center gap-2">
                  <BarChart2 className="h-5 w-5" />
                  <span>Budget Variance: +2.3%</span>
                </div>
              </div>
            </DashboardWidget>
          </div>
        </div>
      </AppLayout>
    </PermissionGuard>
  );
};

export default BoardDashboard;
