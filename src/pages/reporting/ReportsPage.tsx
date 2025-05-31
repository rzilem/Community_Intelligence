
import React, { useState, useEffect } from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { BarChart3, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ReportBuilder from '@/components/reporting/ReportBuilder';
import { useReportBuilder } from '@/hooks/reporting/useReportBuilder';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

const ReportsPage: React.FC = () => {
  const [showBuilder, setShowBuilder] = useState(false);
  const { reports, fetchReports, executeReport, isLoading, executionResults } = useReportBuilder();

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleExecuteReport = async (reportId: string) => {
    const result = await executeReport(reportId);
    if (result.success) {
      console.log('Report executed successfully:', result.data);
    }
  };

  const getReportTypeColor = (type: string) => {
    switch (type) {
      case 'financial': return 'bg-green-500';
      case 'compliance': return 'bg-yellow-500';
      case 'maintenance': return 'bg-blue-500';
      case 'resident': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <PageTemplate
      title="Advanced Reports"
      icon={<BarChart3 className="h-8 w-8" />}
      description="Create and manage custom reports with AI insights"
    >
      <div className="space-y-6">
        <Tabs defaultValue="reports" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="reports">My Reports</TabsTrigger>
            <TabsTrigger value="builder">Report Builder</TabsTrigger>
            <TabsTrigger value="insights">AI Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="reports" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Reports Dashboard</h2>
              <Button onClick={() => setShowBuilder(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Report
              </Button>
            </div>

            {reports.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium mb-2">No Reports Yet</h3>
                  <p className="text-gray-600 mb-4">Create your first custom report to get started</p>
                  <Button onClick={() => setShowBuilder(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Report
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reports.map((report) => (
                  <Card key={report.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{report.name}</CardTitle>
                        <Badge className={`${getReportTypeColor(report.report_type)} text-white`}>
                          {report.report_type}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {report.description && (
                        <p className="text-sm text-gray-600">{report.description}</p>
                      )}
                      
                      <div className="space-y-2 text-xs text-gray-500">
                        <div>Data Sources: {report.data_sources.join(', ')}</div>
                        <div>Filters: {report.filters.length}</div>
                        <div>Columns: {report.columns.length}</div>
                        <div>Created: {format(new Date(report.created_at), 'MMM d, yyyy')}</div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() => handleExecuteReport(report.id)}
                          disabled={isLoading}
                        >
                          {isLoading ? 'Running...' : 'Run Report'}
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1">
                          Edit
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {executionResults && (
              <Card>
                <CardHeader>
                  <CardTitle>Report Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-sm text-gray-600">
                      Generated {executionResults.length} rows
                    </div>
                    
                    {executionResults.length > 0 && (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b">
                              {Object.keys(executionResults[0]).slice(0, 5).map(key => (
                                <th key={key} className="text-left p-2">{key}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {executionResults.slice(0, 10).map((row: any, index: number) => (
                              <tr key={index} className="border-b">
                                {Object.values(row).slice(0, 5).map((value: any, cellIndex) => (
                                  <td key={cellIndex} className="p-2">
                                    {typeof value === 'object' ? JSON.stringify(value) : String(value).slice(0, 50)}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="builder" className="space-y-6">
            <ReportBuilder
              onReportCreated={(report) => {
                setShowBuilder(false);
                fetchReports(); // Refresh reports list
              }}
            />
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>AI-Powered Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <BarChart3 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>AI insights and anomaly detection coming soon...</p>
                  <p className="text-xs mt-2">This will analyze your data patterns and provide intelligent recommendations</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageTemplate>
  );
};

export default ReportsPage;
