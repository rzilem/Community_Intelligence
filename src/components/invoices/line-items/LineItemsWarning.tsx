
import React from 'react';
import { AlertCircle } from 'lucide-react';

interface LineItemsWarningProps {
  show: boolean;
}

export const LineItemsWarning: React.FC<LineItemsWarningProps> = ({ show }) => {
  if (!show) return null;
  
  return (
    <div className="bg-red-50 border border-red-200 p-3 rounded-lg flex items-center gap-2 text-red-600">
      <AlertCircle className="h-5 w-5" />
      <span>Line items do not match the total invoice amount</span>
    </div>
  );
};
