
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export const FinancialsTab = () => {
  return (
    <ScrollArea className="h-full w-full">
      <div className="space-y-6 p-6">
        <Card>
          <CardHeader>
            <h3 className="text-2xl font-semibold">Financial Overview</h3>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Financial reporting tools are currently being implemented. Check back soon for a complete view of your association's finances.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
};
