
import React from 'react';
import { Button } from '@/components/ui/button';
import { Filter } from 'lucide-react';
import TooltipButton from '@/components/ui/tooltip-button';

interface MoreFiltersButtonProps {
  onClick?: () => void;
}

const MoreFiltersButton: React.FC<MoreFiltersButtonProps> = ({ onClick }) => {
  return (
    <TooltipButton 
      variant="outline" 
      className="flex items-center gap-2"
      tooltip="Open advanced filters"
      onClick={onClick}
    >
      <Filter className="h-4 w-4" /> More Filters
    </TooltipButton>
  );
};

export default MoreFiltersButton;
