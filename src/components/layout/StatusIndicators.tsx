
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Clock, CheckCircle, Activity } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface StatusIndicator {
  id: string;
  label: string;
  count: number;
  variant: 'default' | 'secondary' | 'destructive' | 'warning' | 'success';
  icon: React.ReactNode;
  path: string;
  description: string;
}

const StatusIndicators: React.FC = () => {
  const navigate = useNavigate();

  // Mock data - in real app, this would come from API/context
  const indicators: StatusIndicator[] = [
    {
      id: 'pending-requests',
      label: 'Pending',
      count: 12,
      variant: 'warning',
      icon: <Clock className="h-3 w-3" />,
      path: '/homeowners/requests?status=pending',
      description: 'Pending homeowner requests'
    },
    {
      id: 'overdue-items',
      label: 'Overdue',
      count: 3,
      variant: 'destructive',
      icon: <AlertTriangle className="h-3 w-3" />,
      path: '/homeowners/requests?status=overdue',
      description: 'Overdue items requiring attention'
    },
    {
      id: 'active-workflows',
      label: 'Active',
      count: 8,
      variant: 'default',
      icon: <Activity className="h-3 w-3" />,
      path: '/operations/workflows',
      description: 'Active workflows in progress'
    }
  ];

  const handleIndicatorClick = (path: string) => {
    navigate(path);
  };

  const getVariantClass = (variant: string) => {
    const variants = {
      default: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
      secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
      destructive: 'bg-red-100 text-red-700 hover:bg-red-200',
      warning: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200',
      success: 'bg-green-100 text-green-700 hover:bg-green-200'
    };
    return variants[variant as keyof typeof variants] || variants.default;
  };

  return (
    <div className="flex items-center gap-2">
      <TooltipProvider>
        {indicators.map((indicator) => (
          <Tooltip key={indicator.id}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleIndicatorClick(indicator.path)}
                className={`h-7 px-2 gap-1 ${getVariantClass(indicator.variant)} transition-all duration-200 hover:scale-105`}
              >
                {indicator.icon}
                <span className="text-xs font-medium">{indicator.count}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-sm">{indicator.description}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </TooltipProvider>
    </div>
  );
};

export default StatusIndicators;
