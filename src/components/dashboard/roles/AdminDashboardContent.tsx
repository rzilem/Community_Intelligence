
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Users, Building, Settings, Shield } from 'lucide-react';

const AdminDashboardContent = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Admin Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">142</div>
            <p className="text-xs text-muted-foreground">+6 in the last week</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Associations</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">+2 in the last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Good</div>
            <p className="text-xs text-muted-foreground">All systems operational</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Administration Tasks</CardTitle>
            <CardDescription>Key areas that need attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <div className="flex items-center">
                  <Settings className="h-5 w-5 mr-2 text-blue-500" />
                  <span>System Configuration</span>
                </div>
                <span className="text-green-500 text-sm">Up to date</span>
              </div>
              
              <div className="flex items-center justify-between border-b pb-2">
                <div className="flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-blue-500" />
                  <span>Security Settings</span>
                </div>
                <span className="text-amber-500 text-sm">Review needed</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Users className="h-5 w-5 mr-2 text-blue-500" />
                  <span>User Permissions</span>
                </div>
                <span className="text-green-500 text-sm">Up to date</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Recent System Events</CardTitle>
            <CardDescription>System activity in the past 24 hours</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>User login success</span>
                <span className="text-muted-foreground">5 mins ago</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span>Database backup completed</span>
                <span className="text-muted-foreground">1 hour ago</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span>System update applied</span>
                <span className="text-muted-foreground">3 hours ago</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span>Failed login attempt</span>
                <span className="text-muted-foreground">5 hours ago</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboardContent;
