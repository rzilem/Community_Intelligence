
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { ChevronDown, CheckCircle } from 'lucide-react';
import { ViewConfig, ViewType } from '../types';
import { VIEW_SELECTOR_ACCESSIBILITY } from '../config';

interface ViewSelectorProps {
  views: ViewConfig[];
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  isCompact?: boolean;
}

export const ViewSelector: React.FC<ViewSelectorProps> = ({
  views,
  currentView,
  onViewChange,
  isCompact = false
}) => {
  const currentViewConfig = views.find(v => v.id === currentView);
  const availableViews = views.filter(v => v.available);

  if (availableViews.length === 0) {
    return null;
  }

  if (availableViews.length === 1) {
    const view = availableViews[0];
    const Icon = view.icon;
    
    return (
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4" />
        <span className={isCompact ? 'hidden sm:inline' : ''}>{view.label}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-2"
            {...VIEW_SELECTOR_ACCESSIBILITY}
          >
            {currentViewConfig && (
              <>
                <currentViewConfig.icon className="h-4 w-4" />
                <span className={isCompact ? 'hidden sm:inline' : ''}>
                  {currentViewConfig.label}
                </span>
              </>
            )}
            <ChevronDown className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-64">
          {availableViews.map((view) => {
            const Icon = view.icon;
            const isActive = view.id === currentView;
            
            return (
              <DropdownMenuItem 
                key={view.id}
                onClick={() => onViewChange(view.id)} 
                className="flex flex-col items-start"
                role="tab"
                aria-selected={isActive}
              >
                <div className="flex items-center w-full">
                  <Icon className="h-4 w-4 mr-2" />
                  <span className="flex-1">{view.label}</span>
                  {isActive && <CheckCircle className="h-4 w-4 text-green-500" />}
                  {view.recommended && (
                    <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-1 rounded">
                      Recommended
                    </span>
                  )}
                </div>
                <span className="text-xs text-muted-foreground ml-6">
                  {view.description}
                </span>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Content quality indicator */}
      {currentViewConfig?.recommended && (
        <div className="hidden md:flex items-center text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
          <CheckCircle className="h-3 w-3 mr-1" />
          AI Processed
        </div>
      )}
    </div>
  );
};
