import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import PageTemplate from '@/components/layout/PageTemplate';
import { TrendingUp } from 'lucide-react';
import { useIncomeStatement } from '@/hooks/accounting/useIncomeStatement';
import { Button } from '@/components/ui/button';

import { toCSV } from '@/utils/csv';

const IncomeStatementPage: React.FC = () => {
  const { data, isLoading } = useIncomeStatement();

  const handleExport = () => {
    const csv = toCSV(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'income-statement.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AppLayout>
      <PageTemplate
        title="Income Statement"
        icon={<TrendingUp className="h-8 w-8" />}
        description="Revenue, expenses, and net income for the selected association"
      >
        <div className="flex justify-end mb-4">
          <Button onClick={handleExport} disabled={isLoading}>Export CSV</Button>
        </div>
        <div className="overflow-auto border rounded-md">
          <table className="min-w-full text-sm">
            <thead>
              <tr>
                {data[0] && Object.keys(data[0]).map((key) => (
                  <th key={key} className="px-3 py-2 text-left font-semibold">{key}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td className="px-3 py-2">Loading...</td></tr>
              ) : (
                data.map((row, idx) => (
                  <tr key={idx} className="border-t">
                    {Object.keys(data[0] || {}).map((key) => (
                      <td key={key} className="px-3 py-2">{String((row as any)[key] ?? '')}</td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </PageTemplate>
    </AppLayout>
  );
};

export default IncomeStatementPage;
