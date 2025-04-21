
import React, { useState } from 'react';
import { Shield, Settings, Users, Building, Truck } from 'lucide-react';
import PageTemplate from '@/components/layout/PageTemplate';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useSupabaseQuery } from '@/hooks/supabase';
import { useAuth } from '@/contexts/auth';
import PermissionGuard from '@/components/auth/PermissionGuard';

const PortalManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('homeowner');
  const { currentAssociation } = useAuth();
  
  const { data: associationWidgets = [], isLoading: loadingWidgets } = useSupabaseQuery(
    'association_portal_widgets',
    {
      select: '*',
      filter: [{ column: 'association_id', value: currentAssociation?.id }],
      order: { column: 'position', ascending: true },
    },
    !!currentAssociation?.id
  );

  const handleWidgetToggle = (widgetId: string, enabled: boolean) => {
    // This would be implemented to update the widget settings
    toast.success(`Widget ${enabled ? 'enabled' : 'disabled'} successfully`);
  };

  return (
    <PermissionGuard menuId="system" submenuId="settings" requiredAccess="full">
      <PageTemplate
        title="Portal Management"
        icon={<Settings className="h-8 w-8" />}
        description="Configure dashboards and features for different user portal experiences."
      >
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="homeowner" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Homeowner Portal
            </TabsTrigger>
            <TabsTrigger value="board" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              Board Portal
            </TabsTrigger>
            <TabsTrigger value="vendor" className="flex items-center gap-2">
              <Truck className="h-4 w-4" />
              Vendor Portal
            </TabsTrigger>
          </TabsList>

          <TabsContent value="homeowner" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Homeowner Dashboard Configuration</CardTitle>
                <CardDescription>
                  Configure widgets that homeowners will see on their dashboard.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingWidgets ? (
                  <div className="flex justify-center py-8">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      {['payments', 'requests', 'violations', 'announcements', 'documents', 'calendar'].map((widgetType) => (
                        <div key={widgetType} className="flex items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <Label htmlFor={`${widgetType}-toggle`} className="text-base">{widgetType.charAt(0).toUpperCase() + widgetType.slice(1)}</Label>
                            <p className="text-sm text-muted-foreground">
                              {`${widgetType.charAt(0).toUpperCase() + widgetType.slice(1)} information for homeowners`}
                            </p>
                          </div>
                          <Switch
                            id={`${widgetType}-toggle`}
                            defaultChecked={true}
                            onCheckedChange={(checked) => handleWidgetToggle(widgetType, checked)}
                          />
                        </div>
                      ))}
                    </div>
                    <Button className="mt-4">Save Configuration</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="board" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Board Member Dashboard Configuration</CardTitle>
                <CardDescription>
                  Configure widgets that board members will see on their dashboard.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {['financial-snapshot', 'violations', 'requests', 'board-summary', 'calendar', 'documents'].map((widgetType) => (
                    <div key={widgetType} className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <Label htmlFor={`board-${widgetType}-toggle`} className="text-base">
                          {widgetType.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          {`${widgetType.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} for board members`}
                        </p>
                      </div>
                      <Switch
                        id={`board-${widgetType}-toggle`}
                        defaultChecked={true}
                        onCheckedChange={(checked) => handleWidgetToggle(`board-${widgetType}`, checked)}
                      />
                    </div>
                  ))}
                </div>
                <Button className="mt-4">Save Configuration</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="vendor" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Vendor Portal Configuration</CardTitle>
                <CardDescription>
                  Configure widgets and features for vendor portal dashboard.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {['payments', 'invoices', 'vendor-stats', 'bid-opportunities', 'preferred-status'].map((widgetType) => (
                    <div key={widgetType} className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <Label htmlFor={`vendor-${widgetType}-toggle`} className="text-base">
                          {widgetType.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          {`${widgetType.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} for vendors`}
                        </p>
                      </div>
                      <Switch
                        id={`vendor-${widgetType}-toggle`}
                        defaultChecked={true}
                        onCheckedChange={(checked) => handleWidgetToggle(`vendor-${widgetType}`, checked)}
                      />
                    </div>
                  ))}
                </div>
                <Button className="mt-4">Save Configuration</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </PageTemplate>
    </PermissionGuard>
  );
};

export default PortalManagement;
