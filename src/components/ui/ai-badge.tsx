
import React from 'react';
import { Sparkles } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface AIBadgeProps {
  confidence?: number;
  large?: boolean;
}

const AIBadge: React.FC<AIBadgeProps> = ({ confidence = 0.9, large = false }) => {
  // Determine badge color based on confidence level
  const getBadgeColor = () => {
    if (confidence >= 0.9) return "text-blue-500 bg-blue-50";
    if (confidence >= 0.7) return "text-green-500 bg-green-50";
    if (confidence >= 0.5) return "text-amber-500 bg-amber-50";
    return "text-gray-500 bg-gray-50";
  };

  // Get confidence as percentage
  const confidencePercent = Math.round(confidence * 100);
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`inline-flex items-center rounded-md gap-1 px-2 py-1 ${getBadgeColor()} cursor-help`}>
            <Sparkles size={large ? 16 : 12} />
            <span className={`font-medium ${large ? "text-xs" : "text-[10px]"}`}>AI</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>AI-extracted data ({confidencePercent}% confidence)</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default AIBadge;
