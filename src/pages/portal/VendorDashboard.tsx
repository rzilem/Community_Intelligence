
import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/auth';
import { useSupabaseQuery } from '@/hooks/supabase';
import { Truck, Receipt, DollarSign, Star, FileText } from 'lucide-react';
import DashboardWidget from '@/components/portal/DashboardWidget';
import PermissionGuard from '@/components/auth/PermissionGuard';

const VendorDashboard: React.FC = () => {
  const { user } = useAuth();
  
  const { data: vendorProfile, isLoading: loadingProfile } = useSupabaseQuery(
    'vendor_profiles',
    {
      select: '*',
      filter: [{ column: 'user_id', value: user?.id }],
      single: true
    },
    !!user?.id
  );

  return (
    <PermissionGuard menuId="vendor-portal">
      <AppLayout>
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-2">
            <Truck className="h-6 w-6" />
            <h1 className="text-3xl font-bold tracking-tight">Vendor Dashboard</h1>
          </div>
          
          <p className="text-muted-foreground">
            Welcome to your vendor portal. Manage your company profile, invoices, and services.
          </p>
          
          {loadingProfile ? (
            <div className="flex justify-center py-12">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <DashboardWidget title="Company Profile" widgetType="vendor-stats">
                <div className="space-y-4">
                  <p className="text-lg font-semibold">{vendorProfile?.company_name || 'Your Company'}</p>
                  <div className="flex items-center gap-2">
                    <span>Status:</span>
                    <span className={`px-2 py-1 rounded text-xs ${vendorProfile?.is_preferred ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                      {vendorProfile?.is_preferred ? 'Preferred Vendor' : 'Standard Vendor'}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{vendorProfile?.company_description || 'No company description available'}</p>
                  <button className="w-full bg-primary text-white py-2 px-4 rounded">Update Profile</button>
                </div>
              </DashboardWidget>
              
              <DashboardWidget title="Invoices" widgetType="invoices">
                <div className="space-y-4">
                  <p className="text-lg font-semibold">Your Invoices</p>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Total Invoices:</span>
                      <span>5</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pending Approval:</span>
                      <span>2</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Paid:</span>
                      <span>3</span>
                    </div>
                  </div>
                  <button className="w-full bg-primary text-white py-2 px-4 rounded">View All Invoices</button>
                </div>
              </DashboardWidget>
              
              <DashboardWidget title="Payment History" widgetType="payments">
                <div className="space-y-4">
                  <p className="text-lg font-semibold">Recent Payments</p>
                  <div className="border-l-4 border-green-500 pl-3 py-1">
                    <div className="flex justify-between">
                      <span>INV-2023-042</span>
                      <span className="font-semibold">$1,250.00</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Paid on April 15, 2023</p>
                  </div>
                  <div className="border-l-4 border-green-500 pl-3 py-1">
                    <div className="flex justify-between">
                      <span>INV-2023-036</span>
                      <span className="font-semibold">$875.00</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Paid on March 28, 2023</p>
                  </div>
                  <button className="w-full bg-primary text-white py-2 px-4 rounded">View Payment History</button>
                </div>
              </DashboardWidget>
              
              <DashboardWidget title="Bid Opportunities" widgetType="bid-opportunities">
                <div className="space-y-4">
                  <p className="text-lg font-semibold">Open Bid Requests</p>
                  <div className="border-l-4 border-blue-500 pl-3 py-1">
                    <p className="font-semibold">Landscaping Services</p>
                    <p className="text-sm text-muted-foreground">Due: May 30, 2023</p>
                  </div>
                  <div className="border-l-4 border-blue-500 pl-3 py-1">
                    <p className="font-semibold">Pool Maintenance</p>
                    <p className="text-sm text-muted-foreground">Due: June 15, 2023</p>
                  </div>
                  <button className="w-full bg-primary text-white py-2 px-4 rounded">View All Opportunities</button>
                </div>
              </DashboardWidget>
              
              <DashboardWidget title="Preferred Status" widgetType="preferred-status">
                <div className="space-y-4">
                  {vendorProfile?.is_preferred ? (
                    <>
                      <div className="flex items-center gap-2">
                        <Star className="h-5 w-5 text-yellow-500" />
                        <p className="text-lg font-semibold">Preferred Vendor</p>
                      </div>
                      <p className="text-sm">Your company is listed as a preferred vendor which gives you priority access to bid opportunities.</p>
                      <button className="w-full bg-primary text-white py-2 px-4 rounded">Manage Preferred Status</button>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <Star className="h-5 w-5 text-gray-300" />
                        <p className="text-lg font-semibold">Standard Vendor</p>
                      </div>
                      <p className="text-sm">Upgrade to preferred vendor status to receive priority access to bid opportunities and enhanced visibility.</p>
                      <button className="w-full bg-primary text-white py-2 px-4 rounded">Upgrade to Preferred</button>
                    </>
                  )}
                </div>
              </DashboardWidget>
              
              <DashboardWidget title="Documents" widgetType="documents">
                <div className="space-y-4">
                  <p className="text-lg font-semibold">Vendor Documents</p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span>Vendor Agreement</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span>W-9 Form</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span>Insurance Certificate</span>
                    </li>
                  </ul>
                  <button className="w-full bg-primary text-white py-2 px-4 rounded">Manage Documents</button>
                </div>
              </DashboardWidget>
            </div>
          )}
        </div>
      </AppLayout>
    </PermissionGuard>
  );
};

export default VendorDashboard;
