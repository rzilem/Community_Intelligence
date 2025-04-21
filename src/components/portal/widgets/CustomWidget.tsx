
import React from 'react';
import DashboardWidget from '@/components/portal/DashboardWidget';
import { BaseWidgetProps } from '@/types/portal-types';
import { useWidgetAnalytics } from '@/hooks/portal/useWidgetAnalytics';

interface CustomWidgetProps extends BaseWidgetProps {}

const CustomWidget: React.FC<CustomWidgetProps> = ({ 
  widgetId = 'custom-widget', 
  saveSettings, 
  isLoading = false,
  isSaving = false,
  settings = {},
  dragHandleProps
}) => {
  const { trackAction } = useWidgetAnalytics(widgetId, 'custom-widget');
  
  const handleSave = () => {
    if (saveSettings) {
      saveSettings({
        ...settings,
        lastSaved: new Date().toISOString()
      });
    }
  };
  
  // Parse content as HTML - in a real app, you would sanitize this
  const renderContent = () => {
    if (!settings.content) {
      return (
        <div className="h-full flex items-center justify-center text-muted-foreground">
          No content defined for this widget
        </div>
      );
    }
    
    // For security in a real app, you would use DOMPurify or similar
    return (
      <div 
        dangerouslySetInnerHTML={{ __html: settings.content }} 
        style={{
          height: settings.height ? `${settings.height}px` : 'auto',
          backgroundColor: settings.backgroundColor || 'transparent',
          color: settings.textColor || 'inherit',
          padding: '16px',
          overflow: 'auto',
          borderRadius: '4px'
        }}
        onClick={() => trackAction('content_click')}
      />
    );
  };
  
  return (
    <DashboardWidget 
      title={settings.title || 'Custom Widget'} 
      widgetType="custom-widget"
      isLoading={isLoading}
      onSave={saveSettings ? handleSave : undefined}
      isSaving={isSaving}
      isDraggable={!!dragHandleProps}
      dragHandleProps={dragHandleProps}
    >
      {renderContent()}
    </DashboardWidget>
  );
};

export default CustomWidget;
