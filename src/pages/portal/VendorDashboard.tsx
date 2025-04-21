
import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/auth';
import { useSupabaseQuery } from '@/hooks/supabase';
import { Truck } from 'lucide-react';
import DashboardWidget from '@/components/portal/DashboardWidget';
import PermissionGuard from '@/components/auth/PermissionGuard';
import { useWidgetSettings } from '@/hooks/portal/useWidgetSettings';
import { WidgetType, PortalWidget } from '@/types/portal-types';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useDraggableWidgets } from '@/hooks/portal/useDraggableWidgets';
import { getWidgetComponent } from '@/components/portal/widgetRegistry';
import WidgetMarketplace from '@/components/portal/WidgetMarketplace';
import UpcomingBidsWidget from '@/components/portal/widgets/UpcomingBidsWidget';

const VendorDashboard: React.FC = () => {
  const { user } = useAuth();
  
  const { data: vendorProfile, isLoading: loadingProfile } = useSupabaseQuery(
    'vendor_profiles',
    {
      select: '*',
      filter: [{ column: 'user_id', value: user?.id }],
      single: true
    },
    !!user?.id
  );

  const { data: userWidgets = [], isLoading: loadingWidgets } = useSupabaseQuery(
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

  if (loadingProfile) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <PermissionGuard menuId="vendor-portal">
      <AppLayout>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Truck className="h-6 w-6" />
              <h1 className="text-3xl font-bold tracking-tight">Vendor Dashboard</h1>
            </div>
            <WidgetMarketplace 
              portalType="vendor"
              enabledWidgets={enabledWidgetTypes}
              onToggleWidget={handleToggleWidget}
            />
          </div>
          
          <p className="text-muted-foreground">
            Welcome to your vendor portal. Manage your company profile, invoices, and services.
          </p>
          
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="widgets" direction="horizontal">
              {(provided) => (
                <div 
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  <Draggable draggableId="upcoming-bids" index={0}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                      >
                        <UpcomingBidsWidget 
                          dragHandleProps={provided.dragHandleProps}
                          saveSettings={(settings) => saveWidgetSettings('upcoming-bids', settings)}
                        />
                      </div>
                    )}
                  </Draggable>
                  
                  <Draggable draggableId="company-profile" index={1}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                      >
                        <DashboardWidget 
                          title="Company Profile" 
                          widgetType="vendor-stats"
                          isDraggable={true}
                          dragHandleProps={provided.dragHandleProps}
                        >
                          <div className="space-y-4">
                            <p className="text-lg font-semibold">{vendorProfile?.company_name || 'Your Company'}</p>
                            <div className="flex items-center gap-2">
                              <span>Status:</span>
                              <span className={`px-2 py-1 rounded text-xs ${vendorProfile?.is_preferred ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                {vendorProfile?.is_preferred ? 'Preferred Vendor' : 'Standard Vendor'}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">{vendorProfile?.company_description || 'No company description available'}</p>
                            <button className="w-full bg-primary text-white py-2 px-4 rounded">Update Profile</button>
                          </div>
                        </DashboardWidget>
                      </div>
                    )}
                  </Draggable>
                  
                  {enabledWidgets
                    .filter(widget => !['upcoming-bids', 'vendor-stats'].includes(widget.widgetType))
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

export default VendorDashboard;
