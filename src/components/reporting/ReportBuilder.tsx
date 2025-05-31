
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, Play, Save, Trash2, Filter } from 'lucide-react';
import { useReportBuilder } from '@/hooks/reporting/useReportBuilder';
import { ReportDefinition, ReportFilter, ReportColumn } from '@/types/reporting-types';

interface ReportBuilderProps {
  onReportCreated?: (report: ReportDefinition) => void;
  className?: string;
}

const ReportBuilder: React.FC<ReportBuilderProps> = ({
  onReportCreated,
  className
}) => {
  const [reportName, setReportName] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [reportType, setReportType] = useState<string>('');
  const [dataSources, setDataSources] = useState<string[]>([]);
  const [filters, setFilters] = useState<ReportFilter[]>([]);
  const [columns, setColumns] = useState<ReportColumn[]>([]);
  
  const { createReport, executeReport, isLoading } = useReportBuilder();

  const availableDataSources = [
    { value: 'assessments', label: 'Assessments' },
    { value: 'properties', label: 'Properties' },
    { value: 'residents', label: 'Residents' },
    { value: 'payments', label: 'Payments' },
    { value: 'violations', label: 'Violations' },
    { value: 'maintenance_requests', label: 'Maintenance Requests' }
  ];

  const reportTypes = [
    { value: 'financial', label: 'Financial Report' },
    { value: 'compliance', label: 'Compliance Report' },
    { value: 'maintenance', label: 'Maintenance Report' },
    { value: 'resident', label: 'Resident Report' },
    { value: 'custom', label: 'Custom Report' }
  ];

  const addDataSource = (source: string) => {
    if (!dataSources.includes(source)) {
      setDataSources([...dataSources, source]);
    }
  };

  const removeDataSource = (source: string) => {
    setDataSources(dataSources.filter(s => s !== source));
  };

  const addFilter = () => {
    setFilters([...filters, {
      field: '',
      operator: 'equals',
      value: '',
      data_type: 'string'
    }]);
  };

  const updateFilter = (index: number, updates: Partial<ReportFilter>) => {
    const newFilters = [...filters];
    newFilters[index] = { ...newFilters[index], ...updates };
    setFilters(newFilters);
  };

  const removeFilter = (index: number) => {
    setFilters(filters.filter((_, i) => i !== index));
  };

  const addColumn = () => {
    setColumns([...columns, {
      field: '',
      label: '',
      data_type: 'string',
      is_visible: true
    }]);
  };

  const updateColumn = (index: number, updates: Partial<ReportColumn>) => {
    const newColumns = [...columns];
    newColumns[index] = { ...newColumns[index], ...updates };
    setColumns(newColumns);
  };

  const removeColumn = (index: number) => {
    setColumns(columns.filter((_, i) => i !== index));
  };

  const handleCreateReport = async () => {
    if (!reportName || !reportType || dataSources.length === 0) {
      return;
    }

    const reportData: Partial<ReportDefinition> = {
      name: reportName,
      description: reportDescription,
      report_type: reportType as any,
      data_sources: dataSources,
      filters,
      grouping: [],
      columns,
      is_active: true,
      created_by: 'current-user' // This should come from auth context
    };

    const result = await createReport(reportData);
    if (result.success && result.data) {
      onReportCreated?.(result.data);
      // Reset form
      setReportName('');
      setReportDescription('');
      setReportType('');
      setDataSources([]);
      setFilters([]);
      setColumns([]);
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Report Builder
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="report-name">Report Name</Label>
              <Input
                id="report-name"
                value={reportName}
                onChange={(e) => setReportName(e.target.value)}
                placeholder="Enter report name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="report-type">Report Type</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  {reportTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="report-description">Description</Label>
            <Textarea
              id="report-description"
              value={reportDescription}
              onChange={(e) => setReportDescription(e.target.value)}
              placeholder="Enter report description"
            />
          </div>

          {/* Data Sources */}
          <div className="space-y-3">
            <Label>Data Sources</Label>
            <div className="flex flex-wrap gap-2 mb-3">
              {dataSources.map(source => (
                <Badge key={source} variant="secondary" className="flex items-center gap-1">
                  {availableDataSources.find(s => s.value === source)?.label}
                  <button
                    onClick={() => removeDataSource(source)}
                    className="ml-1 text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
            <Select onValueChange={addDataSource}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Add data source" />
              </SelectTrigger>
              <SelectContent>
                {availableDataSources
                  .filter(source => !dataSources.includes(source.value))
                  .map(source => (
                    <SelectItem key={source.value} value={source.value}>
                      {source.label}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filters */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Filters</Label>
              <Button size="sm" variant="outline" onClick={addFilter}>
                <Plus className="h-4 w-4 mr-1" />
                Add Filter
              </Button>
            </div>
            
            {filters.map((filter, index) => (
              <div key={index} className="grid grid-cols-12 gap-2 items-end">
                <div className="col-span-3">
                  <Input
                    placeholder="Field name"
                    value={filter.field}
                    onChange={(e) => updateFilter(index, { field: e.target.value })}
                  />
                </div>
                <div className="col-span-3">
                  <Select
                    value={filter.operator}
                    onValueChange={(value) => updateFilter(index, { operator: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="equals">Equals</SelectItem>
                      <SelectItem value="contains">Contains</SelectItem>
                      <SelectItem value="greater_than">Greater than</SelectItem>
                      <SelectItem value="less_than">Less than</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-4">
                  <Input
                    placeholder="Value"
                    value={filter.value}
                    onChange={(e) => updateFilter(index, { value: e.target.value })}
                  />
                </div>
                <div className="col-span-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => removeFilter(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Columns */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Columns</Label>
              <Button size="sm" variant="outline" onClick={addColumn}>
                <Plus className="h-4 w-4 mr-1" />
                Add Column
              </Button>
            </div>
            
            {columns.map((column, index) => (
              <div key={index} className="grid grid-cols-12 gap-2 items-end">
                <div className="col-span-4">
                  <Input
                    placeholder="Field name"
                    value={column.field}
                    onChange={(e) => updateColumn(index, { field: e.target.value })}
                  />
                </div>
                <div className="col-span-4">
                  <Input
                    placeholder="Display label"
                    value={column.label}
                    onChange={(e) => updateColumn(index, { label: e.target.value })}
                  />
                </div>
                <div className="col-span-2">
                  <Select
                    value={column.data_type}
                    onValueChange={(value) => updateColumn(index, { data_type: value as any })}
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
                <div className="col-span-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => removeColumn(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleCreateReport}
              disabled={isLoading || !reportName || !reportType || dataSources.length === 0}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              Create Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportBuilder;
