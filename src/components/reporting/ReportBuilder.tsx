
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, FileText, Play } from 'lucide-react';
import { useReportBuilder } from '@/hooks/reporting/useReportBuilder';

const ReportBuilder: React.FC = () => {
  const { reports, isLoading, executeReport } = useReportBuilder();
  const [executingReport, setExecutingReport] = useState<string | null>(null);

  const handleExecuteReport = async (reportId: string) => {
    setExecutingReport(reportId);
    try {
      await executeReport(reportId);
    } finally {
      setExecutingReport(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <BarChart3 className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Report Builder</h1>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Available Reports</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-4">Loading reports...</div>
            ) : (
              <div className="space-y-3">
                {reports.map((report) => (
                  <div key={report.id} className="flex items-center justify-between p-4 border rounded">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5" />
                      <div>
                        <h3 className="font-medium">{report.name}</h3>
                        <p className="text-sm text-muted-foreground">{report.description}</p>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleExecuteReport(report.id)}
                      disabled={executingReport === report.id}
                      size="sm"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      {executingReport === report.id ? 'Running...' : 'Execute'}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReportBuilder;
