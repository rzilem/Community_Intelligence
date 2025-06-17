
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Mail, Plus } from 'lucide-react';

interface EmptyCampaignsStateProps {
  onCreateNew: () => void;
}

const EmptyCampaignsState: React.FC<EmptyCampaignsStateProps> = ({ onCreateNew }) => {
  return (
    <Card className="col-span-full">
      <CardContent className="flex flex-col items-center justify-center py-16">
        <Mail className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No email campaigns yet</h3>
        <p className="text-muted-foreground text-center mb-6 max-w-md">
          Create your first email campaign to start engaging with your leads and customers.
        </p>
        <Button onClick={onCreateNew}>
          <Plus className="mr-2 h-4 w-4" />
          Create Your First Campaign
        </Button>
      </CardContent>
    </Card>
  );
};

export default EmptyCampaignsState;
