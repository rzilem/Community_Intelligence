
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import DashboardWidget from '@/components/portal/DashboardWidget';
import { BaseWidgetProps } from '@/types/portal-types';

interface DelinquentAccountsWidgetProps extends BaseWidgetProps {}

const DelinquentAccountsWidget: React.FC<DelinquentAccountsWidgetProps> = ({ 
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
        showAmount: true,
        daysOverdue: 30,
        ...settings
      });
    }
  };

  const delinquents = [
    { name: 'John Smith', amount: 750, daysOverdue: 45 },
    { name: 'Maria Garcia', amount: 950, daysOverdue: 60 },
    { name: 'Robert Chen', amount: 325, daysOverdue: 30 },
    { name: 'Sarah Johnson', amount: 1200, daysOverdue: 90 }
  ];

  return (
    <DashboardWidget 
      title="Delinquent Accounts" 
      widgetType="delinquent-accounts"
      isLoading={isLoading}
      onSave={saveSettings ? handleSave : undefined}
      isSaving={isSaving}
      isDraggable={!!dragHandleProps}
      dragHandleProps={dragHandleProps}
    >
      <div className="space-y-4">
        <div className="flex justify-between">
          <span className="text-sm font-medium text-muted-foreground">Account</span>
          <span className="text-sm font-medium text-muted-foreground">Amount Overdue</span>
        </div>
        {delinquents.map((account, i) => (
          <div key={i} className="flex justify-between items-center border-b pb-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className={`h-4 w-4 ${account.daysOverdue >= 60 ? 'text-red-500' : 'text-amber-500'}`} />
              <span>{account.name}</span>
            </div>
            <span className="font-semibold">${account.amount}</span>
          </div>
        ))}
        <div className="mt-2 flex justify-between font-bold text-muted-foreground">
          <span>Total Overdue:</span>
          <span>$3,225</span>
        </div>
        <button className="w-full bg-primary text-white py-2 px-4 rounded mt-2">
          View All Accounts
        </button>
      </div>
    </DashboardWidget>
  );
};

export default DelinquentAccountsWidget;
