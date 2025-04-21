
import React from 'react';
import { FileText } from 'lucide-react';
import DashboardWidget from '@/components/portal/DashboardWidget';
import { BaseWidgetProps } from '@/types/portal-types';

interface UpcomingBidsWidgetProps extends BaseWidgetProps {}

const UpcomingBidsWidget: React.FC<UpcomingBidsWidgetProps> = ({ 
  widgetId, 
  saveSettings, 
  isLoading = false,
  isSaving = false,
  settings = {},
  dragHandleProps
}) => {
  const handleSave = () => {
    if (saveSettings) {
      saveSettings({
        sortBy: 'dueDate',
        filter: 'all',
        ...settings
      });
    }
  };

  const bids = [
    { title: 'Landscape Maintenance Contract', association: 'Oakridge HOA', dueDate: 'Jun 10, 2023', budget: '$5,000' },
    { title: 'Pool Cleaning Services', association: 'Sunset Towers', dueDate: 'Jun 15, 2023', budget: '$2,500' },
    { title: 'Security System Upgrade', association: 'Pine Valley HOA', dueDate: 'Jun 22, 2023', budget: '$8,750' }
  ];

  return (
    <DashboardWidget 
      title="Upcoming Bid Opportunities" 
      widgetType="upcoming-bids"
      isLoading={isLoading}
      onSave={saveSettings ? handleSave : undefined}
      isSaving={isSaving}
      isDraggable={!!dragHandleProps}
      dragHandleProps={dragHandleProps}
    >
      <div className="space-y-4">
        {bids.map((bid, i) => (
          <div key={i} className="border rounded-md p-3">
            <div className="flex justify-between mb-1">
              <h4 className="font-semibold">{bid.title}</h4>
              <span className="text-sm bg-primary/10 text-primary px-2 py-0.5 rounded">New</span>
            </div>
            <p className="text-sm text-muted-foreground">{bid.association}</p>
            <div className="flex justify-between mt-2 text-sm">
              <span>Due: {bid.dueDate}</span>
              <span className="font-medium">Est. Budget: {bid.budget}</span>
            </div>
          </div>
        ))}
        <button className="w-full bg-primary text-white py-2 px-4 rounded mt-2">
          View All Opportunities
        </button>
      </div>
    </DashboardWidget>
  );
};

export default UpcomingBidsWidget;
