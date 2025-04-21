
import React, { useState, useEffect } from 'react';
import { Sparkles, BarChart, ArrowRight, RotateCw } from 'lucide-react';
import DashboardWidget from '@/components/portal/DashboardWidget';
import { BaseWidgetProps } from '@/types/portal-types';
import { Button } from '@/components/ui/button';
import { useWidgetAnalytics } from '@/hooks/portal/useWidgetAnalytics';

interface AIInsightsWidgetProps extends BaseWidgetProps {}

const AIInsightsWidget: React.FC<AIInsightsWidgetProps> = ({ 
  widgetId = 'analytics-widget', 
  saveSettings, 
  isLoading = false,
  isSaving = false,
  settings = {},
  dragHandleProps
}) => {
  const [insights, setInsights] = useState<string[]>([]);
  const [generatingInsight, setGeneratingInsight] = useState(false);
  const { trackAction } = useWidgetAnalytics(widgetId, 'analytics-widget');
  
  const defaultInsights = [
    "Based on amenity usage, pool bookings are 37% higher on weekends.",
    "Maintenance requests have decreased by 12% since implementing the preventative maintenance schedule.",
    "Financial trend analysis shows assessment collections are up 8% from last year.",
    "Community events with food have 45% higher attendance than other event types.",
    "Residents who use the online portal submit 64% fewer support tickets."
  ];
  
  useEffect(() => {
    // Load saved insights from settings or use defaults
    const savedInsights = settings.insights || defaultInsights;
    setInsights(savedInsights);
  }, [settings]);
  
  const handleSave = () => {
    if (saveSettings) {
      saveSettings({
        insights,
        lastUpdated: new Date().toISOString(),
        ...settings
      });
    }
  };
  
  const generateNewInsight = async () => {
    // Track this action for analytics
    await trackAction('generate_insight');
    
    setGeneratingInsight(true);
    
    // In a real implementation, this would call an AI service
    // For now, we'll simulate a delay and return a random insight
    setTimeout(() => {
      const newInsights = [
        "Residents who participated in community events are 58% more likely to volunteer for committees.",
        "Properties with landscaping violations tend to resolve them 3 days faster when notifications include helpful tips.",
        "Board meetings held in the evening have 26% higher attendance than morning meetings.",
        "Digital document access has reduced printing costs by approximately 32% year-over-year.",
        "HOA members who set up autopay have a 94% on-time payment rate versus 72% for manual payments."
      ];
      
      const randomInsight = newInsights[Math.floor(Math.random() * newInsights.length)];
      setInsights(prev => [randomInsight, ...prev.slice(0, 4)]);
      setGeneratingInsight(false);
    }, 1500);
  };
  
  return (
    <DashboardWidget 
      title="AI Community Insights" 
      widgetType="analytics-widget"
      isLoading={isLoading}
      onSave={saveSettings ? handleSave : undefined}
      isSaving={isSaving}
      isDraggable={!!dragHandleProps}
      dragHandleProps={dragHandleProps}
    >
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1 text-primary">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-medium">AI-powered analysis</span>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={generateNewInsight}
            disabled={generatingInsight}
            className="h-8"
          >
            {generatingInsight ? (
              <RotateCw className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 mr-1" />
            )}
            Generate Insight
          </Button>
        </div>
        
        <div className="space-y-3">
          {insights.map((insight, i) => (
            <div key={i} className="bg-primary/5 rounded-md p-3 relative">
              <div className="flex items-start gap-2">
                <BarChart className={`h-5 w-5 mt-0.5 ${i === 0 ? 'text-primary' : 'text-muted-foreground'}`} />
                <div>
                  <p className={`text-sm ${i === 0 ? 'font-medium' : ''}`}>{insight}</p>
                  {i === 0 && (
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-xs text-primary font-medium">New insight</span>
                      <div className="h-1.5 w-1.5 bg-primary rounded-full animate-pulse"></div>
                    </div>
                  )}
                </div>
              </div>
              {i === 0 && <div className="absolute top-0 right-0 w-2 h-2 bg-primary rounded-full transform -translate-y-1/2 translate-x-1/2"></div>}
            </div>
          ))}
        </div>
        
        <Button variant="link" className="text-xs h-6 p-0" onClick={() => trackAction('view_all_insights')}>
          View all insights
          <ArrowRight className="h-3 w-3 ml-1" />
        </Button>
      </div>
    </DashboardWidget>
  );
};

export default AIInsightsWidget;
