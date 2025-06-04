import { ReactNode } from 'react';
import { Calendar, MessageSquarePlus, AlarmClock, FileText, FilePlus } from 'lucide-react';

export interface QuickActionItem {
  title: string;
  icon: ReactNode;
  description: string;
  path: string;
  color: string;
}

export const quickActionItems: QuickActionItem[] = [
  {
    title: "Schedule Event",
    icon: <Calendar className="h-5 w-5 text-hoa-blue-600" />,
    description: "Create a new calendar event",
    path: "/operations/calendar",
    color: "bg-gray-100 border-hoa-blue-300 text-hoa-blue-700",
  },
  {
    title: "Send Message",
    icon: <MessageSquarePlus className="h-5 w-5 text-hoa-blue-600" />,
    description: "Send a new communication",
    path: "/communications/messaging",
    color: "bg-gray-100 border-hoa-blue-300 text-hoa-blue-700",
  },
  {
    title: "View Calendar",
    icon: <AlarmClock className="h-5 w-5 text-hoa-blue-600" />,
    description: "View calendar events",
    path: "/operations/calendar",
    color: "bg-gray-100 border-hoa-blue-300 text-hoa-blue-700",
  },
  {
    title: "Create Report",
    icon: <FileText className="h-5 w-5 text-hoa-blue-600" />,
    description: "Generate a new report",
    path: "/records-reports/reports",
    color: "bg-gray-100 border-hoa-blue-300 text-hoa-blue-700",
  },
  {
    title: "New Document",
    icon: <FilePlus className="h-5 w-5 text-hoa-blue-600" />,
    description: "Upload a new document",
    path: "/records-reports/documents",
    color: "bg-gray-100 border-hoa-blue-300 text-hoa-blue-700",
  },
];
