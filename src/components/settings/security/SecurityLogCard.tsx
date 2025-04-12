
import React from 'react';
import { Shield } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const SecurityLogCard: React.FC = () => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <CardTitle>Security Log</CardTitle>
        </div>
        <CardDescription>
          View recent security events
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button variant="outline" className="w-full">View Security Log</Button>
      </CardContent>
    </Card>
  );
};

export default SecurityLogCard;
