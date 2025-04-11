
import React from 'react';
import { AlertTriangle } from 'lucide-react';

const RecipientWarning: React.FC = () => {
  return (
    <div className="flex items-start border rounded-md p-4 text-amber-600 bg-amber-50 border-amber-200">
      <AlertTriangle className="h-5 w-5 mr-2 mt-0.5" />
      <div>
        <span className="font-medium">No recipients selected</span>
        <p className="text-sm mt-1">
          Please select at least one recipient group. You can use merge tags like {'{resident.full_name}'} in your message 
          to personalize content for each recipient.
        </p>
      </div>
    </div>
  );
};

export default RecipientWarning;
