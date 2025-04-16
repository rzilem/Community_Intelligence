
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

const LeadHistoryTab: React.FC = () => {
  return (
    <Card>
      <CardContent className="p-6">
        <p className="text-muted-foreground text-center py-8">
          Lead history and tracking will be displayed here.
        </p>
      </CardContent>
    </Card>
  );
};

export default LeadHistoryTab;
