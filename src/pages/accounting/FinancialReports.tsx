
import React, { useState } from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { BarChart2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AssociationSelector from '@/components/associations/AssociationSelector';
import FinancialReportToolbar from '@/components/accounting/FinancialReportToolbar';
import FinancialReportCategories from '@/components/accounting/FinancialReportCategories';
import { ReportCategory } from '@/types/accounting-types';

// Define report categories constant
const reportCategories: ReportCategory[] = [
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
          <FinancialReportToolbar />
          <FinancialReportCategories categories={reportCategories} />
        </CardContent>
      </Card>
    </PageTemplate>
  );
};

export default FinancialReports;
