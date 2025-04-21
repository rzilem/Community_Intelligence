
import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/auth';
import { useSupabaseQuery } from '@/hooks/supabase';
import { Home, Plus } from 'lucide-react';
import DashboardWidget from '@/components/portal/DashboardWidget';
import PermissionGuard from '@/components/auth/PermissionGuard';
import { useWidgetSettings } from '@/hooks/portal/useWidgetSettings';
import { WidgetType, PortalWidget } from '@/types/portal-types';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useDraggableWidgets } from '@/hooks/portal/useDraggableWidgets';
import { getWidgetComponent } from '@/components/portal/widgetRegistry';
import WidgetMarketplace from '@/components/portal/WidgetMarketplace';
import AmenityBookingsWidget from '@/components/portal/widgets/AmenityBookingsWidget';

const HomeownerDashboard: React.FC = () => {
  const { user, currentAssociation } = useAuth();
  
  const { data: widgetSettings = [], isLoading: loadingWidgets } = useSupabaseQuery(
    'association_portal_widgets',
    {
      select: '*',
      filter: [{ column: 'association_id', value: currentAssociation?.id }],
      order: { column: 'position', ascending: true },
    },
    !!currentAssociation?.id
  );

  // Transform data to match our PortalWidget type
  const transformedWidgets: PortalWidget[] = widgetSettings.map((widget: any) => ({
    id: widget.id,
    widgetType: widget.widget_type as WidgetType,
    settings: widget.settings,
    position: widget.position,
    isEnabled: widget.is_enabled
  }));

  const { saveWidgetSettings, toggleWidget } = useWidgetSettings('association');
  const { orderedWidgets, handleDragEnd } = useDraggableWidgets(transformedWidgets, 'association');

  // Get enabled widgets
  const enabledWidgets = orderedWidgets.filter(widget => widget.isEnabled);
  const enabledWidgetTypes = enabledWidgets.map(widget => widget.widgetType);

  const handleToggleWidget = async (widgetType: string, enabled: boolean) => {
    const widget = orderedWidgets.find(w => w.widgetType === widgetType);
    if (widget) {
      await toggleWidget(widget.id, enabled);
    }
  };

  return (
    <PermissionGuard menuId="homeowner-portal">
      <AppLayout>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Home className="h-6 w-6" />
              <h1 className="text-3xl font-bold tracking-tight">Homeowner Dashboard</h1>
            </div>
            <WidgetMarketplace 
              portalType="homeowner"
              enabledWidgets={enabledWidgetTypes}
              onToggleWidget={handleToggleWidget}
            />
          </div>
          
          <p className="text-muted-foreground">
            Welcome to your homeowner portal. View important information about your property and community.
          </p>
          
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="widgets" direction="horizontal">
              {(provided) => (
                <div 
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  {enabledWidgets.map((widget, index) => {
                    const WidgetComponent = getWidgetComponent(widget.widgetType);
                    
                    return (
                      <Draggable key={widget.id} draggableId={widget.id} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                          >
                            {widget.widgetType === 'amenity-bookings' ? (
                              <AmenityBookingsWidget 
                                widgetId={widget.id}
                                saveSettings={(settings) => saveWidgetSettings(widget.widgetType, settings)}
                                settings={widget.settings}
                                dragHandleProps={provided.dragHandleProps}
                              />
                            ) : (
                              <DashboardWidget 
                                title={widget.widgetType.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} 
                                widgetType={widget.widgetType}
                                isDraggable={true}
                                dragHandleProps={provided.dragHandleProps}
                                onSave={() => saveWidgetSettings(widget.widgetType, { ...widget.settings })}
                              >
                                <WidgetComponent 
                                  widgetId={widget.id}
                                  saveSettings={(settings) => saveWidgetSettings(widget.widgetType, settings)}
                                  settings={widget.settings}
                                />
                              </DashboardWidget>
                            )}
                          </div>
                        )}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      </AppLayout>
    </PermissionGuard>
  );
};

export default HomeownerDashboard;
