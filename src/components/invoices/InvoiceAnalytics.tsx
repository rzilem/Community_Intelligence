
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { PieChart, BarChart } from '@/components/ui/chart';
import { Invoice } from '@/types/invoice-types';
import { Button } from '@/components/ui/button';

interface InvoiceAnalyticsProps {
  invoices: Invoice[];
}

const InvoiceAnalytics: React.FC<InvoiceAnalyticsProps> = ({ invoices }) => {
  // Color scheme configurations
  const colorSchemes = {
    blue: ['#2952ff', '#608cff', '#3b6aff', '#1e3a8a'],
    silver: ['#94a3b8', '#64748b', '#475569', '#334155'],
    green: ['#0d766d', '#299c94', '#42b7ae', '#6dd1c8'],
    default: ['#9b87f5', '#7E69AB', '#6E59A5', '#D6BCFA']
  };

  const [activeColorScheme, setActiveColorScheme] = useState<keyof typeof colorSchemes>('default');

  // Process data for charts
  const statusData = [
    { name: 'Pending', value: invoices.filter(i => i.status === 'pending').length },
    { name: 'Approved', value: invoices.filter(i => i.status === 'approved').length },
    { name: 'Rejected', value: invoices.filter(i => i.status === 'rejected').length },
    { name: 'Paid', value: invoices.filter(i => i.status === 'paid').length },
  ];

  // Group invoices by month and calculate total amount
  const monthlyTotals = invoices.reduce((acc: any, invoice) => {
    const month = new Date(invoice.invoice_date).toLocaleDateString('en-US', { month: 'short' });
    acc[month] = (acc[month] || 0) + invoice.amount;
    return acc;
  }, {});

  const trendData = Object.entries(monthlyTotals).map(([month, total]) => ({
    name: month,
    amount: Number(total),
  }));

  const colors = colorSchemes[activeColorScheme];

  return (
    <div>
      <div className="flex justify-end mb-4 space-x-2">
        {Object.keys(colorSchemes).map((scheme) => (
          <Button
            key={scheme}
            variant={activeColorScheme === scheme ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveColorScheme(scheme as keyof typeof colorSchemes)}
          >
            {scheme.charAt(0).toUpperCase() + scheme.slice(1)} Theme
          </Button>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">Invoice Status Distribution</h3>
          <div className="h-[300px]">
            <PieChart
              data={statusData}
              category="value"
              index="name"
              valueFormatter={(value) => `${value} invoices`}
              colors={colors}
            />
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">Monthly Invoice Amounts</h3>
          <div className="h-[300px]">
            <BarChart
              data={trendData}
              categories={['amount']}
              index="name"
              valueFormatter={(value) => `$${value.toLocaleString()}`}
              colors={[colors[0]]}
              showLegend={false}
            />
          </div>
        </Card>
      </div>
    </div>
  );
};

export default InvoiceAnalytics;
