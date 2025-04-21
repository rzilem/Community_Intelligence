
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { WidgetType } from '@/types/portal-types';
import { Loader2, Save, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DashboardWidgetProps {
  title: string;
  widgetType: WidgetType;
  isLoading?: boolean;
  onSave?: () => void;
  isSaving?: boolean;
  children: React.ReactNode;
  className?: string;
  isDraggable?: boolean;
  dragHandleProps?: any;
}

const DashboardWidget: React.FC<DashboardWidgetProps> = ({
  title,
  widgetType,
  isLoading = false,
  onSave,
  isSaving = false,
  children,
  className,
  isDraggable = false,
  dragHandleProps
}) => {
  return (
    <Card className={cn("shadow-sm h-full", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isDraggable && (
              <div 
                className="cursor-move p-1 hover:bg-secondary rounded-md" 
                {...dragHandleProps}
              >
                <GripVertical className="h-4 w-4 text-muted-foreground" />
              </div>
            )}
            <span>{title}</span>
          </div>
          <div className="flex items-center gap-2">
            {onSave && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onSave}
                disabled={isSaving}
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
              </Button>
            )}
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
};

export default DashboardWidget;
