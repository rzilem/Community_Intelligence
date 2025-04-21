
import React from 'react';
import { BarChart2, DollarSign } from 'lucide-react';
import DashboardWidget from '@/components/portal/DashboardWidget';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BaseWidgetProps } from '@/types/portal-types';

const data = [
  { month: 'Jan', income: 4000, expenses: 2400 },
  { month: 'Feb', income: 3000, expenses: 1398 },
  { month: 'Mar', income: 2000, expenses: 9800 },
  { month: 'Apr', income: 2780, expenses: 3908 },
  { month: 'May', income: 1890, expenses: 4800 },
  { month: 'Jun', income: 2390, expenses: 3800 }
];

interface FinancialChartWidgetProps extends BaseWidgetProps {}

const FinancialChartWidget: React.FC<FinancialChartWidgetProps> = ({ 
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
        chartType: 'bar',
        showLegend: true,
        ...settings
      });
    }
  };

  return (
    <DashboardWidget 
      title="Financial Overview" 
      widgetType="financial-chart"
      isLoading={isLoading}
      onSave={saveSettings ? handleSave : undefined}
      isSaving={isSaving}
      isDraggable={!!dragHandleProps}
      dragHandleProps={dragHandleProps}
    >
      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="income" fill="#8884d8" name="Income" />
            <Bar dataKey="expenses" fill="#82ca9d" name="Expenses" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="bg-green-50 p-2 rounded-md">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium">Total Income</span>
          </div>
          <p className="text-lg font-bold text-green-600">$16,060</p>
        </div>
        <div className="bg-red-50 p-2 rounded-md">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-red-600" />
            <span className="text-sm font-medium">Total Expenses</span>
          </div>
          <p className="text-lg font-bold text-red-600">$14,106</p>
        </div>
      </div>
    </DashboardWidget>
  );
};

export default FinancialChartWidget;
