
import React from 'react';
import { PortalPageLayout } from '@/components/portal/PortalPageLayout';
import { LayoutDashboard, CreditCard, AlertTriangle, CheckSquare, Users, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PortalNavigation } from '@/components/portal/PortalNavigation';

const MemberDashboardPage = () => {
  return (
    <PortalPageLayout 
      title="Board Member Dashboard" 
      icon={<LayoutDashboard className="h-6 w-6" />}
      description="Board-specific dashboard and insights"
      portalType="board"
    >
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <PortalNavigation portalType="board" />
        </div>
        
        <div className="lg:col-span-3 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Financial Health</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">Good</p>
                <p className="text-xs text-muted-foreground">Budget on track</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Open Violations</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">5</p>
                <p className="text-xs text-muted-foreground">3 new this week</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Your Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">3</p>
                <p className="text-xs text-muted-foreground">1 requires immediate attention</p>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Board Tasks</CardTitle>
                <CardDescription>Your assigned responsibilities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckSquare className="h-4 w-4 text-blue-500" />
                      <div>
                        <p className="font-medium">Review Monthly Financial Report</p>
                        <p className="text-sm text-muted-foreground">Due in 3 days</p>
                      </div>
                    </div>
                    <span className="text-amber-500 text-sm font-medium">Medium</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckSquare className="h-4 w-4 text-blue-500" />
                      <div>
                        <p className="font-medium">Approve Landscaping Proposal</p>
                        <p className="text-sm text-muted-foreground">Due in 5 days</p>
                      </div>
                    </div>
                    <span className="text-red-500 text-sm font-medium">High</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckSquare className="h-4 w-4 text-blue-500" />
                      <div>
                        <p className="font-medium">Vote on Pool Renovation</p>
                        <p className="text-sm text-muted-foreground">Due in 10 days</p>
                      </div>
                    </div>
                    <span className="text-green-500 text-sm font-medium">Low</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Events</CardTitle>
                <CardDescription>Community and board meetings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-500 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Monthly Board Meeting</p>
                      <p className="text-sm text-muted-foreground">Oct 15, 2023 at 7:00 PM</p>
                      <p className="text-sm">Community Center</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-500 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Budget Planning Session</p>
                      <p className="text-sm text-muted-foreground">Oct 22, 2023 at 6:00 PM</p>
                      <p className="text-sm">Virtual Meeting</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-500 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Fall Community Festival</p>
                      <p className="text-sm text-muted-foreground">Oct 28, 2023 at 12:00 PM</p>
                      <p className="text-sm">Community Park</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Recent Community Activity</CardTitle>
              <CardDescription>Latest updates and notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3 pb-3 border-b">
                  <Users className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <p className="font-medium">New Homeowner: Sarah Johnson</p>
                    <p className="text-sm text-muted-foreground">Moved in on Oct 5, 2023</p>
                    <p className="text-sm">123 Main Street</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 pb-3 border-b">
                  <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Violation Appeal Submitted</p>
                    <p className="text-sm text-muted-foreground">Oct 3, 2023</p>
                    <p className="text-sm">Michael Brown, 456 Elm Avenue - Fence Height Violation</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CreditCard className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Invoice Approved: Tree Trimming</p>
                    <p className="text-sm text-muted-foreground">Oct 1, 2023</p>
                    <p className="text-sm">$2,500 - Approved by John Smith</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PortalPageLayout>
  );
};

export default MemberDashboardPage;
