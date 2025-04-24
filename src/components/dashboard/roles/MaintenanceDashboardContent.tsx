
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Wrench, ClipboardCheck, AlertCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

const MaintenanceDashboardContent = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Maintenance Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Work Orders</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">3 high priority</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
            <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">+2 from yesterday</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Inspections</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">Next in 3 days</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Priority Work Orders</CardTitle>
            <CardDescription>Tasks requiring immediate attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 bg-red-50 rounded-md border border-red-200">
                <div className="flex items-center justify-between">
                  <div className="font-medium flex items-center">
                    <AlertCircle className="h-4 w-4 mr-2 text-red-500" />
                    <span>Clubhouse HVAC Failure</span>
                  </div>
                  <span className="text-xs font-bold text-red-500">High</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">AC unit not cooling, temperature at 85°F</p>
              </div>
              
              <div className="p-3 bg-amber-50 rounded-md border border-amber-200">
                <div className="flex items-center justify-between">
                  <div className="font-medium flex items-center">
                    <AlertCircle className="h-4 w-4 mr-2 text-amber-500" />
                    <span>Pool Pump Noise</span>
                  </div>
                  <span className="text-xs font-bold text-amber-500">Medium</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">Unusual noise coming from main pool pump</p>
              </div>
              
              <div className="p-3 bg-red-50 rounded-md border border-red-200">
                <div className="flex items-center justify-between">
                  <div className="font-medium flex items-center">
                    <AlertCircle className="h-4 w-4 mr-2 text-red-500" />
                    <span>Playground Safety Issue</span>
                  </div>
                  <span className="text-xs font-bold text-red-500">High</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">Broken swing chain needs immediate replacement</p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">View All Work Orders</Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Maintenance Schedule</CardTitle>
            <CardDescription>Upcoming preventive maintenance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <div>
                  <p className="font-medium">Pool Filter Maintenance</p>
                  <p className="text-sm text-muted-foreground">Thursday, June 8</p>
                </div>
                <Button variant="outline" size="sm">Details</Button>
              </div>
              
              <div className="flex items-center justify-between border-b pb-2">
                <div>
                  <p className="font-medium">Quarterly HVAC Inspection</p>
                  <p className="text-sm text-muted-foreground">Monday, June 12</p>
                </div>
                <Button variant="outline" size="sm">Details</Button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Common Area Lighting Check</p>
                  <p className="text-sm text-muted-foreground">Wednesday, June 14</p>
                </div>
                <Button variant="outline" size="sm">Details</Button>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">View Full Schedule</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default MaintenanceDashboardContent;
