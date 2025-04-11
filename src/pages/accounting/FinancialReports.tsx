
import React from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { BarChart2, FileText, Download, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AssociationSelector from '@/components/associations/AssociationSelector';
import { useState } from 'react';

const reportCategories = [
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

const FinancialReports = () => {
  const navigate = useNavigate();
  const [selectedAssociationId, setSelectedAssociationId] = useState<string | undefined>();

  const handleAssociationChange = (associationId: string) => {
    setSelectedAssociationId(associationId);
  };

  return (
    <PageTemplate 
      title="Financial Reports" 
      icon={<BarChart2 className="h-8 w-8" />}
      description="Generate and view financial statements and reports."
    >
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>Financial Reports</CardTitle>
              <CardDescription>Generate and analyze financial statements and reports</CardDescription>
            </div>
            <AssociationSelector 
              className="md:self-end" 
              onAssociationChange={handleAssociationChange}
            />
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
            <Button onClick={() => navigate('/records-reports/reports')}>
              <FileText className="h-4 w-4 mr-2" /> All Reports
            </Button>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reportCategories.map((category, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg">{category.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {category.reports.map((report, reportIndex) => (
                      <li key={reportIndex}>
                        <Button 
                          variant="ghost" 
                          className="w-full text-left justify-start h-auto py-2"
                          onClick={() => navigate('/records-reports/reports')}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          <span>{report}</span>
                        </Button>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </PageTemplate>
  );
};

export default FinancialReports;
