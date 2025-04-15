
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
      icon: <Calendar className="h-5 w-5 text-hoa-blue-600" />,
      description: "Create a new calendar event",
      path: "/calendar/new",
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
      title: "Calendar",
      icon: <AlarmClock className="h-5 w-5 text-hoa-blue-600" />,
      description: "View calendar events",
      path: "/calendar",
      color: "bg-gray-100 border-hoa-blue-300 text-hoa-blue-700"
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
      
      <div className="grid grid-cols-3 gap-4">
        {actions.map((action, index) => (
          <button
            key={index}
            className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all 
              ${action.color} 
              hover:shadow-md hover:border-hoa-blue-500 
              focus:outline-none focus:ring-2 focus:ring-hoa-blue-300`}
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
