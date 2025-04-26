
import React from 'react';
import { Card } from '@/components/ui/card';
import { 
  BarChart, 
  LineChart,
} from '@/components/ui/chart';
import { Invoice } from '@/types/invoice-types';

interface InvoiceAnalyticsProps {
  invoices: Invoice[];
}

const InvoiceAnalytics: React.FC<InvoiceAnalyticsProps> = ({ invoices }) => {
  // Process data for charts
  const statusData = [
    { name: 'Pending', count: invoices.filter(i => i.status === 'pending').length },
    { name: 'Approved', count: invoices.filter(i => i.status === 'approved').length },
    { name: 'Rejected', count: invoices.filter(i => i.status === 'rejected').length },
    { name: 'Paid', count: invoices.filter(i => i.status === 'paid').length },
  ];

  // Group invoices by month for trend analysis
  const monthlyTotals = invoices.reduce((acc: any, invoice) => {
    const month = new Date(invoice.invoice_date).toLocaleDateString('en-US', { month: 'short' });
    acc[month] = (acc[month] || 0) + invoice.amount;
    return acc;
  }, {});

  const trendData = Object.entries(monthlyTotals).map(([month, total]) => ({
    month,
    total: Number(total),
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Invoice Status Distribution</h3>
        <div className="h-[300px]">
          <BarChart
            data={statusData}
            categories={['count']}
            index="name"
            valueFormatter={(value) => `${value} invoices`}
            showLegend={false}
          />
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Monthly Invoice Trends</h3>
        <div className="h-[300px]">
          <LineChart
            data={trendData}
            categories={['total']}
            index="month"
            valueFormatter={(value) => `$${value.toLocaleString()}`}
            showLegend={false}
          />
        </div>
      </Card>
    </div>
  );
};

export default InvoiceAnalytics;
