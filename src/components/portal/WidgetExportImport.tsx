
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { PortalWidget } from '@/types/portal-types';
import { FileJson, Copy, Upload, Download } from 'lucide-react';
import { useWidgetSettings } from '@/hooks/portal/useWidgetSettings';

interface WidgetExportImportProps {
  widgets: PortalWidget[];
  portalType: 'user' | 'association';
  onImportComplete: () => void;
}

const WidgetExportImport: React.FC<WidgetExportImportProps> = ({
  widgets,
  portalType,
  onImportComplete
}) => {
  const [open, setOpen] = useState(false);
  const [importData, setImportData] = useState('');
  const [exportData, setExportData] = useState('');
  const { saveWidgetSettings } = useWidgetSettings(portalType);
  
  const handleExport = () => {
    // Only export enabled widgets with their settings
    const exportableWidgets = widgets
      .filter(widget => widget.isEnabled)
      .map(widget => ({
        widgetType: widget.widgetType,
        settings: widget.settings,
        position: widget.position
      }));
    
    const exportString = JSON.stringify(exportableWidgets, null, 2);
    setExportData(exportString);
    toast.success('Widget configuration exported');
  };
  
  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(exportData);
    toast.success('Copied to clipboard');
  };
  
  const handleImport = async () => {
    try {
      const widgetData = JSON.parse(importData);
      
      if (!Array.isArray(widgetData)) {
        toast.error('Invalid import format. Expected an array of widgets.');
        return;
      }
      
      // Simple validation of each widget object
      for (const widget of widgetData) {
        if (!widget.widgetType || typeof widget.widgetType !== 'string') {
          toast.error('Invalid widget data: widgetType is required and must be a string');
          return;
        }
        
        if (!widget.settings || typeof widget.settings !== 'object') {
          toast.error('Invalid widget data: settings is required and must be an object');
          return;
        }
      }
      
      // Save each widget setting
      for (const widget of widgetData) {
        await saveWidgetSettings(widget.widgetType, widget.settings);
      }
      
      toast.success('Widget configuration imported successfully');
      setImportData('');
      setOpen(false);
      onImportComplete();
    } catch (error) {
      console.error('Error importing widgets:', error);
      toast.error('Failed to import widget configuration. Invalid JSON format.');
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-1">
          <FileJson className="h-4 w-4" />
          <span>Export/Import</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Export/Import Widget Configuration</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="export" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="export">Export</TabsTrigger>
            <TabsTrigger value="import">Import</TabsTrigger>
          </TabsList>
          
          <TabsContent value="export" className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Export your current widget configuration to share with others or save as a backup.
            </p>
            
            <Button onClick={handleExport} className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Generate Export Data
            </Button>
            
            {exportData && (
              <>
                <ScrollArea className="h-[200px] w-full border rounded-md p-4">
                  <pre className="text-xs">{exportData}</pre>
                </ScrollArea>
                
                <Button onClick={handleCopyToClipboard} variant="secondary" className="w-full">
                  <Copy className="h-4 w-4 mr-2" />
                  Copy to Clipboard
                </Button>
              </>
            )}
          </TabsContent>
          
          <TabsContent value="import" className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Import a widget configuration by pasting the JSON data below.
            </p>
            
            <Textarea 
              placeholder="Paste widget configuration JSON here..."
              className="font-mono text-xs min-h-[200px]"
              value={importData}
              onChange={(e) => setImportData(e.target.value)}
            />
            
            <Button 
              onClick={handleImport} 
              className="w-full"
              disabled={!importData}
            >
              <Upload className="h-4 w-4 mr-2" />
              Import Configuration
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default WidgetExportImport;
