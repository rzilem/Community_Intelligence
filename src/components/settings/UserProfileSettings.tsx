
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const UserProfileSettings = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>User Profile Settings</CardTitle>
        <CardDescription>Manage your user profile information and preferences</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          This section will contain user profile management features.
        </p>
      </CardContent>
    </Card>
  );
};

export default UserProfileSettings;
