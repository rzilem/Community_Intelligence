
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface PlaceholderTabProps {
  title: string;
}

export const PlaceholderTab: React.FC<PlaceholderTabProps> = ({ title }) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <h3 className="text-lg font-bold mb-4">{title}</h3>
        <p className="text-muted-foreground">{title} will be displayed here.</p>
      </CardContent>
    </Card>
  );
};
