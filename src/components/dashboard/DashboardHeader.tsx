
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import TooltipButton from '@/components/ui/tooltip-button';
import { toast } from 'sonner';
import { useNotificationContext } from '@/contexts/notifications';

interface DashboardHeaderProps {
  associationName?: string;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  associationName,
}) => {
  const navigate = useNavigate();
  const { unreadCount } = useNotificationContext();

  const handleViewAllNotifications = () => {
    // Navigate to the notifications page
    navigate('/notifications');
    toast.success('Navigating to notifications page');
  };

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's what's happening{associationName ? ` in ${associationName}` : ' across your communities'} today.
        </p>
      </div>
      <div className="flex items-center gap-2">
        <TooltipButton 
          variant="outline" 
          tooltip="Create a new HOA"
          asChild
        >
          <Link to="/system/associations">
            <Plus className="h-4 w-4 mr-2" />
            New HOA
          </Link>
        </TooltipButton>
        <TooltipButton
          tooltip="View all notifications"
          onClick={handleViewAllNotifications}
        >
          View All <Badge>{unreadCount}</Badge>
        </TooltipButton>
      </div>
    </div>
  );
};

export default DashboardHeader;
