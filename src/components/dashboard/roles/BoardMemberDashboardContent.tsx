
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Users, Calendar, FileCheck, Activity, Check, ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/button';

const BoardMemberDashboardContent = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Board Member Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <FileCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">3 ARC requests, 2 invoices</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Board Meetings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground">Next meeting in 6 days</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Community Status</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Good</div>
            <p className="text-xs text-muted-foreground">All critical metrics on track</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Board Items</CardTitle>
            <CardDescription>Tasks and agenda items requiring attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <ClipboardList className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <div className="flex justify-between">
                    <p className="font-medium">Budget Review Meeting</p>
                    <span className="text-xs bg-blue-100 text-blue-800 rounded px-2 py-0.5">June 10</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Quarterly financial review with accounting team</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <ClipboardList className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <div className="flex justify-between">
                    <p className="font-medium">Policy Amendment Vote</p>
                    <span className="text-xs bg-blue-100 text-blue-800 rounded px-2 py-0.5">June 15</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Vote on proposed pet policy amendments</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <ClipboardList className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <div className="flex justify-between">
                    <p className="font-medium">Vendor Selection</p>
                    <span className="text-xs bg-blue-100 text-blue-800 rounded px-2 py-0.5">June 20</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Review bids for clubhouse renovation project</p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">View Board Calendar</Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Action Items</CardTitle>
            <CardDescription>Your assigned board responsibilities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center border-b pb-2">
                <div className="flex-1">
                  <div className="flex items-center">
                    <Check className="h-4 w-4 mr-2 text-green-500" />
                    <p className="font-medium">Review Monthly Financial Report</p>
                  </div>
                  <p className="text-xs text-muted-foreground ml-6 mt-1">Financial statement analysis</p>
                </div>
                <Button variant="ghost" size="sm">Complete</Button>
              </div>
              
              <div className="flex items-center border-b pb-2">
                <div className="flex-1">
                  <div className="flex items-center">
                    <Check className="h-4 w-4 mr-2 text-green-500" />
                    <p className="font-medium">Approve Landscaping Proposal</p>
                  </div>
                  <p className="text-xs text-muted-foreground ml-6 mt-1">Summer landscaping contract renewal</p>
                </div>
                <Button variant="ghost" size="sm">Complete</Button>
              </div>
              
              <div className="flex items-center">
                <div className="flex-1">
                  <div className="flex items-center">
                    <Check className="h-4 w-4 mr-2 text-green-500" />
                    <p className="font-medium">Community Newsletter Draft</p>
                  </div>
                  <p className="text-xs text-muted-foreground ml-6 mt-1">Review quarterly newsletter draft</p>
                </div>
                <Button variant="ghost" size="sm">Complete</Button>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">View All Tasks</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default BoardMemberDashboardContent;
