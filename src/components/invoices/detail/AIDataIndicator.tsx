
import React from 'react';
import AIBadge from '@/components/ui/ai-badge';

interface AIDataIndicatorProps {
  field: string;
  confidenceData?: Record<string, number>;
  className?: string;
}

const AIDataIndicator: React.FC<AIDataIndicatorProps> = ({ 
  field, 
  confidenceData,
  className = ""
}) => {
  if (!confidenceData || !confidenceData[field]) {
    return null;
  }

  return (
    <div className={`absolute right-2 top-2 z-10 ${className}`}>
      <AIBadge confidence={confidenceData[field]} />
    </div>
  );
};

export default AIDataIndicator;
