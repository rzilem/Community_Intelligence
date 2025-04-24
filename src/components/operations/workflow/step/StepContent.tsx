
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface StepContentProps {
  name: string;
  description?: string;
  index: number;
}

export const StepContent: React.FC<StepContentProps> = ({
  name,
  description,
  index
}) => (
  <div className="flex justify-between items-center">
    <div className="flex items-center gap-3">
      <div>
        <p className="font-medium">{name}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
    <Badge variant="outline">
      Step {index + 1}
    </Badge>
  </div>
);
