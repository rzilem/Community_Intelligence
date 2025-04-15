
import React, { useState } from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { LineChart, Download, Filter, BarChart2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import AssociationSelector from '@/components/associations/AssociationSelector';
import FinancialReportCategories from '@/components/accounting/FinancialReportCategories';
import { ReportCategory } from '@/types/accounting-types';
import CustomizableReportBuilder from '@/components/reports/CustomizableReportBuilder';
import { useResponsive } from '@/hooks/use-responsive';

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
  const [selectedAssociationId, setSelectedAssociationId] = useState<string>('');
  const { isMobile } = useResponsive();
  
  const handleAssociationChange = (associationId: string) => {
    setSelectedAssociationId(associationId);
  };

  return (
    <PageTemplate 
      title="Reports" 
      icon={<LineChart className="h-8 w-8" />}
      description="Generate and view reports across your community associations."
    >
      <div className="mt-6 space-y-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="w-full md:w-[250px]">
            <AssociationSelector 
              onAssociationChange={handleAssociationChange}
              initialAssociationId={selectedAssociationId}
              label="Filter by Association"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filter Reports
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export Data
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="builder">
          <TabsList className={`${isMobile ? 'w-full grid grid-cols-3' : ''}`}>
            <TabsTrigger value="builder" className={isMobile ? 'flex-1' : ''}>Report Builder</TabsTrigger>
            <TabsTrigger value="templates" className={isMobile ? 'flex-1' : ''}>Report Templates</TabsTrigger>
            <TabsTrigger value="scheduled" className={isMobile ? 'flex-1' : ''}>Scheduled</TabsTrigger>
          </TabsList>
          
          <TabsContent value="builder">
            <CustomizableReportBuilder />
          </TabsContent>
          
          <TabsContent value="templates">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <CardTitle>Report Templates</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <FinancialReportCategories categories={financialReportCategories} />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="scheduled">
            <Card>
              <CardHeader>
                <CardTitle>Scheduled Reports</CardTitle>
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
