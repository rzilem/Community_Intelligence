
import React, { useState } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GripVertical, Settings, Trash2, Eye, EyeOff } from 'lucide-react';
import { Widget } from '@/types/portal-types';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

interface DragDropEditorProps {
  widgets: Widget[];
  onLayoutChange: (layout: any[]) => void;
  onWidgetUpdate: (widgetId: string, updates: Partial<Widget>) => void;
  onWidgetDelete: (widgetId: string) => void;
  isPreviewMode: boolean;
}

export const DragDropEditor: React.FC<DragDropEditorProps> = ({
  widgets,
  onLayoutChange,
  onWidgetUpdate,
  onWidgetDelete,
  isPreviewMode
}) => {
  const [editingWidget, setEditingWidget] = useState<string | null>(null);

  const layouts = {
    lg: widgets.map(widget => ({
      i: widget.id,
      x: widget.gridPosition.x,
      y: widget.gridPosition.y,
      w: widget.gridPosition.w,
      h: widget.gridPosition.h,
      minW: widget.gridPosition.minW || 2,
      minH: widget.gridPosition.minH || 2,
      maxW: widget.gridPosition.maxW || 12,
      maxH: widget.gridPosition.maxH || 10
    }))
  };

  const handleLayoutChange = (layout: any[]) => {
    onLayoutChange(layout);
  };

  const toggleWidgetVisibility = (widgetId: string) => {
    const widget = widgets.find(w => w.id === widgetId);
    if (widget) {
      onWidgetUpdate(widgetId, { isActive: !widget.isActive });
    }
  };

  const renderWidget = (widget: Widget) => {
    return (
      <Card key={widget.id} className={`h-full ${!widget.isActive ? 'opacity-50' : ''}`}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              {!isPreviewMode && <GripVertical className="h-4 w-4 cursor-move" />}
              {widget.title}
            </CardTitle>
            
            {!isPreviewMode && (
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => toggleWidgetVisibility(widget.id)}
                >
                  {widget.isActive ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setEditingWidget(widget.id)}
                >
                  <Settings className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onWidgetDelete(widget.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="space-y-2">
            <Badge variant="outline" className="text-xs">
              {widget.type}
            </Badge>
            
            {/* Widget content based on type */}
            {widget.type === 'calendar' && (
              <div className="text-sm text-muted-foreground">
                <p>📅 Upcoming Events</p>
                <p>• Board Meeting - Jan 15</p>
                <p>• Pool Maintenance - Jan 20</p>
              </div>
            )}
            
            {widget.type === 'announcements' && (
              <div className="text-sm text-muted-foreground">
                <p>📢 Latest News</p>
                <p>• New recycling schedule</p>
                <p>• Holiday decorations policy</p>
              </div>
            )}
            
            {widget.type === 'payments' && (
              <div className="text-sm text-muted-foreground">
                <p>💳 Payment Status</p>
                <p>Balance: $0.00</p>
                <p>Next Due: Feb 1, 2024</p>
              </div>
            )}
            
            {widget.type === 'maintenance' && (
              <div className="text-sm text-muted-foreground">
                <p>🔧 Maintenance Requests</p>
                <p>• Request #123 - In Progress</p>
                <p>• Request #124 - Pending</p>
              </div>
            )}
            
            {/* Add more widget types as needed */}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="w-full h-full">
      <ResponsiveGridLayout
        className="layout"
        layouts={layouts}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        rowHeight={60}
        onLayoutChange={handleLayoutChange}
        isDraggable={!isPreviewMode}
        isResizable={!isPreviewMode}
        margin={[10, 10]}
        containerPadding={[10, 10]}
      >
        {widgets.map(renderWidget)}
      </ResponsiveGridLayout>
    </div>
  );
};
