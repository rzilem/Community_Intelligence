
import React from 'react';
import { AlertTriangle } from 'lucide-react';

const RecipientWarning: React.FC = () => {
  return (
    <div className="flex items-center border rounded-md p-4 text-amber-600 bg-amber-50 border-amber-200">
      <AlertTriangle className="h-5 w-5 mr-2" />
      <span>No recipients selected</span>
    </div>
  );
};

export default RecipientWarning;
