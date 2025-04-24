
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { FileText, DollarSign, Calendar, Star, Truck, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';

const VendorDashboardContent = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Vendor Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Work Orders</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">2 pending approval</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding Invoices</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$3,850</div>
            <p className="text-xs text-muted-foreground">2 invoices pending</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Jobs</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground">Next job in 2 days</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Current Jobs</CardTitle>
            <CardDescription>Active work orders and maintenance tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 rounded-md border border-blue-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Building className="h-4 w-4 mr-2 text-blue-500" />
                    <span className="font-medium">Oakridge Association</span>
                  </div>
                  <span className="text-xs bg-green-100 text-green-800 rounded px-2 py-0.5">In Progress</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">Quarterly pool maintenance and chemical treatment</p>
                <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                  <span>Started: June 1, 2023</span>
                  <span>Due: June 8, 2023</span>
                </div>
              </div>
              
              <div className="p-3 bg-blue-50 rounded-md border border-blue-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Building className="h-4 w-4 mr-2 text-blue-500" />
                    <span className="font-medium">Sunset Villas HOA</span>
                  </div>
                  <span className="text-xs bg-yellow-100 text-yellow-800 rounded px-2 py-0.5">Scheduled</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">Common area landscape maintenance</p>
                <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                  <span>Start: June 10, 2023</span>
                  <span>Due: June 12, 2023</span>
                </div>
              </div>
              
              <div className="p-3 bg-blue-50 rounded-md border border-blue-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Building className="h-4 w-4 mr-2 text-blue-500" />
                    <span className="font-medium">Mountain View Estates</span>
                  </div>
                  <span className="text-xs bg-yellow-100 text-yellow-800 rounded px-2 py-0.5">Scheduled</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">Irrigation system repair</p>
                <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                  <span>Start: June 15, 2023</span>
                  <span>Due: June 16, 2023</span>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">View All Jobs</Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Company Performance</CardTitle>
            <CardDescription>Service metrics and ratings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b pb-4">
                <div>
                  <p className="text-sm text-muted-foreground">Average Rating</p>
                  <div className="flex items-center">
                    <Star className="h-5 w-5 text-yellow-400" />
                    <Star className="h-5 w-5 text-yellow-400" />
                    <Star className="h-5 w-5 text-yellow-400" />
                    <Star className="h-5 w-5 text-yellow-400" />
                    <Star className="h-5 w-5 text-yellow-400" />
                    <span className="ml-2 font-bold">4.9/5.0</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Completion Rate</p>
                  <p className="font-bold text-lg">98%</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Recent Client Feedback</h4>
                <div className="space-y-3">
                  <div className="p-3 bg-gray-50 rounded-md">
                    <div className="flex items-center">
                      <div className="flex flex-shrink-0">
                        <Star className="h-4 w-4 text-yellow-400" />
                        <Star className="h-4 w-4 text-yellow-400" />
                        <Star className="h-4 w-4 text-yellow-400" />
                        <Star className="h-4 w-4 text-yellow-400" />
                        <Star className="h-4 w-4 text-yellow-400" />
                      </div>
                      <span className="ml-2 text-sm font-medium">Oakridge Association</span>
                    </div>
                    <p className="text-sm mt-1">"Excellent service and very responsive. The team was professional and completed the work ahead of schedule."</p>
                  </div>
                  
                  <div className="p-3 bg-gray-50 rounded-md">
                    <div className="flex items-center">
                      <div className="flex flex-shrink-0">
                        <Star className="h-4 w-4 text-yellow-400" />
                        <Star className="h-4 w-4 text-yellow-400" />
                        <Star className="h-4 w-4 text-yellow-400" />
                        <Star className="h-4 w-4 text-yellow-400" />
                        <Star className="h-4 w-4 text-yellow-400" />
                      </div>
                      <span className="ml-2 text-sm font-medium">Pine Hills Community</span>
                    </div>
                    <p className="text-sm mt-1">"Great attention to detail. Will definitely use their services again for our community needs."</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">View Performance Report</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default VendorDashboardContent;
