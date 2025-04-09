
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import TooltipButton from '@/components/ui/tooltip-button';

interface DashboardHeaderProps {
  associationName?: string;
  notificationCount?: number;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  associationName,
  notificationCount = 0,
}) => {
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
        >
          View All <Badge>{notificationCount}</Badge>
        </TooltipButton>
      </div>
    </div>
  );
};

export default DashboardHeader;
