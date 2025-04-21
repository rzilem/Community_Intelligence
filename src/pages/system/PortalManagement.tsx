
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getAvailableWidgets } from '@/components/portal/widgetRegistry';

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

  const availableHomeownerWidgets = getAvailableWidgets('homeowner');
  const availableBoardWidgets = getAvailableWidgets('board');
  const availableVendorWidgets = getAvailableWidgets('vendor');

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
                      {availableHomeownerWidgets.map((widget) => (
                        <div key={widget.type} className="flex items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <Label htmlFor={`${widget.type}-toggle`} className="text-base">{widget.name}</Label>
                            <p className="text-sm text-muted-foreground">
                              {widget.description}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <Select defaultValue="required">
                              <SelectTrigger className="w-32">
                                <SelectValue placeholder="Status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="required">Required</SelectItem>
                                <SelectItem value="optional">Optional</SelectItem>
                                <SelectItem value="hidden">Hidden</SelectItem>
                              </SelectContent>
                            </Select>
                            <Switch
                              id={`${widget.type}-toggle`}
                              defaultChecked={true}
                              onCheckedChange={(checked) => handleWidgetToggle(widget.type, checked)}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button className="mt-4">Save Configuration</Button>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Default Widget Layout</CardTitle>
                <CardDescription>
                  Set the default order and position of widgets for new users.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    {availableHomeownerWidgets.slice(0, 6).map((widget, index) => (
                      <div key={widget.type} className="flex items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <Label className="text-base">{widget.name}</Label>
                        </div>
                        <div className="flex items-center">
                          <Select defaultValue={`${index + 1}`}>
                            <SelectTrigger className="w-16">
                              <SelectValue placeholder="Position" />
                            </SelectTrigger>
                            <SelectContent>
                              {[1, 2, 3, 4, 5, 6].map(pos => (
                                <SelectItem key={pos} value={`${pos}`}>{pos}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button className="mt-4">Save Layout</Button>
                </div>
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
                  {availableBoardWidgets.map((widget) => (
                    <div key={widget.type} className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <Label htmlFor={`board-${widget.type}-toggle`} className="text-base">
                          {widget.name}
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          {widget.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Select defaultValue="required">
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="required">Required</SelectItem>
                            <SelectItem value="optional">Optional</SelectItem>
                            <SelectItem value="hidden">Hidden</SelectItem>
                          </SelectContent>
                        </Select>
                        <Switch
                          id={`board-${widget.type}-toggle`}
                          defaultChecked={true}
                          onCheckedChange={(checked) => handleWidgetToggle(`board-${widget.type}`, checked)}
                        />
                      </div>
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
                  {availableVendorWidgets.map((widget) => (
                    <div key={widget.type} className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <Label htmlFor={`vendor-${widget.type}-toggle`} className="text-base">
                          {widget.name}
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          {widget.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Select defaultValue="required">
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="required">Required</SelectItem>
                            <SelectItem value="optional">Optional</SelectItem>
                            <SelectItem value="hidden">Hidden</SelectItem>
                          </SelectContent>
                        </Select>
                        <Switch
                          id={`vendor-${widget.type}-toggle`}
                          defaultChecked={true}
                          onCheckedChange={(checked) => handleWidgetToggle(`vendor-${widget.type}`, checked)}
                        />
                      </div>
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
