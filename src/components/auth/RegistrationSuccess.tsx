
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';

const RegistrationSuccess: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-green-600">Registration Successful!</CardTitle>
        <CardDescription>
          Your account has been created
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-center">
        <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
        <p>Thank you for registering with Community Intelligence.</p>
        <p>Please check your email for a confirmation link.</p>
        <p className="text-sm text-muted-foreground">You will be redirected to the login page shortly.</p>
      </CardContent>
    </Card>
  );
};

export default RegistrationSuccess;
