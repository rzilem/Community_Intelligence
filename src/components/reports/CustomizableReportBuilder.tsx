
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, BarChart2, Download, Settings, Copy, Plus, Eye, Save, Clock } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useResponsive } from '@/hooks/use-responsive';

interface ReportField {
  id: string;
  name: string;
  selected: boolean;
  group?: string;
}

interface ReportFilter {
  field: string;
  operator: string;
  value: string;
}

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: string;
  fields: ReportField[];
  filters: ReportFilter[];
  lastRun?: string;
  schedule?: string;
}

const CustomizableReportBuilder: React.FC = () => {
  const { isMobile } = useResponsive();
  const [activeTab, setActiveTab] = useState('fields');
  const [reportType, setReportType] = useState('financial');
  const [reportName, setReportName] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [savedTemplates, setSavedTemplates] = useState<ReportTemplate[]>([
    {
      id: '1', 
      name: 'Monthly Financial Summary', 
      description: 'Overview of monthly financials',
      type: 'financial',
      fields: [],
      filters: [],
      lastRun: '2025-04-10',
      schedule: 'Monthly'
    },
    {
      id: '2', 
      name: 'Delinquency Report', 
      description: 'Report on late payments',
      type: 'financial',
      fields: [],
      filters: [],
      lastRun: '2025-04-05',
      schedule: 'Weekly'
    }
  ]);

  // Sample field groups for different report types
  const fieldGroups: Record<string, ReportField[]> = {
    financial: [
      { id: 'f1', name: 'Total Income', selected: true, group: 'Income' },
      { id: 'f2', name: 'Assessment Income', selected: true, group: 'Income' },
      { id: 'f3', name: 'Other Income', selected: false, group: 'Income' },
      { id: 'f4', name: 'Total Expenses', selected: true, group: 'Expenses' },
      { id: 'f5', name: 'Administrative Expenses', selected: true, group: 'Expenses' },
      { id: 'f6', name: 'Maintenance Expenses', selected: false, group: 'Expenses' },
      { id: 'f7', name: 'Net Income', selected: true, group: 'Summary' },
      { id: 'f8', name: 'Operating Fund Balance', selected: true, group: 'Funds' },
      { id: 'f9', name: 'Reserve Fund Balance', selected: true, group: 'Funds' },
    ],
    compliance: [
      { id: 'c1', name: 'Violation Count', selected: true, group: 'Violations' },
      { id: 'c2', name: 'Violation Type', selected: true, group: 'Violations' },
      { id: 'c3', name: 'Property Information', selected: true, group: 'Property' },
      { id: 'c4', name: 'Homeowner Name', selected: true, group: 'Homeowner' },
      { id: 'c5', name: 'Resolution Status', selected: true, group: 'Status' },
      { id: 'c6', name: 'Days Outstanding', selected: false, group: 'Status' },
    ],
    maintenance: [
      { id: 'm1', name: 'Request Count', selected: true, group: 'General' },
      { id: 'm2', name: 'Request Type', selected: true, group: 'General' },
      { id: 'm3', name: 'Average Resolution Time', selected: true, group: 'Performance' },
      { id: 'm4', name: 'Vendor Information', selected: false, group: 'Vendor' },
      { id: 'm5', name: 'Cost per Request', selected: false, group: 'Financial' },
    ]
  };

  const [selectedFields, setSelectedFields] = useState<ReportField[]>(fieldGroups.financial);
  const [filters, setFilters] = useState<ReportFilter[]>([
    { field: 'date', operator: 'between', value: 'Last 30 days' }
  ]);

  const handleReportTypeChange = (type: string) => {
    setReportType(type);
    setSelectedFields(fieldGroups[type] || []);
  };

  const toggleFieldSelection = (fieldId: string) => {
    setSelectedFields(prevFields =>
      prevFields.map(field => 
        field.id === fieldId ? { ...field, selected: !field.selected } : field
      )
    );
  };

  const addFilter = () => {
    setFilters([...filters, { field: '', operator: 'equals', value: '' }]);
  };

  const removeFilter = (index: number) => {
    setFilters(filters.filter((_, i) => i !== index));
  };

  const updateFilter = (index: number, key: keyof ReportFilter, value: string) => {
    setFilters(prevFilters => 
      prevFilters.map((filter, i) => 
        i === index ? { ...filter, [key]: value } : filter
      )
    );
  };

  const handleGenerateReport = () => {
    setIsGenerating(true);
    // Simulate report generation
    setTimeout(() => {
      setIsGenerating(false);
    }, 2000);
  };

  const saveTemplate = () => {
    if (!reportName) return;
    
    const newTemplate: ReportTemplate = {
      id: Date.now().toString(),
      name: reportName,
      description: `Custom ${reportType} report`,
      type: reportType,
      fields: selectedFields,
      filters: filters
    };
    
    setSavedTemplates([...savedTemplates, newTemplate]);
    setReportName('');
  };

  return (
    <div className={`space-y-6 ${isMobile ? '' : 'p-6'}`}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Report Builder</h2>
          <p className="text-muted-foreground">Create custom reports from your community data</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={handleGenerateReport}
            disabled={isGenerating}
            className="flex items-center gap-2"
          >
            {isGenerating ? (
              <>
                <Clock className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Eye className="h-4 w-4" />
                Generate Report
              </>
            )}
          </Button>
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={saveTemplate}
            disabled={!reportName}
          >
            <Save className="h-4 w-4" />
            Save Template
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Report Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="report-type">Report Type</Label>
                    <Select value={reportType} onValueChange={handleReportTypeChange}>
                      <SelectTrigger id="report-type">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="financial">Financial Report</SelectItem>
                        <SelectItem value="compliance">Compliance Report</SelectItem>
                        <SelectItem value="maintenance">Maintenance Report</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="report-name">Report Name</Label>
                    <Input 
                      id="report-name" 
                      placeholder="Enter report name" 
                      value={reportName} 
                      onChange={(e) => setReportName(e.target.value)} 
                    />
                  </div>
                </div>
                
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid grid-cols-2 w-full">
                    <TabsTrigger value="fields">Fields</TabsTrigger>
                    <TabsTrigger value="filters">Filters</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="fields" className="border rounded-md p-4 mt-4">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-sm font-medium">Select Fields to Include</h3>
                        <Button variant="outline" size="sm" className="h-8">
                          <Plus className="h-3.5 w-3.5 mr-2" /> Add Custom Field
                        </Button>
                      </div>
                      
                      {/* Group fields by their group property */}
                      {Object.entries(
                        selectedFields.reduce((groups, field) => {
                          const group = field.group || 'Other';
                          return {
                            ...groups,
                            [group]: [...(groups[group] || []), field]
                          };
                        }, {} as Record<string, ReportField[]>)
                      ).map(([group, fields]) => (
                        <div key={group} className="space-y-2">
                          <h4 className="text-sm font-medium text-muted-foreground">{group}</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {fields.map(field => (
                              <div key={field.id} className="flex items-center space-x-2">
                                <Checkbox 
                                  id={field.id} 
                                  checked={field.selected}
                                  onCheckedChange={() => toggleFieldSelection(field.id)}
                                />
                                <Label htmlFor={field.id} className="text-sm font-normal cursor-pointer">
                                  {field.name}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="filters" className="border rounded-md p-4 mt-4">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-sm font-medium">Define Filters</h3>
                        <Button variant="outline" size="sm" className="h-8" onClick={addFilter}>
                          <Plus className="h-3.5 w-3.5 mr-2" /> Add Filter
                        </Button>
                      </div>
                      
                      {filters.map((filter, index) => (
                        <div key={index} className="grid grid-cols-3 gap-2 items-center">
                          <Select 
                            value={filter.field} 
                            onValueChange={(value) => updateFilter(index, 'field', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select field" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="date">Date</SelectItem>
                              <SelectItem value="amount">Amount</SelectItem>
                              <SelectItem value="status">Status</SelectItem>
                              <SelectItem value="property">Property</SelectItem>
                            </SelectContent>
                          </Select>
                          
                          <Select 
                            value={filter.operator} 
                            onValueChange={(value) => updateFilter(index, 'operator', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Operator" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="equals">Equals</SelectItem>
                              <SelectItem value="not_equals">Not Equals</SelectItem>
                              <SelectItem value="greater_than">Greater Than</SelectItem>
                              <SelectItem value="less_than">Less Than</SelectItem>
                              <SelectItem value="contains">Contains</SelectItem>
                              <SelectItem value="between">Between</SelectItem>
                            </SelectContent>
                          </Select>
                          
                          <div className="flex gap-2">
                            <Input 
                              placeholder="Value"
                              value={filter.value}
                              onChange={(e) => updateFilter(index, 'value', e.target.value)}
                              className="flex-1"
                            />
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-10 w-10 text-destructive" 
                              onClick={() => removeFilter(index)}
                            >
                              ×
                            </Button>
                          </div>
                        </div>
                      ))}
                      
                      {filters.length === 0 && (
                        <div className="text-center py-4 text-muted-foreground">
                          No filters added. Click "Add Filter" to get started.
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </CardContent>
          </Card>
          
          {isGenerating && (
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="h-12 w-12 rounded-full border-4 border-t-blue-500 border-b-blue-500 border-r-transparent border-l-transparent animate-spin mb-4"></div>
                  <p className="text-lg font-medium">Generating your report...</p>
                  <p className="text-muted-foreground">This may take a few moments</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Saved Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {savedTemplates.map(template => (
                  <div 
                    key={template.id} 
                    className="p-3 border rounded-md hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => {
                      setReportType(template.type);
                      setReportName(template.name);
                      if (template.fields.length > 0) setSelectedFields(template.fields);
                      if (template.filters.length > 0) setFilters(template.filters);
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{template.name}</h4>
                        <p className="text-sm text-muted-foreground">{template.description}</p>
                        {template.lastRun && (
                          <p className="text-xs text-muted-foreground mt-1">Last run: {template.lastRun}</p>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {savedTemplates.length === 0 && (
                  <div className="text-center py-6 text-muted-foreground">
                    No saved templates yet
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Recent Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 border rounded-md hover:bg-muted/50 cursor-pointer transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">April Financial Summary</h4>
                      <p className="text-xs text-muted-foreground">Generated: 2025-04-12</p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="p-3 border rounded-md hover:bg-muted/50 cursor-pointer transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">Q1 Compliance Report</h4>
                      <p className="text-xs text-muted-foreground">Generated: 2025-04-01</p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CustomizableReportBuilder;
