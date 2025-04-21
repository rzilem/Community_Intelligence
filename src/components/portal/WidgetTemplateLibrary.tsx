
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getAvailableWidgets } from './widgetRegistry';
import { useWidgetSettings } from '@/hooks/portal/useWidgetSettings';
import { toast } from 'sonner';
import { Download, FileText } from 'lucide-react';

interface TemplateSet {
  id: string;
  name: string;
  description: string;
  widgets: string[];
  portalType: 'homeowner' | 'board' | 'vendor';
}

// Predefined templates for quick setup
const templateSets: TemplateSet[] = [
  {
    id: 'homeowner-default',
    name: 'Homeowner Default',
    description: 'Standard widgets for homeowners including amenities, payments, and documents',
    widgets: ['payments', 'requests', 'violations', 'announcements', 'amenity-bookings', 'documents'],
    portalType: 'homeowner'
  },
  {
    id: 'homeowner-minimal',
    name: 'Homeowner Minimal',
    description: 'Simplified dashboard with only essential widgets',
    widgets: ['payments', 'requests', 'announcements'],
    portalType: 'homeowner'
  },
  {
    id: 'board-financial',
    name: 'Board Financial Focus',
    description: 'Dashboard focused on financial insights and management',
    widgets: ['financial-chart', 'delinquent-accounts', 'payments', 'vendor-stats'],
    portalType: 'board'
  },
  {
    id: 'board-management',
    name: 'Board Management',
    description: 'Comprehensive set of management widgets for board members',
    widgets: ['financial-chart', 'delinquent-accounts', 'violations', 'announcements', 'calendar'],
    portalType: 'board'
  },
  {
    id: 'vendor-business',
    name: 'Vendor Business',
    description: 'Business-focused dashboard for service providers',
    widgets: ['upcoming-bids', 'invoices', 'vendor-stats', 'preferred-status'],
    portalType: 'vendor'
  }
];

interface WidgetTemplateLibraryProps {
  portalType: 'homeowner' | 'board' | 'vendor';
  currentWidgets: string[];
  onApplyTemplate: (widgetTypes: string[]) => void;
}

const WidgetTemplateLibrary: React.FC<WidgetTemplateLibraryProps> = ({
  portalType,
  currentWidgets,
  onApplyTemplate
}) => {
  const [open, setOpen] = useState(false);
  const filteredTemplates = templateSets.filter(template => template.portalType === portalType);
  
  const handleApplyTemplate = (template: TemplateSet) => {
    onApplyTemplate(template.widgets);
    setOpen(false);
    toast.success(`Applied "${template.name}" template`);
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-1">
          <FileText className="h-4 w-4" />
          <span>Templates</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Widget Templates</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4 py-2">
            {filteredTemplates.map((template) => (
              <div key={template.id} className="border rounded-lg p-4">
                <div className="flex justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">{template.name}</h3>
                    <p className="text-muted-foreground text-sm">{template.description}</p>
                  </div>
                  <Button 
                    onClick={() => handleApplyTemplate(template)}
                    className="h-8"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Apply
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {template.widgets.map(widget => {
                    const widgetDef = getAvailableWidgets(portalType).find(w => w.type === widget);
                    return widgetDef ? (
                      <div key={widget} className="bg-muted px-2 py-1 rounded text-xs flex items-center gap-1">
                        {widgetDef.name}
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        
        <div className="flex justify-end mt-4">
          <Button onClick={() => setOpen(false)}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WidgetTemplateLibrary;
