
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WidgetType } from '@/types/portal-types';
import { Loader2 } from 'lucide-react';

interface DashboardWidgetProps {
  title: string;
  widgetType: WidgetType;
  isLoading?: boolean;
  children: React.ReactNode;
}

const DashboardWidget: React.FC<DashboardWidgetProps> = ({
  title,
  widgetType,
  isLoading = false,
  children
}) => {
  return (
    <Card className="shadow-sm h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center justify-between">
          <span>{title}</span>
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
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
