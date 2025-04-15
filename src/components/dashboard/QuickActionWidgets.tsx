
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, FilePlus, UserPlus, MessageSquarePlus, 
  Wallet, FileText, Building, AlarmClock, 
  BarChart2, PlusCircle, Briefcase
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
      color: "bg-blue-100 text-blue-700"
    },
    {
      title: "New Request",
      icon: <FilePlus className="h-5 w-5" />,
      description: "Submit a homeowner request",
      path: "/community-management/homeowner-requests/new",
      color: "bg-purple-100 text-purple-700"
    },
    {
      title: "Add Homeowner",
      icon: <UserPlus className="h-5 w-5" />,
      description: "Register a new homeowner",
      path: "/community-management/homeowners/new",
      color: "bg-green-100 text-green-700"
    },
    {
      title: "Send Message",
      icon: <MessageSquarePlus className="h-5 w-5" />,
      description: "Send a new communication",
      path: "/communications/messaging",
      color: "bg-yellow-100 text-yellow-700"
    },
    {
      title: "Record Payment",
      icon: <Wallet className="h-5 w-5" />,
      description: "Log a new payment",
      path: "/accounting/payments/new",
      color: "bg-red-100 text-red-700"
    },
    {
      title: "Run Report",
      icon: <FileText className="h-5 w-5" />,
      description: "Generate a new report",
      path: "/records-reports/reports",
      color: "bg-indigo-100 text-indigo-700"
    },
    {
      title: "New Association",
      icon: <Building className="h-5 w-5" />,
      description: "Add a new association",
      path: "/associations/new",
      color: "bg-pink-100 text-pink-700"
    },
    {
      title: "Schedule Maintenance",
      icon: <AlarmClock className="h-5 w-5" />,
      description: "Create maintenance task",
      path: "/operations/maintenance/new",
      color: "bg-orange-100 text-orange-700"
    }
  ];
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Quick Actions</h3>
        <button 
          className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
          onClick={() => console.log('Show all actions')}
        >
          <span className="mr-1">All Actions</span>
          <PlusCircle className="h-4 w-4" />
        </button>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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
