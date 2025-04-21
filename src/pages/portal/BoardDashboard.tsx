
import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/auth';
import { useSupabaseQuery } from '@/hooks/supabase';
import { Building } from 'lucide-react';
import DashboardWidget from '@/components/portal/DashboardWidget';
import PermissionGuard from '@/components/auth/PermissionGuard';
import { useWidgetSettings } from '@/hooks/portal/useWidgetSettings';
import { WidgetType, PortalWidget } from '@/types/portal-types';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useDraggableWidgets } from '@/hooks/portal/useDraggableWidgets';
import { getWidgetComponent } from '@/components/portal/widgetRegistry';
import WidgetMarketplace from '@/components/portal/WidgetMarketplace';
import FinancialChartWidget from '@/components/portal/widgets/FinancialChartWidget';
import DelinquentAccountsWidget from '@/components/portal/widgets/DelinquentAccountsWidget';

const BoardDashboard: React.FC = () => {
  const { user, currentAssociation } = useAuth();
  
  // In a real application, we would fetch user-specific widget preferences first,
  // then fall back to association defaults if none are set
  const { data: userWidgets = [], isLoading: loadingUserWidgets } = useSupabaseQuery(
    'user_portal_widgets',
    {
      select: '*',
      filter: [{ column: 'user_id', value: user?.id }],
      order: { column: 'position', ascending: true },
    },
    !!user?.id
  );

  // Transform data to match our PortalWidget type
  const transformedWidgets: PortalWidget[] = userWidgets.map((widget: any) => ({
    id: widget.id,
    widgetType: widget.widget_type as WidgetType,
    settings: widget.settings,
    position: widget.position,
    isEnabled: widget.is_enabled
  }));

  const { saveWidgetSettings, toggleWidget } = useWidgetSettings('user');
  const { orderedWidgets, handleDragEnd } = useDraggableWidgets(transformedWidgets, 'user');

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
    <PermissionGuard menuId="board-portal">
      <AppLayout>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building className="h-6 w-6" />
              <h1 className="text-3xl font-bold tracking-tight">Board Member Dashboard</h1>
            </div>
            <WidgetMarketplace 
              portalType="board"
              enabledWidgets={enabledWidgetTypes}
              onToggleWidget={handleToggleWidget}
            />
          </div>
          
          <p className="text-muted-foreground">
            Welcome to your board member portal. Access important association information and management tools.
          </p>
          
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="widgets" direction="horizontal">
              {(provided) => (
                <div 
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  <Draggable draggableId="financial-chart" index={0}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                      >
                        <FinancialChartWidget 
                          dragHandleProps={provided.dragHandleProps}
                          saveSettings={(settings) => saveWidgetSettings('financial-chart', settings)}
                        />
                      </div>
                    )}
                  </Draggable>
                  
                  <Draggable draggableId="delinquent-accounts" index={1}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                      >
                        <DelinquentAccountsWidget 
                          dragHandleProps={provided.dragHandleProps}
                          saveSettings={(settings) => saveWidgetSettings('delinquent-accounts', settings)}
                        />
                      </div>
                    )}
                  </Draggable>
                  
                  {enabledWidgets
                    .filter(widget => !['financial-chart', 'delinquent-accounts'].includes(widget.widgetType))
                    .map((widget, index) => {
                      const WidgetComponent = getWidgetComponent(widget.widgetType);
                      
                      return (
                        <Draggable key={widget.id} draggableId={widget.id} index={index + 2}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                            >
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

export default BoardDashboard;
