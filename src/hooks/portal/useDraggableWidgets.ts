
import { useState } from 'react';
import { PortalWidget } from '@/types/portal-types';
import { useWidgetSettings } from './useWidgetSettings';

export const useDraggableWidgets = (
  widgets: PortalWidget[], 
  portalType: 'user' | 'association'
) => {
  const [orderedWidgets, setOrderedWidgets] = useState<PortalWidget[]>(
    [...widgets].sort((a, b) => a.position - b.position)
  );
  
  const { toggleWidget, saveWidgetSettings } = useWidgetSettings(portalType);
  
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
  
  return {
    orderedWidgets,
    handleDragEnd,
    toggleWidget
  };
};
