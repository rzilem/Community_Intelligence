
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getAvailableWidgets } from './widgetRegistry';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface WidgetMarketplaceProps {
  portalType: 'homeowner' | 'board' | 'vendor';
  enabledWidgets: string[];
  onToggleWidget: (widgetType: string, enabled: boolean) => void;
}

const WidgetMarketplace: React.FC<WidgetMarketplaceProps> = ({
  portalType,
  enabledWidgets,
  onToggleWidget
}) => {
  const [open, setOpen] = useState(false);
  const availableWidgets = getAvailableWidgets(portalType);
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Add Widgets</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Widget Marketplace</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All Widgets</TabsTrigger>
            <TabsTrigger value="enabled">Enabled</TabsTrigger>
            <TabsTrigger value="disabled">Disabled</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-4 py-4">
            <div className="grid gap-4 md:grid-cols-2">
              {availableWidgets.map((widget) => (
                <div key={widget.type} className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label htmlFor={`${widget.type}-toggle`}>{widget.name}</Label>
                    <p className="text-sm text-muted-foreground">
                      {widget.description}
                    </p>
                  </div>
                  <Switch
                    id={`${widget.type}-toggle`}
                    checked={enabledWidgets.includes(widget.type)}
                    onCheckedChange={(checked) => onToggleWidget(widget.type, checked)}
                  />
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="enabled" className="space-y-4 py-4">
            <div className="grid gap-4 md:grid-cols-2">
              {availableWidgets
                .filter(widget => enabledWidgets.includes(widget.type))
                .map((widget) => (
                  <div key={widget.type} className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <Label htmlFor={`${widget.type}-toggle-enabled`}>{widget.name}</Label>
                      <p className="text-sm text-muted-foreground">
                        {widget.description}
                      </p>
                    </div>
                    <Switch
                      id={`${widget.type}-toggle-enabled`}
                      checked={true}
                      onCheckedChange={(checked) => onToggleWidget(widget.type, checked)}
                    />
                  </div>
                ))}
            </div>
          </TabsContent>
          
          <TabsContent value="disabled" className="space-y-4 py-4">
            <div className="grid gap-4 md:grid-cols-2">
              {availableWidgets
                .filter(widget => !enabledWidgets.includes(widget.type))
                .map((widget) => (
                  <div key={widget.type} className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <Label htmlFor={`${widget.type}-toggle-disabled`}>{widget.name}</Label>
                      <p className="text-sm text-muted-foreground">
                        {widget.description}
                      </p>
                    </div>
                    <Switch
                      id={`${widget.type}-toggle-disabled`}
                      checked={false}
                      onCheckedChange={(checked) => onToggleWidget(widget.type, checked)}
                    />
                  </div>
                ))}
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end mt-4">
          <Button onClick={() => setOpen(false)}>Done</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WidgetMarketplace;
