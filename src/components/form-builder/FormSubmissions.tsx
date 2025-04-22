
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const FormSubmissions = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Form Submissions</CardTitle>
        <CardDescription>View and manage form submissions</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">No submissions yet.</p>
      </CardContent>
    </Card>
  );
};
