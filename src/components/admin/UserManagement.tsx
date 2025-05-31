
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Shield } from 'lucide-react';

const UserManagement: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Users className="h-6 w-6" />
        <h1 className="text-2xl font-bold">User Management</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Active Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">24</div>
            <p className="text-sm text-muted-foreground">Across all associations</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Roles Configured
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">6</div>
            <p className="text-sm text-muted-foreground">Admin, Manager, Resident, etc.</p>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 border rounded">
              <div>
                <p className="font-medium">New user registered</p>
                <p className="text-sm text-muted-foreground">john.doe@example.com</p>
              </div>
              <span className="text-sm text-muted-foreground">2 hours ago</span>
            </div>
            <div className="flex justify-between items-center p-3 border rounded">
              <div>
                <p className="font-medium">Role updated</p>
                <p className="text-sm text-muted-foreground">Jane Smith promoted to Manager</p>
              </div>
              <span className="text-sm text-muted-foreground">1 day ago</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement;
