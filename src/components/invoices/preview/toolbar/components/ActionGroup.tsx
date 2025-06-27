
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu';
import { ChevronDown } from 'lucide-react';
import { ActionConfig } from '../types';
import { ACTION_GROUP_ACCESSIBILITY } from '../config';

interface ActionGroupProps {
  actions: ActionConfig[];
  isCompact?: boolean;
  maxQuickActions?: number;
}

export const ActionGroup: React.FC<ActionGroupProps> = ({
  actions,
  isCompact = false,
  maxQuickActions = 2
}) => {
  if (actions.length === 0) {
    return null;
  }

  const quickActions = actions
    .filter(action => action.showInQuickActions)
    .slice(0, maxQuickActions);
    
  const dropdownActions = actions.filter(action => !action.showInQuickActions || 
    (action.showInQuickActions && !quickActions.includes(action)));

  return (
    <div className="flex items-center gap-2" {...ACTION_GROUP_ACCESSIBILITY}>
      {/* Quick Actions */}
      {quickActions.map((action) => {
        const Icon = action.icon;
        return (
          <Button
            key={action.id}
            variant={action.variant || 'ghost'}
            size={action.size || 'sm'}
            onClick={action.onClick}
            disabled={action.disabled}
            className={`${isCompact ? 'p-0 h-8 w-8' : 'flex items-center gap-1'}`}
            title={action.label}
            aria-label={action.label}
          >
            <Icon className="h-4 w-4" />
            {!isCompact && (
              <span className="hidden sm:inline text-xs">{action.label}</span>
            )}
          </Button>
        );
      })}

      {/* Dropdown Actions */}
      {dropdownActions.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-2"
              aria-label="More actions"
            >
              <span className="hidden sm:inline">Actions</span>
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {dropdownActions.map((action, index) => {
              const Icon = action.icon;
              const isLoading = action.loading;
              
              return (
                <React.Fragment key={action.id}>
                  <DropdownMenuItem 
                    onClick={action.onClick} 
                    disabled={action.disabled}
                    className="flex items-center"
                  >
                    <Icon className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                    {action.label}
                  </DropdownMenuItem>
                  {/* Add separator before settings if it exists */}
                  {action.id === 'settings' && index < dropdownActions.length - 1 && (
                    <DropdownMenuSeparator />
                  )}
                </React.Fragment>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
};
