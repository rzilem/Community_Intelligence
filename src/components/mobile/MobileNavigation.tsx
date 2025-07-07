import React from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Home, 
  Wrench, 
  Users, 
  FileText, 
  MessageCircle,
  Plus,
  Camera,
  MapPin
} from 'lucide-react';

interface MobileNavigationProps {
  onQuickAction?: (action: string) => void;
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({ onQuickAction }) => {
  const location = useLocation();

  const navItems = [
    { 
      icon: Home, 
      label: 'Dashboard', 
      path: '/dashboard',
      badge: null
    },
    { 
      icon: Wrench, 
      label: 'Maintenance', 
      path: '/homeowners',
      badge: 3
    },
    { 
      icon: Users, 
      label: 'Residents', 
      path: '/residents',
      badge: null
    },
    { 
      icon: FileText, 
      label: 'Reports', 
      path: '/accounting',
      badge: null
    },
    { 
      icon: MessageCircle, 
      label: 'Messages', 
      path: '/communications',
      badge: 5
    }
  ];

  const quickActions = [
    { icon: Plus, label: 'New Request', action: 'new-request' },
    { icon: Camera, label: 'Photo Report', action: 'photo-report' },
    { icon: MapPin, label: 'Check-in', action: 'check-in' }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50 md:hidden">
      {/* Quick Actions Bar */}
      <div className="flex justify-center py-2 bg-muted/50">
        <div className="flex gap-2">
          {quickActions.map((action) => (
            <Button
              key={action.action}
              variant="ghost"
              size="sm"
              className="flex-col h-auto py-1 px-2"
              onClick={() => onQuickAction?.(action.action)}
            >
              <action.icon className="h-4 w-4" />
              <span className="text-xs mt-1">{action.label}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Main Navigation */}
      <div className="flex justify-around py-2">
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <Button
              key={item.path}
              variant={isActive ? "default" : "ghost"}
              size="sm"
              className="flex-col h-auto py-2 px-1 relative"
              onClick={() => window.location.href = item.path}
            >
              <item.icon className={`h-5 w-5 ${isActive ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
              <span className={`text-xs mt-1 ${isActive ? 'text-primary-foreground' : 'text-muted-foreground'}`}>
                {item.label}
              </span>
              {item.badge && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center"
                >
                  {item.badge}
                </Badge>
              )}
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default MobileNavigation;