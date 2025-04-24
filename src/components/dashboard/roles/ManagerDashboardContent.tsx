
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { AlertTriangle, Calendar, FileText, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ManagerDashboardContent = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Manager Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Requests</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">4 require immediate attention</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Violations</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7</div>
            <p className="text-xs text-muted-foreground">2 new this week</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Meetings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Next meeting in 2 days</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Urgent Tasks</CardTitle>
            <CardDescription>Items requiring immediate attention</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-amber-50 p-3 rounded-md border border-amber-200">
              <div className="flex items-center justify-between">
                <div className="font-medium">Review ARC Application #1082</div>
                <span className="text-amber-600 text-xs font-bold">Due Today</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">Fence installation request waiting for approval</p>
            </div>
            
            <div className="bg-red-50 p-3 rounded-md border border-red-200">
              <div className="flex items-center justify-between">
                <div className="font-medium">Address Homeowner Complaint</div>
                <span className="text-red-600 text-xs font-bold">Overdue</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">Noise complaint from 123 Oak Street</p>
            </div>
            
            <div className="bg-amber-50 p-3 rounded-md border border-amber-200">
              <div className="flex items-center justify-between">
                <div className="font-medium">Finalize Vendor Contract</div>
                <span className="text-amber-600 text-xs font-bold">Due Tomorrow</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">Landscaping service agreement renewal</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">View All Tasks</Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Recent Communications</CardTitle>
            <CardDescription>Latest messages and announcements</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start space-x-3 border-b pb-3">
              <MessageSquare className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <div className="flex justify-between">
                  <p className="font-medium">Monthly Newsletter Sent</p>
                  <span className="text-xs text-muted-foreground">2 hours ago</span>
                </div>
                <p className="text-sm text-muted-foreground">Sent to 156 recipients, 78% open rate</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 border-b pb-3">
              <MessageSquare className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <div className="flex justify-between">
                  <p className="font-medium">New Message from John Smith</p>
                  <span className="text-xs text-muted-foreground">Yesterday</span>
                </div>
                <p className="text-sm text-muted-foreground">Question about upcoming pool maintenance</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <MessageSquare className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <div className="flex justify-between">
                  <p className="font-medium">Community Event Announcement</p>
                  <span className="text-xs text-muted-foreground">2 days ago</span>
                </div>
                <p className="text-sm text-muted-foreground">Summer BBQ scheduled for June 15th</p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">View All Messages</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default ManagerDashboardContent;
