
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { DollarSign, FileText, Calendar, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ResidentDashboardContent = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Resident Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Account Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$0.00</div>
            <p className="text-xs text-muted-foreground">Next assessment due June 1st</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Requests</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground">Pending approval</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Next event in 5 days</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Community Information</CardTitle>
            <CardDescription>Important updates for residents</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 bg-blue-50 rounded-md border border-blue-100">
              <h4 className="font-medium">Pool Opening</h4>
              <p className="text-sm text-muted-foreground mt-1">The community pool will open on May 28th. New key cards are available at the office.</p>
            </div>
            
            <div className="p-3 bg-blue-50 rounded-md border border-blue-100">
              <h4 className="font-medium">Landscaping Schedule</h4>
              <p className="text-sm text-muted-foreground mt-1">Lawn service is scheduled for Tuesdays. Please remove any personal items from common areas.</p>
            </div>
            
            <div className="p-3 bg-blue-50 rounded-md border border-blue-100">
              <h4 className="font-medium">Board Meeting Notice</h4>
              <p className="text-sm text-muted-foreground mt-1">The next board meeting will be held on June 15th at 7:00 PM in the clubhouse.</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">View All Announcements</Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>My Property</CardTitle>
            <CardDescription>Information about your home</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b pb-2">
                <div className="flex items-center">
                  <Home className="h-5 w-5 mr-2 text-blue-500" />
                  <div>
                    <p className="font-medium">123 Main Street</p>
                    <p className="text-sm text-muted-foreground">4 bed, 3 bath</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">View Details</Button>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Recent Activity</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex justify-between">
                    <span>Assessment Payment</span>
                    <span className="text-muted-foreground">Apr 1, 2023</span>
                  </li>
                  <li className="flex justify-between">
                    <span>ARC Application Approved</span>
                    <span className="text-muted-foreground">Feb 15, 2023</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Welcome Package Delivered</span>
                    <span className="text-muted-foreground">Jan 5, 2023</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">Submit a Request</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default ResidentDashboardContent;
