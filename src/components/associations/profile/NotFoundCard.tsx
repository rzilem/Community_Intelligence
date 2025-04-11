
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

interface NotFoundCardProps {
  handleBack: () => void;
}

export const NotFoundCard: React.FC<NotFoundCardProps> = ({ handleBack }) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-center py-8">
          <p className="text-lg text-muted-foreground">This association does not exist or you don't have permission to view it.</p>
          <Button className="mt-4" onClick={handleBack}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Associations
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
