
import { AlertCircle } from 'lucide-react';

export const EmptyLineItems = () => {
  return (
    <div className="bg-red-50 border border-red-200 p-3 rounded-lg flex items-center gap-2 text-red-600">
      <AlertCircle className="h-5 w-5" />
      <span>Line items do not match the total invoice amount</span>
    </div>
  );
};
