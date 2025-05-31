
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { WidgetLibrary } from './WidgetLibrary';
import { DragDropEditor } from './DragDropEditor';
import { BrandingCustomizer } from './BrandingCustomizer';
import { Widget, PortalSettings, BrandingSettings, WidgetType } from '@/types/portal-types';
import { Layout, Smartphone, Eye, Save, Undo, Redo } from 'lucide-react';

const PortalBuilder: React.FC = () => {
  const [portalSettings, setPortalSettings] = useState<PortalSettings>({
    id: 'portal-1',
    hoaId: 'hoa-1',
    name: 'Main Resident Portal',
    widgets: [],
    branding: {
      primaryColor: '#3B82F6',
      secondaryColor: '#6B7280',
      accentColor: '#10B981',
      fontFamily: 'Inter',
      fontSize: 14,
      borderRadius: 8
    },
    layout: 'modern-dashboard',
    version: 1,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'user-1'
  });

  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isMobilePreview, setIsMobilePreview] = useState(false);
  const [history, setHistory] = useState<PortalSettings[]>([portalSettings]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const addToHistory = (newSettings: PortalSettings) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newSettings);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setPortalSettings(history[historyIndex - 1]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setPortalSettings(history[historyIndex + 1]);
    }
  };

  const addWidget = (type: WidgetType) => {
    const newWidget: Widget = {
      id: `widget-${Date.now()}`,
      type,
      title: `${type.charAt(0).toUpperCase() + type.slice(1)} Widget`,
      settings: {
        displayMode: 'detailed',
        refreshInterval: 300
      },
      permissions: {
        viewRoles: ['resident', 'admin'],
        editRoles: ['admin'],
        deleteRoles: ['admin']
      },
      gridPosition: {
        x: 0,
        y: 0,
        w: 4,
        h: 3,
        minW: 2,
        minH: 2
      },
      isActive: true
    };

    const updatedSettings = {
      ...portalSettings,
      widgets: [...portalSettings.widgets, newWidget],
      updatedAt: new Date()
    };

    setPortalSettings(updatedSettings);
    addToHistory(updatedSettings);
  };

  const updateWidget = (widgetId: string, updates: Partial<Widget>) => {
    const updatedSettings = {
      ...portalSettings,
      widgets: portalSettings.widgets.map(widget =>
        widget.id === widgetId ? { ...widget, ...updates } : widget
      ),
      updatedAt: new Date()
    };

    setPortalSettings(updatedSettings);
    addToHistory(updatedSettings);
  };

  const deleteWidget = (widgetId: string) => {
    const updatedSettings = {
      ...portalSettings,
      widgets: portalSettings.widgets.filter(widget => widget.id !== widgetId),
      updatedAt: new Date()
    };

    setPortalSettings(updatedSettings);
    addToHistory(updatedSettings);
  };

  const updateBranding = (brandingUpdates: Partial<BrandingSettings>) => {
    const updatedSettings = {
      ...portalSettings,
      branding: { ...portalSettings.branding, ...brandingUpdates },
      updatedAt: new Date()
    };

    setPortalSettings(updatedSettings);
    addToHistory(updatedSettings);
  };

  const handleLayoutChange = (layout: any[]) => {
    const updatedSettings = {
      ...portalSettings,
      widgets: portalSettings.widgets.map(widget => {
        const layoutItem = layout.find(item => item.i === widget.id);
        return layoutItem
          ? {
              ...widget,
              gridPosition: {
                ...widget.gridPosition,
                x: layoutItem.x,
                y: layoutItem.y,
                w: layoutItem.w,
                h: layoutItem.h
              }
            }
          : widget;
      }),
      updatedAt: new Date()
    };

    setPortalSettings(updatedSettings);
  };

  const savePortal = () => {
    console.log('Saving portal settings:', portalSettings);
    // Here you would save to Supabase
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Portal Builder</h1>
            <p className="text-gray-600">Customize your HOA resident portal</p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={undo}
              disabled={historyIndex === 0}
            >
              <Undo className="h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={redo}
              disabled={historyIndex === history.length - 1}
            >
              <Redo className="h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsMobilePreview(!isMobilePreview)}
            >
              <Smartphone className="h-4 w-4 mr-1" />
              {isMobilePreview ? 'Desktop' : 'Mobile'}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPreviewMode(!isPreviewMode)}
            >
              <Eye className="h-4 w-4 mr-1" />
              {isPreviewMode ? 'Edit' : 'Preview'}
            </Button>
            
            <Button onClick={savePortal}>
              <Save className="h-4 w-4 mr-1" />
              Save Portal
            </Button>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar */}
        {!isPreviewMode && (
          <div className="w-80 bg-white border-r overflow-y-auto">
            <Tabs defaultValue="widgets" className="h-full">
              <TabsList className="w-full">
                <TabsTrigger value="widgets" className="flex-1">
                  <Layout className="h-4 w-4 mr-1" />
                  Widgets
                </TabsTrigger>
                <TabsTrigger value="branding" className="flex-1">
                  Branding
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="widgets" className="p-4 space-y-4">
                <WidgetLibrary onAddWidget={addWidget} />
                
                {portalSettings.widgets.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Active Widgets</h4>
                    {portalSettings.widgets.map(widget => (
                      <div key={widget.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm">{widget.title}</span>
                        <Badge variant={widget.isActive ? 'default' : 'secondary'}>
                          {widget.isActive ? 'Active' : 'Hidden'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="branding" className="p-4">
                <BrandingCustomizer
                  branding={portalSettings.branding}
                  onBrandingChange={updateBranding}
                />
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* Main Editor */}
        <div className="flex-1 overflow-hidden">
          <div className={`h-full ${isMobilePreview ? 'flex justify-center items-start pt-8' : ''}`}>
            <div className={`${isMobilePreview ? 'w-80 border rounded-lg shadow-lg bg-white' : 'w-full h-full'}`}>
              <DragDropEditor
                widgets={portalSettings.widgets}
                onLayoutChange={handleLayoutChange}
                onWidgetUpdate={updateWidget}
                onWidgetDelete={deleteWidget}
                isPreviewMode={isPreviewMode}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortalBuilder;
