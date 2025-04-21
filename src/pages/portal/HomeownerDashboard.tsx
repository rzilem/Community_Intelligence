
import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/auth';
import { useSupabaseQuery } from '@/hooks/supabase';
import { Home, Plus, Grid3X3 } from 'lucide-react';
import DashboardWidget from '@/components/portal/DashboardWidget';
import PermissionGuard from '@/components/auth/PermissionGuard';
import { useWidgetSettings } from '@/hooks/portal/useWidgetSettings';
import { WidgetType, PortalWidget } from '@/types/portal-types';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useDraggableWidgets } from '@/hooks/portal/useDraggableWidgets';
import { getWidgetComponent } from '@/components/portal/widgetRegistry';
import WidgetMarketplace from '@/components/portal/WidgetMarketplace';
import AmenityBookingsWidget from '@/components/portal/widgets/AmenityBookingsWidget';
import AIInsightsWidget from '@/components/portal/widgets/AIInsightsWidget';
import CustomWidget from '@/components/portal/widgets/CustomWidget';
import WidgetTemplateLibrary from '@/components/portal/WidgetTemplateLibrary';
import CustomWidgetBuilder from '@/components/portal/CustomWidgetBuilder';
import WidgetExportImport from '@/components/portal/WidgetExportImport';
import { Button } from '@/components/ui/button';

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
  
  const handleApplyTemplate = async (widgetTypes: string[]) => {
    // Disable all widgets first
    for (const widget of orderedWidgets) {
      if (widget.isEnabled && !widgetTypes.includes(widget.widgetType)) {
        await toggleWidget(widget.id, false);
      }
    }
    
    // Then enable widgets from the template
    for (const widgetType of widgetTypes) {
      const widget = orderedWidgets.find(w => w.widgetType === widgetType);
      if (widget && !widget.isEnabled) {
        await toggleWidget(widget.id, true);
      }
    }
  };

  return (
    <PermissionGuard menuId="homeowner-portal">
      <AppLayout>
        <div className="p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Home className="h-6 w-6" />
              <h1 className="text-3xl font-bold tracking-tight">Homeowner Dashboard</h1>
            </div>
            <div className="flex flex-wrap gap-2">
              <WidgetTemplateLibrary 
                portalType="homeowner"
                currentWidgets={enabledWidgetTypes}
                onApplyTemplate={handleApplyTemplate}
              />
              <CustomWidgetBuilder portalType="association" />
              <WidgetExportImport 
                widgets={orderedWidgets}
                portalType="association"
                onImportComplete={() => window.location.reload()}
              />
              <WidgetMarketplace 
                portalType="homeowner"
                enabledWidgets={enabledWidgetTypes}
                onToggleWidget={handleToggleWidget}
              />
            </div>
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
                            ) : widget.widgetType === 'analytics-widget' ? (
                              <AIInsightsWidget 
                                widgetId={widget.id}
                                saveSettings={(settings) => saveWidgetSettings(widget.widgetType, settings)}
                                settings={widget.settings}
                                dragHandleProps={provided.dragHandleProps}
                              />
                            ) : widget.widgetType === 'custom-widget' ? (
                              <CustomWidget 
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
                  
                  {enabledWidgets.length === 0 && (
                    <div className="col-span-3 flex flex-col items-center justify-center bg-muted/40 rounded-lg p-10">
                      <Grid3X3 className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-xl font-semibold mb-2">No Widgets Enabled</h3>
                      <p className="text-muted-foreground text-center mb-4">
                        Your dashboard is empty. Add widgets to customize your view.
                      </p>
                      <Button onClick={() => document.querySelector<HTMLButtonElement>('[aria-label="open-widget-marketplace"]')?.click()}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Widgets
                      </Button>
                    </div>
                  )}
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
