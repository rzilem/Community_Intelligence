
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, FilePlus, MessageSquarePlus, 
  FileText, AlarmClock, BarChart2
} from 'lucide-react';

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
      icon: <Calendar className="h-5 w-5" />,
      description: "Create a new calendar event",
      path: "/calendar/new",
      color: "bg-hoa-blue-100 text-hoa-blue-700"
    },
    {
      title: "New Request",
      icon: <FilePlus className="h-5 w-5" />,
      description: "Submit a homeowner request",
      path: "/community-management/homeowner-requests/new",
      color: "bg-hoa-teal-100 text-hoa-teal-700"
    },
    {
      title: "Send Message",
      icon: <MessageSquarePlus className="h-5 w-5" />,
      description: "Send a new communication",
      path: "/communications/messaging",
      color: "bg-hoa-blue-100 text-hoa-blue-600"
    },
    {
      title: "Run Report",
      icon: <FileText className="h-5 w-5" />,
      description: "Generate a new report",
      path: "/records-reports/reports",
      color: "bg-hoa-teal-100 text-hoa-teal-700"
    },
    {
      title: "Schedule Maintenance",
      icon: <AlarmClock className="h-5 w-5" />,
      description: "Create maintenance task",
      path: "/operations/maintenance/new",
      color: "bg-hoa-blue-100 text-hoa-blue-600"
    }
  ];
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Quick Actions</h3>
        <button 
          className="text-sm text-hoa-blue-600 hover:text-hoa-blue-800 flex items-center"
          onClick={() => console.log('Show all actions')}
        >
          <span className="mr-1">All Actions</span>
          <BarChart2 className="h-4 w-4" />
        </button>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {actions.map((action, index) => (
          <button
            key={index}
            className={`flex flex-col items-center justify-center p-3 rounded-lg border shadow-sm hover:shadow-md transition-all ${action.color} h-[100px]`}
            onClick={() => navigate(action.path)}
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
