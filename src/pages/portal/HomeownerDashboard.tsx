
import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/auth';
import { useSupabaseQuery } from '@/hooks/supabase';
import { Home } from 'lucide-react';
import DashboardWidget from '@/components/portal/DashboardWidget';
import PermissionGuard from '@/components/auth/PermissionGuard';

const HomeownerDashboard: React.FC = () => {
  const { user, currentAssociation } = useAuth();
  
  const { data: associationWidgets = [], isLoading: loadingWidgets } = useSupabaseQuery(
    'association_portal_widgets',
    {
      select: '*',
      filter: [{ column: 'association_id', value: currentAssociation?.id }],
      order: { column: 'position', ascending: true },
    },
    !!currentAssociation?.id
  );

  // Filter to only show enabled widgets
  const enabledWidgets = associationWidgets.filter((widget: any) => widget.is_enabled);

  return (
    <PermissionGuard menuId="homeowner-portal">
      <AppLayout>
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-2">
            <Home className="h-6 w-6" />
            <h1 className="text-3xl font-bold tracking-tight">Homeowner Dashboard</h1>
          </div>
          
          <p className="text-muted-foreground">
            Welcome to your homeowner portal. View important information about your property and community.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <DashboardWidget title="My Payments" widgetType="payments" isLoading={loadingWidgets}>
              <div className="space-y-4">
                <p className="text-lg font-semibold">Current Balance: $0.00</p>
                <p className="text-sm text-muted-foreground">Last payment: None</p>
                <button className="bg-primary text-white py-2 px-4 rounded">Make a Payment</button>
              </div>
            </DashboardWidget>
            
            <DashboardWidget title="My Requests" widgetType="requests" isLoading={loadingWidgets}>
              <div className="space-y-4">
                <p className="text-lg font-semibold">0 Active Requests</p>
                <p className="text-sm text-muted-foreground">Submit a new request for your property</p>
                <button className="bg-primary text-white py-2 px-4 rounded">New Request</button>
              </div>
            </DashboardWidget>
            
            <DashboardWidget title="Documents" widgetType="documents" isLoading={loadingWidgets}>
              <div className="space-y-4">
                <p className="text-lg font-semibold">Association Documents</p>
                <ul className="list-disc list-inside">
                  <li>Community Guidelines</li>
                  <li>HOA Bylaws</li>
                  <li>Architectural Guidelines</li>
                </ul>
              </div>
            </DashboardWidget>
            
            <DashboardWidget title="Announcements" widgetType="announcements" isLoading={loadingWidgets}>
              <div className="space-y-4">
                <p className="text-lg font-semibold">Recent Announcements</p>
                <p className="text-sm text-muted-foreground">No recent announcements</p>
              </div>
            </DashboardWidget>
            
            <DashboardWidget title="Upcoming Events" widgetType="calendar" isLoading={loadingWidgets}>
              <div className="space-y-4">
                <p className="text-lg font-semibold">Community Calendar</p>
                <p className="text-sm text-muted-foreground">No upcoming events</p>
              </div>
            </DashboardWidget>
            
            <DashboardWidget title="Violations" widgetType="violations" isLoading={loadingWidgets}>
              <div className="space-y-4">
                <p className="text-lg font-semibold">0 Active Violations</p>
                <p className="text-sm text-muted-foreground">You have no current violations</p>
              </div>
            </DashboardWidget>
          </div>
        </div>
      </AppLayout>
    </PermissionGuard>
  );
};

export default HomeownerDashboard;
