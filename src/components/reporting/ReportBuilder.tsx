import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Plus, X, BarChart3, Download, Eye, Lightbulb } from 'lucide-react';
import { useReportBuilder } from '@/hooks/reporting/useReportBuilder';
import { ReportFilter, ReportColumn } from '@/types/reporting-types';

const ReportBuilder: React.FC = () => {
  const { isLoading, createReport, executeReport, getAIInsights } = useReportBuilder();
  const [reportName, setReportName] = useState('');
  const [reportType, setReportType] = useState<string>('');
  const [selectedDataSources, setSelectedDataSources] = useState<string[]>([]);
  const [filters, setFilters] = useState<ReportFilter[]>([]);
  const [columns, setColumns] = useState<ReportColumn[]>([]);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [aiInsights, setAiInsights] = useState<any>(null);

  const dataSources = [
    { value: 'residents', label: 'Residents' },
    { value: 'properties', label: 'Properties' },
    { value: 'assessments', label: 'Assessments' },
    { value: 'amenity_bookings', label: 'Amenity Bookings' },
    { value: 'maintenance_requests', label: 'Maintenance Requests' }
  ];

  const reportTypes = [
    { value: 'financial', label: 'Financial Report' },
    { value: 'compliance', label: 'Compliance Report' },
    { value: 'maintenance', label: 'Maintenance Report' },
    { value: 'resident', label: 'Resident Report' },
    { value: 'custom', label: 'Custom Report' }
  ];

  const addFilter = () => {
    const newFilter: ReportFilter = {
      field: '',
      operator: 'equals',
      value: '',
      data_type: 'string'
    };
    setFilters([...filters, newFilter]);
  };

  const removeFilter = (index: number) => {
    setFilters(filters.filter((_, i) => i !== index));
  };

  const addColumn = () => {
    const newColumn: ReportColumn = {
      field: '',
      label: '',
      type: 'text',
      data_type: 'string',
      is_visible: true
    };
    setColumns([...columns, newColumn]);
  };

  const removeColumn = (index: number) => {
    setColumns(columns.filter((_, i) => i !== index));
  };

  const handlePreviewReport = async () => {
    // Generate preview data
    const mockPreviewData = [
      { name: 'John Doe', property: '123 Main St', amount: 250.00, status: 'Paid' },
      { name: 'Jane Smith', property: '456 Oak Ave', amount: 275.00, status: 'Overdue' },
      { name: 'Bob Wilson', property: '789 Pine St', amount: 300.00, status: 'Paid' }
    ];
    setPreviewData(mockPreviewData);

    // Generate AI insights
    const insights = await getAIInsights(mockPreviewData);
    setAiInsights(insights);
  };

  const handleSaveReport = async () => {
    try {
      const reportData = {
        name: reportName,
        report_type: reportType as any,
        data_sources: selectedDataSources,
        filters,
        columns,
        association_id: 'demo-association-id' // This would come from context
      };

      await createReport(reportData);
      
      // Reset form
      setReportName('');
      setReportType('');
      setSelectedDataSources([]);
      setFilters([]);
      setColumns([]);
      setPreviewData([]);
      setAiInsights(null);
    } catch (error) {
      // Error handled in hook
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Advanced Report Builder
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="setup" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="setup">Setup</TabsTrigger>
              <TabsTrigger value="filters">Filters</TabsTrigger>
              <TabsTrigger value="columns">Columns</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>

            <TabsContent value="setup" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="report-name">Report Name</Label>
                  <Input
                    id="report-name"
                    value={reportName}
                    onChange={(e) => setReportName(e.target.value)}
                    placeholder="Enter report name..."
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="report-type">Report Type</Label>
                  <Select value={reportType} onValueChange={setReportType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select report type" />
                    </SelectTrigger>
                    <SelectContent>
                      {reportTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Data Sources</Label>
                <div className="flex flex-wrap gap-2">
                  {dataSources.map((source) => (
                    <Badge
                      key={source.value}
                      variant={selectedDataSources.includes(source.value) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => {
                        if (selectedDataSources.includes(source.value)) {
                          setSelectedDataSources(selectedDataSources.filter(s => s !== source.value));
                        } else {
                          setSelectedDataSources([...selectedDataSources, source.value]);
                        }
                      }}
                    >
                      {source.label}
                    </Badge>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="filters" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">Report Filters</h3>
                <Button onClick={addFilter} size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Filter
                </Button>
              </div>

              {filters.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No filters added yet. Click "Add Filter" to create one.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filters.map((filter, index) => (
                    <div key={index} className="flex gap-2 items-end p-3 border rounded-lg">
                      <div className="flex-1 space-y-2">
                        <Label>Field</Label>
                        <Input
                          value={filter.field}
                          onChange={(e) => {
                            const newFilters = [...filters];
                            newFilters[index].field = e.target.value;
                            setFilters(newFilters);
                          }}
                          placeholder="Field name"
                        />
                      </div>
                      <div className="w-32 space-y-2">
                        <Label>Operator</Label>
                        <Select
                          value={filter.operator}
                          onValueChange={(value) => {
                            const newFilters = [...filters];
                            newFilters[index].operator = value as any;
                            setFilters(newFilters);
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="equals">Equals</SelectItem>
                            <SelectItem value="contains">Contains</SelectItem>
                            <SelectItem value="greater_than">Greater Than</SelectItem>
                            <SelectItem value="less_than">Less Than</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex-1 space-y-2">
                        <Label>Value</Label>
                        <Input
                          value={filter.value}
                          onChange={(e) => {
                            const newFilters = [...filters];
                            newFilters[index].value = e.target.value;
                            setFilters(newFilters);
                          }}
                          placeholder="Filter value"
                        />
                      </div>
                      <Button
                        onClick={() => removeFilter(index)}
                        variant="outline"
                        size="sm"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="columns" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">Report Columns</h3>
                <Button onClick={addColumn} size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Column
                </Button>
              </div>

              {columns.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No columns added yet. Click "Add Column" to create one.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {columns.map((column, index) => (
                    <div key={index} className="flex gap-2 items-end p-3 border rounded-lg">
                      <div className="flex-1 space-y-2">
                        <Label>Field</Label>
                        <Input
                          value={column.field}
                          onChange={(e) => {
                            const newColumns = [...columns];
                            newColumns[index].field = e.target.value;
                            setColumns(newColumns);
                          }}
                          placeholder="Field name"
                        />
                      </div>
                      <div className="flex-1 space-y-2">
                        <Label>Label</Label>
                        <Input
                          value={column.label}
                          onChange={(e) => {
                            const newColumns = [...columns];
                            newColumns[index].label = e.target.value;
                            setColumns(newColumns);
                          }}
                          placeholder="Display label"
                        />
                      </div>
                      <div className="w-32 space-y-2">
                        <Label>Type</Label>
                        <Select
                          value={column.data_type}
                          onValueChange={(value) => {
                            const newColumns = [...columns];
                            newColumns[index].data_type = value as any;
                            setColumns(newColumns);
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="string">Text</SelectItem>
                            <SelectItem value="number">Number</SelectItem>
                            <SelectItem value="date">Date</SelectItem>
                            <SelectItem value="currency">Currency</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button
                        onClick={() => removeColumn(index)}
                        variant="outline"
                        size="sm"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="preview" className="space-y-4">
              <div className="flex gap-2">
                <Button onClick={handlePreviewReport} disabled={isLoading}>
                  <Eye className="h-4 w-4 mr-1" />
                  Generate Preview
                </Button>
                <Button onClick={handleSaveReport} disabled={!reportName || isLoading}>
                  Save Report
                </Button>
              </div>

              {previewData.length > 0 && (
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Preview Data</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse border border-gray-200">
                          <thead>
                            <tr className="bg-gray-50">
                              {Object.keys(previewData[0]).map((key) => (
                                <th key={key} className="border border-gray-200 px-4 py-2 text-left">
                                  {key}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {previewData.map((row, index) => (
                              <tr key={index}>
                                {Object.values(row).map((value, i) => (
                                  <td key={i} className="border border-gray-200 px-4 py-2">
                                    {String(value)}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>

                  {aiInsights && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Lightbulb className="h-5 w-5" />
                          AI Insights
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-2">Summary</h4>
                          <p className="text-sm text-muted-foreground">{aiInsights.summary}</p>
                        </div>

                        <Separator />

                        <div>
                          <h4 className="font-semibold mb-2">Key Trends</h4>
                          <ul className="list-disc pl-5 space-y-1">
                            {aiInsights.trends.map((trend: string, index: number) => (
                              <li key={index} className="text-sm">{trend}</li>
                            ))}
                          </ul>
                        </div>

                        <Separator />

                        <div>
                          <h4 className="font-semibold mb-2">Recommendations</h4>
                          <ul className="list-disc pl-5 space-y-1">
                            {aiInsights.recommendations.map((rec: string, index: number) => (
                              <li key={index} className="text-sm text-blue-600">{rec}</li>
                            ))}
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportBuilder;
