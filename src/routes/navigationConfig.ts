
import { Home, Users, Building2, Calendar, Mail, FileText, CheckSquare, UserPlus, Settings, ShieldAlert, Brain, MessageSquare } from 'lucide-react';
import { NavigationCategory } from './types';

export const navigationItems: NavigationCategory[] = [
  {
    category: 'main',
    label: 'Main',
    icon: Home,
    items: [
      { path: '/dashboard', label: 'Dashboard', icon: Home },
      { path: '/homeowners', label: 'Homeowners', icon: Users },
      { path: '/associations', label: 'Associations', icon: Building2 },
      { path: '/events', label: 'Events', icon: Calendar },
    ]
  },
  {
    category: 'communication',
    label: 'Communication',
    icon: Mail,
    items: [
      { path: '/communication-templates', label: 'Templates', icon: FileText },
      { path: '/communication-logs', label: 'Logs', icon: Mail },
    ]
  },
  {
    category: 'billing',
    label: 'Billing',
    icon: CheckSquare,
    items: [
      { path: '/billing', label: 'Assessments', icon: CheckSquare },
    ]
  },
  {
    category: 'onboarding',
    label: 'Onboarding',
    icon: UserPlus,
    items: [
      { path: '/onboarding', label: 'Templates', icon: FileText },
    ]
  },
  {
    category: 'admin',
    label: 'Administration',
    icon: Settings,
    items: [
      { path: '/admin/users', label: 'User Management', icon: UserPlus },
      { path: '/admin/roles', label: 'Role Management', icon: ShieldAlert },
      { path: '/settings', label: 'Settings', icon: Settings },
    ]
  },
  {
    category: 'ai',
    label: 'AI Features',
    icon: Brain,
    items: [
      { path: '/ai-query', label: 'AI Query', icon: MessageSquare },
      // Future AI features will be added here
    ]
  },
];
