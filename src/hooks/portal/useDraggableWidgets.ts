
import { useState, useEffect } from 'react';
import { PortalWidget } from '@/types/portal-types';
import { useWidgetSettings } from './useWidgetSettings';
import { useResponsive } from '@/hooks/use-responsive';

export const useDraggableWidgets = (
  widgets: PortalWidget[], 
  portalType: 'user' | 'association'
) => {
  const [orderedWidgets, setOrderedWidgets] = useState<PortalWidget[]>(
    [...widgets].sort((a, b) => a.position - b.position)
  );
  
  const { toggleWidget, saveWidgetSettings } = useWidgetSettings(portalType);
  const { isMobile } = useResponsive();
  
  // Update widget order after drag and drop
  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;
    
    const items = Array.from(orderedWidgets);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    // Update positions
    const updatedItems = items.map((item, index) => ({
      ...item,
      position: index
    }));
    
    setOrderedWidgets(updatedItems);
    
    // Save the new positions to the database
    try {
      // Update each widget with its new position
      for (const widget of updatedItems) {
        await saveWidgetSettings(widget.widgetType, {
          ...widget.settings,
          position: widget.position
        });
      }
    } catch (error) {
      console.error('Error saving widget positions:', error);
    }
  };
  
  // Share widget with another user
  const shareWidget = async (widgetId: string, userId: string) => {
    try {
      const widget = orderedWidgets.find(w => w.id === widgetId);
      if (widget) {
        // This would call an API endpoint to share the widget
        console.log(`Sharing widget ${widget.widgetType} with user ${userId}`);
        toast.success(`Widget shared successfully`);
      }
    } catch (error) {
      console.error('Error sharing widget:', error);
      toast.error('Failed to share widget');
    }
  };
  
  // Optimize widgets layout for mobile
  useEffect(() => {
    if (isMobile) {
      // On mobile, prioritize important widgets at the top
      const prioritizedWidgets = [...orderedWidgets].sort((a, b) => {
        // Example prioritization logic - could be customized based on widget type
        const priorityOrder: Record<string, number> = {
          'payments': 1,
          'requests': 2,
          'notifications-widget': 3
        };
        
        const priorityA = priorityOrder[a.widgetType] || 99;
        const priorityB = priorityOrder[b.widgetType] || 99;
        
        return priorityA - priorityB;
      });
      
      setOrderedWidgets(prioritizedWidgets);
    }
  }, [isMobile]);
  
  return {
    orderedWidgets,
    handleDragEnd,
    toggleWidget,
    shareWidget
  };
};
