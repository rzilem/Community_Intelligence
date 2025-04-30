
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, FilePlus, MessageSquarePlus, 
  FileText, AlarmClock, BarChart2
} from 'lucide-react';
import { toast } from 'sonner';

interface ActionItem {
  title: string;
  icon: React.ReactNode;
  description: string;
  path: string;
  color: string;
}

const QuickActionWidgets: React.FC = () => {
  const navigate = useNavigate();
  
  const actions: ActionItem[] = [
    {
      title: "Schedule Event",
      icon: <Calendar className="h-5 w-5 text-hoa-blue-600" />,
      description: "Create a new calendar event",
      path: "/operations/calendar",
      color: "bg-gray-100 border-hoa-blue-300 text-hoa-blue-700"
    },
    {
      title: "Send Message",
      icon: <MessageSquarePlus className="h-5 w-5 text-hoa-blue-600" />,
      description: "Send a new communication",
      path: "/communications/messaging",
      color: "bg-gray-100 border-hoa-blue-300 text-hoa-blue-700"
    },
    {
      title: "View Calendar",
      icon: <AlarmClock className="h-5 w-5 text-hoa-blue-600" />,
      description: "View calendar events",
      path: "/operations/calendar",
      color: "bg-gray-100 border-hoa-blue-300 text-hoa-blue-700"
    },
    {
      title: "Create Report",
      icon: <FileText className="h-5 w-5 text-hoa-blue-600" />,
      description: "Generate a new report",
      path: "/records-reports/reports",
      color: "bg-gray-100 border-hoa-blue-300 text-hoa-blue-700"
    },
    {
      title: "New Document",
      icon: <FilePlus className="h-5 w-5 text-hoa-blue-600" />,
      description: "Upload a new document",
      path: "/records-reports/documents",
      color: "bg-gray-100 border-hoa-blue-300 text-hoa-blue-700"
    }
  ];
  
  const handleActionClick = (path: string, title: string) => {
    navigate(path);
    toast.success(`Navigating to ${title}`);
  };
  
  const handleViewAllActions = () => {
    // You can implement a modal or navigate to an "all actions" page
    toast.info("View all actions feature coming soon");
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
      
      <div className="grid grid-cols-5 gap-3">
        {actions.map((action, index) => (
          <button
            key={index}
            className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all 
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
