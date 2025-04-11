
import React, { useState } from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { LineChart, BarChart3, PieChart, Download, Filter, BarChart2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TooltipButton from '@/components/ui/tooltip-button';
import { Button } from '@/components/ui/button';
import AssociationSelector from '@/components/associations/AssociationSelector';
import FinancialReportCategories from '@/components/accounting/FinancialReportCategories';
import { ReportCategory } from '@/types/accounting-types';

// Mock data for charts
const mockData = {
  financial: {
    months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    income: [12500, 13200, 12900, 14100, 13800, 15000],
    expenses: [10800, 11200, 10500, 12300, 11800, 12500],
  },
  compliance: {
    categories: ['Noise', 'Parking', 'Trash', 'Architectural', 'Pet', 'Other'],
    counts: [24, 38, 15, 12, 8, 5],
  },
  delinquency: {
    hoaNames: ['Oakridge', 'Lakeside', 'Highland', 'Parkview', 'Meadows'],
    rates: [5, 8, 3, 7, 4],
  }
};

// Mock report list
const mockReports = [
  { id: 1, name: 'Monthly Financial Summary', type: 'financial', lastRun: '2025-04-05', schedule: 'Monthly' },
  { id: 2, name: 'Compliance Violations by Type', type: 'compliance', lastRun: '2025-04-01', schedule: 'Weekly' },
  { id: 3, name: 'Delinquency Rate by HOA', type: 'delinquency', lastRun: '2025-04-03', schedule: 'Bi-weekly' },
  { id: 4, name: 'Amenity Usage Analysis', type: 'custom', lastRun: '2025-03-28', schedule: 'Monthly' },
  { id: 5, name: 'Maintenance Request Trends', type: 'custom', lastRun: '2025-04-02', schedule: 'Weekly' },
];

// Define report categories for financial reports
const financialReportCategories: ReportCategory[] = [
  {
    title: "Financial Statements",
    reports: [
      "Balance Sheet",
      "Income Statement",
      "Cash Flow Statement",
      "Statement of Changes in Equity"
    ]
  },
  {
    title: "Budget Reports",
    reports: [
      "Budget vs. Actual",
      "Budget Variance Analysis",
      "Budget Forecast",
      "Annual Budget Overview"
    ]
  },
  {
    title: "Compliance Reports",
    reports: [
      "Aged Receivables",
      "Delinquency Report", 
      "Collection Status",
      "Legal Status Report"
    ]
  }
];

const Reports = () => {
  const [selectedHOA, setSelectedHOA] = useState<string>('all');
  const [selectedReportType, setSelectedReportType] = useState<string>('all');
  const [selectedAssociationId, setSelectedAssociationId] = useState<string>('');

  // Filter reports based on selections
  const filteredReports = mockReports.filter(report => {
    if (selectedReportType !== 'all' && report.type !== selectedReportType) return false;
    return true;
  });

  const handleAssociationChange = (associationId: string) => {
    setSelectedAssociationId(associationId);
    setSelectedHOA(associationId || 'all');
  };

  return (
    <PageTemplate 
      title="Reports" 
      icon={<LineChart className="h-8 w-8" />}
      description="Generate and view reports across your community associations."
    >
      <div className="mt-6 space-y-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="w-full md:w-[250px]">
              <AssociationSelector 
                onAssociationChange={handleAssociationChange}
                initialAssociationId={selectedAssociationId}
                label="Filter by Association"
              />
            </div>
            <div className="w-full md:w-[200px]">
              <Select value={selectedReportType} onValueChange={setSelectedReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Report Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="financial">Financial</SelectItem>
                  <SelectItem value="compliance">Compliance</SelectItem>
                  <SelectItem value="delinquency">Delinquency</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-2">
            <TooltipButton tooltip="Create a new report">
              Create Report
            </TooltipButton>
            <TooltipButton variant="outline" tooltip="Schedule a recurring report">
              Schedule
            </TooltipButton>
          </div>
        </div>
        
        <Tabs defaultValue="charts">
          <TabsList>
            <TabsTrigger value="charts">Charts</TabsTrigger>
            <TabsTrigger value="financial">Financial Reports</TabsTrigger>
            <TabsTrigger value="saved">Saved Reports</TabsTrigger>
            <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
          </TabsList>
          
          <TabsContent value="charts" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Financial Summary Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Financial Summary</CardTitle>
                  <CardDescription>Income vs. Expenses (Last 6 Months)</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px] flex items-center justify-center bg-muted/20">
                  {/* Placeholder for actual chart component */}
                  <div className="text-center">
                    <BarChart3 className="h-16 w-16 mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mt-2">Financial chart will render here</p>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" /> Filter
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" /> Export
                  </Button>
                </CardFooter>
              </Card>
              
              {/* Compliance Summary Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Compliance Summary</CardTitle>
                  <CardDescription>Violations by Category</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px] flex items-center justify-center bg-muted/20">
                  {/* Placeholder for actual chart component */}
                  <div className="text-center">
                    <PieChart className="h-16 w-16 mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mt-2">Compliance chart will render here</p>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" /> Filter
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" /> Export
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="financial">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <CardTitle>Financial Reports</CardTitle>
                    <CardDescription>Generate and analyze financial statements and reports</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3 mb-6">
                  <Button variant="outline">
                    <Filter className="h-4 w-4 mr-2" /> Filter
                  </Button>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" /> Export
                  </Button>
                </div>
                <FinancialReportCategories categories={financialReportCategories} />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="saved">
            <Card>
              <CardHeader>
                <CardTitle>Saved Reports</CardTitle>
                <CardDescription>Access your previously generated reports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="p-3 text-left">Report Name</th>
                        <th className="p-3 text-left">Type</th>
                        <th className="p-3 text-left">Last Run</th>
                        <th className="p-3 text-left">Schedule</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredReports.map((report) => (
                        <tr key={report.id} className="border-b">
                          <td className="p-3">{report.name}</td>
                          <td className="p-3 capitalize">{report.type}</td>
                          <td className="p-3">{report.lastRun}</td>
                          <td className="p-3">{report.schedule}</td>
                          <td className="p-3 text-right">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <LineChart className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="scheduled">
            <Card>
              <CardHeader>
                <CardTitle>Scheduled Reports</CardTitle>
                <CardDescription>Manage your recurring report schedule</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="p-3 text-left">Report Name</th>
                        <th className="p-3 text-left">Type</th>
                        <th className="p-3 text-left">Frequency</th>
                        <th className="p-3 text-left">Recipients</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="p-3">Monthly Financial Summary</td>
                        <td className="p-3">Financial</td>
                        <td className="p-3">Monthly (1st day)</td>
                        <td className="p-3">Board Members</td>
                        <td className="p-3 text-right">
                          <Button variant="ghost" size="sm">Edit</Button>
                          <Button variant="ghost" size="sm">Delete</Button>
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-3">Compliance Violations by Type</td>
                        <td className="p-3">Compliance</td>
                        <td className="p-3">Weekly (Monday)</td>
                        <td className="p-3">Management</td>
                        <td className="p-3 text-right">
                          <Button variant="ghost" size="sm">Edit</Button>
                          <Button variant="ghost" size="sm">Delete</Button>
                        </td>
                      </tr>
                      <tr>
                        <td className="p-3">Delinquency Rate by HOA</td>
                        <td className="p-3">Delinquency</td>
                        <td className="p-3">Bi-weekly</td>
                        <td className="p-3">Finance Team</td>
                        <td className="p-3 text-right">
                          <Button variant="ghost" size="sm">Edit</Button>
                          <Button variant="ghost" size="sm">Delete</Button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageTemplate>
  );
};

export default Reports;
