import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import PageTemplate from '@/components/layout/PageTemplate';
import { FileText } from 'lucide-react';
import { useTrialBalance } from '@/hooks/accounting/useTrialBalance';
import { Button } from '@/components/ui/button';

function toCSV(rows: any[]): string {
  if (!rows || rows.length === 0) return '';
  const headers = Array.from(new Set(rows.flatMap((r) => Object.keys(r))));
  const escape = (v: any) => {
    const s = v === null || v === undefined ? '' : String(v);
    return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [headers.join(',')].concat(rows.map((r) => headers.map((h) => escape((r as any)[h])).join(',')));
  return lines.join('\n');
}

const TrialBalancePage: React.FC = () => {
  const { data, isLoading } = useTrialBalance();

  const handleExport = () => {
    const csv = toCSV(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'trial-balance.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AppLayout>
      <PageTemplate
        title="Trial Balance"
        icon={<FileText className="h-8 w-8" />}
        description="View and export the trial balance for the selected association"
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

export default TrialBalancePage;
