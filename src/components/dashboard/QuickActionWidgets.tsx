
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart2 } from 'lucide-react';
import { toast } from 'sonner';
import { quickActionItems, QuickActionItem } from '@/data/quickActionItems';

const QuickActionWidgets: React.FC = () => {
  const navigate = useNavigate();

  const actions: QuickActionItem[] = quickActionItems;
  
  const handleActionClick = (path: string, title: string) => {
    navigate(path);
    toast.success(`Navigating to ${title}`);
  };
  
  const handleViewAllActions = () => {
    navigate('/dashboard/actions');
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Quick Actions</h3>
        <button 
          className="text-sm text-hoa-blue-600 hover:text-hoa-blue-800 flex items-center"
          onClick={handleViewAllActions}
        >
          <span className="mr-1">All Actions</span>
          <BarChart2 className="h-4 w-4" />
        </button>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {actions.map((action, index) => (
          <button
            key={index}
            className={`flex flex-col items-center justify-center p-4 sm:p-5 rounded-lg border-2 transition-all
              ${action.color}
              hover:shadow-md hover:border-hoa-blue-500
              focus:outline-none focus:ring-2 focus:ring-hoa-blue-300`}
            onClick={() => handleActionClick(action.path, action.title)}
            aria-label={action.description}
          >
            <div className="mb-2">{action.icon}</div>
            <span className="text-sm font-medium">{action.title}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActionWidgets;
