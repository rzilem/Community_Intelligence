import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  Home, Users, Building, DollarSign, Wrench, Calendar,
  MessageSquare, FileText, Settings, HelpCircle, Sparkles,
  AlertTriangle, Briefcase, ClipboardList, BarChart
} from 'lucide-react';

const navigationItems = [
  { path: '/dashboard', label: 'Dashboard', icon: Home },
  { path: '/ai-assistant', label: 'AI Assistant', icon: Sparkles },
  { path: '/properties', label: 'Properties', icon: Building },
  { path: '/residents', label: 'Residents', icon: Users },
  { path: '/accounting', label: 'Accounting', icon: DollarSign },
  { path: '/assessments', label: 'Assessments', icon: ClipboardList },
  { path: '/maintenance', label: 'Maintenance', icon: Wrench },
  { path: '/vendors', label: 'Vendors', icon: Briefcase },
  { path: '/amenities', label: 'Amenities', icon: Calendar },
  { path: '/violations', label: 'Violations', icon: AlertTriangle },
  { path: '/communications', label: 'Communications', icon: MessageSquare },
  { path: '/documents', label: 'Documents', icon: FileText },
  { path: '/reports', label: 'Reports', icon: BarChart },
  { path: '/settings', label: 'Settings', icon: Settings },
  { path: '/help', label: 'Help', icon: HelpCircle }
];

export default function Navigation() {
  const location = useLocation();

  return (
    <nav className="bg-background border-r">
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4">Community Intelligence</h2>
        <ul className="space-y-1">
          {navigationItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-lg transition-colors',
                  'hover:bg-accent hover:text-accent-foreground',
                  location.pathname === item.path && 'bg-accent text-accent-foreground'
                )}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}